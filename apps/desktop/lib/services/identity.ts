import "server-only";

import { Account, AppwriteException, ID, Users } from "node-appwrite";
import {
  createAppwriteAdminClient,
  createAppwriteSessionClient,
  readAppwriteIntegrationStatus,
} from "@/lib/integrations/appwrite/server";
import type { RemoteIdentityState, RemoteIdentityUser } from "@/lib/types";

const APPWRITE_USER_ID_COOKIE = "building_things_appwrite_user_id";
const APPWRITE_SESSION_ID_COOKIE = "building_things_appwrite_session_id";
const APPWRITE_SESSION_SECRET_COOKIE = "building_things_appwrite_session_secret";

type CookieOptions = {
  expires?: Date;
  httpOnly?: boolean;
  maxAge?: number;
  path?: string;
  sameSite?: "lax" | "strict" | "none";
  secure?: boolean;
};

type MutableCookieStore = {
  get(name: string): { value: string } | undefined;
  set(name: string, value: string, options?: CookieOptions): void;
  delete(name: string): void;
};

interface IdentityModeService {
  getState(): Promise<RemoteIdentityState>;
  connect(): Promise<RemoteIdentityState>;
  disconnect(): Promise<RemoteIdentityState>;
}

function getCookieOptions(expiresAt?: string): CookieOptions {
  const expires = expiresAt ? new Date(expiresAt) : undefined;

  return {
    expires: expires && !Number.isNaN(expires.getTime()) ? expires : undefined,
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  };
}

function toIdentityUser(user: {
  $id: string;
  $createdAt?: string;
  name?: string;
  email?: string;
}): RemoteIdentityUser {
  return {
    id: user.$id,
    label: user.name?.trim() || user.$id,
    email: user.email?.trim() || null,
    created_at: user.$createdAt ?? null,
  };
}

function getAppwriteErrorMessage(error: unknown) {
  if (error instanceof AppwriteException) {
    return error.message || "Appwrite identity request failed.";
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Appwrite identity request failed.";
}

function isAppwriteNotFoundError(error: unknown) {
  return error instanceof AppwriteException && error.code === 404;
}

function buildLocalState(
  warnings: string[] = [],
  error: string | null = null,
): RemoteIdentityState {
  return {
    mode: "local",
    status: "local",
    available: false,
    connected: false,
    session_kind: "none",
    session_id: null,
    message:
      "Appwrite is not configured. The shell is running fully local and SQLite remains the source of truth.",
    user: null,
    warnings,
    error,
  };
}

function buildDisabledState(
  warnings: string[] = [],
  error: string | null = null,
): RemoteIdentityState {
  return {
    mode: "appwrite",
    status: "disabled",
    available: false,
    connected: false,
    session_kind: "none",
    session_id: null,
    message:
      "Appwrite is configured, but identity bootstrap is turned off. The shell continues in local-first mode.",
    user: null,
    warnings,
    error,
  };
}

function buildIncompleteState(
  warnings: string[] = [],
  error: string | null = null,
): RemoteIdentityState {
  return {
    mode: "appwrite",
    status: "incomplete",
    available: false,
    connected: false,
    session_kind: "none",
    session_id: null,
    message:
      "Appwrite identity bootstrap is configured incompletely. Local mode remains active until the missing Appwrite settings are fixed.",
    user: null,
    warnings,
    error,
  };
}

function buildReadyState(
  warnings: string[] = [],
  error: string | null = null,
  message = "Appwrite guest identity bootstrap is available. Starting it will not move workspaces, sessions, files, or messages out of SQLite.",
): RemoteIdentityState {
  return {
    mode: "appwrite",
    status: "ready",
    available: true,
    connected: false,
    session_kind: "none",
    session_id: null,
    message,
    user: null,
    warnings,
    error,
  };
}

function buildConnectedState(input: {
  sessionId: string;
  user: RemoteIdentityUser;
  warnings?: string[];
  error?: string | null;
}): RemoteIdentityState {
  return {
    mode: "appwrite",
    status: "connected",
    available: true,
    connected: true,
    session_kind: "appwrite-managed-guest",
    session_id: input.sessionId,
    message:
      "A managed Appwrite guest session is active. Local SQLite persistence remains primary.",
    user: input.user,
    warnings: input.warnings ?? [],
    error: input.error ?? null,
  };
}

function buildErrorState(
  error: string,
  warnings: string[] = [],
): RemoteIdentityState {
  return {
    mode: "appwrite",
    status: "error",
    available: true,
    connected: false,
    session_kind: "none",
    session_id: null,
    message:
      "Appwrite identity bootstrap failed. Local mode is still available and unchanged.",
    user: null,
    warnings,
    error,
  };
}

class LocalIdentityModeService implements IdentityModeService {
  async getState() {
    return buildLocalState();
  }

  async connect() {
    return buildLocalState();
  }

  async disconnect() {
    return buildLocalState();
  }
}

class AppwriteIdentityModeService implements IdentityModeService {
  constructor(private readonly cookieStore: MutableCookieStore) {}

  private clearSessionCookies() {
    this.cookieStore.delete(APPWRITE_SESSION_ID_COOKIE);
    this.cookieStore.delete(APPWRITE_SESSION_SECRET_COOKIE);
  }

  private getStoredUserId() {
    return this.cookieStore.get(APPWRITE_USER_ID_COOKIE)?.value?.trim() || null;
  }

  private getStoredSessionId() {
    return this.cookieStore.get(APPWRITE_SESSION_ID_COOKIE)?.value?.trim() || null;
  }

  private getStoredSessionSecret() {
    return (
      this.cookieStore.get(APPWRITE_SESSION_SECRET_COOKIE)?.value?.trim() || null
    );
  }

  private setStoredUserId(userId: string) {
    this.cookieStore.set(APPWRITE_USER_ID_COOKIE, userId, {
      ...getCookieOptions(),
      maxAge: 60 * 60 * 24 * 365,
    });
  }

  private setStoredSession(session: { $id: string; expire: string; secret: string }) {
    const cookieOptions = getCookieOptions(session.expire);
    this.cookieStore.set(APPWRITE_SESSION_ID_COOKIE, session.$id, cookieOptions);
    this.cookieStore.set(
      APPWRITE_SESSION_SECRET_COOKIE,
      session.secret,
      cookieOptions,
    );
  }

  private getIntegrationState() {
    return readAppwriteIntegrationStatus();
  }

  private getBaseState() {
    const integrationState = this.getIntegrationState();

    if (!integrationState.enabled) {
      return buildLocalState();
    }

    if (!integrationState.auth.enabled) {
      return buildDisabledState(integrationState.auth.warnings);
    }

    if (!integrationState.auth.configured) {
      return buildIncompleteState(
        integrationState.auth.warnings,
        integrationState.auth.error,
      );
    }

    return buildReadyState(integrationState.auth.warnings);
  }

  private async ensureGuestUser() {
    const users = new Users(createAppwriteAdminClient());
    const storedUserId = this.getStoredUserId();

    if (storedUserId) {
      try {
        return await users.get(storedUserId);
      } catch (error) {
        if (!isAppwriteNotFoundError(error)) {
          throw error;
        }
      }
    }

    const userId = storedUserId || ID.unique();
    const guestName = `Building.Things Guest ${userId.slice(0, 8)}`;
    const user = await users.create({
      userId,
      name: guestName,
    });

    this.setStoredUserId(user.$id);
    return user;
  }

  async getState() {
    const baseState = this.getBaseState();

    if (baseState.status !== "ready") {
      this.clearSessionCookies();
      return baseState;
    }

    const sessionId = this.getStoredSessionId();
    const sessionSecret = this.getStoredSessionSecret();

    if (!sessionId || !sessionSecret) {
      return baseState;
    }

    try {
      const account = new Account(createAppwriteSessionClient(sessionSecret));
      const user = await account.get();

      return buildConnectedState({
        sessionId,
        user: toIdentityUser(user),
        warnings: baseState.warnings,
      });
    } catch {
      this.clearSessionCookies();

      return buildReadyState(
        [
          ...baseState.warnings,
          "The stored Appwrite session could not be validated and has been cleared.",
        ],
        null,
      );
    }
  }

  async connect() {
    const currentState = await this.getState();

    if (currentState.status === "connected") {
      return currentState;
    }

    if (!currentState.available) {
      return currentState;
    }

    try {
      const user = await this.ensureGuestUser();
      const users = new Users(createAppwriteAdminClient());
      const session = await users.createSession({ userId: user.$id });

      this.setStoredSession(session);

      return buildConnectedState({
        sessionId: session.$id,
        user: toIdentityUser(user),
        warnings: [
          ...currentState.warnings,
          "This guest session only adds a remote identity layer. Workspace data remains local in this pass.",
        ],
      });
    } catch (error) {
      this.clearSessionCookies();
      return buildErrorState(getAppwriteErrorMessage(error), currentState.warnings);
    }
  }

  async disconnect() {
    const currentState = this.getBaseState();

    if (currentState.status !== "ready") {
      this.clearSessionCookies();
      return currentState;
    }

    const storedUserId = this.getStoredUserId();
    const storedSessionId = this.getStoredSessionId();

    try {
      if (storedUserId && storedSessionId) {
        const users = new Users(createAppwriteAdminClient());
        await users.deleteSession({
          userId: storedUserId,
          sessionId: storedSessionId,
        });
      }
    } catch (error) {
      if (!(error instanceof AppwriteException && error.code === 404)) {
        this.clearSessionCookies();
        return buildErrorState(getAppwriteErrorMessage(error), currentState.warnings);
      }
    }

    this.clearSessionCookies();

    return buildReadyState(
      currentState.warnings,
      null,
      "The managed Appwrite guest session was disconnected. Local SQLite persistence remains primary.",
    );
  }
}

function resolveIdentityModeService(cookieStore: MutableCookieStore) {
  const integrationState = readAppwriteIntegrationStatus();

  if (!integrationState.enabled) {
    return new LocalIdentityModeService();
  }

  return new AppwriteIdentityModeService(cookieStore);
}

export async function getRemoteIdentityState(cookieStore: MutableCookieStore) {
  return resolveIdentityModeService(cookieStore).getState();
}

export async function connectRemoteIdentity(cookieStore: MutableCookieStore) {
  return resolveIdentityModeService(cookieStore).connect();
}

export async function disconnectRemoteIdentity(cookieStore: MutableCookieStore) {
  return resolveIdentityModeService(cookieStore).disconnect();
}
