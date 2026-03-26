import "server-only";

import { AppwriteException, Client, Health } from "node-appwrite";
import type {
  AppwriteAuthCapability,
  AppwriteAuthMode,
  AppwriteIntegrationStatus,
} from "@/lib/types";

type AppwriteEnvironmentConfig = {
  endpoint: string | null;
  projectId: string | null;
  apiKey: string | null;
  authMode: AppwriteAuthMode | null;
  authModeInput: string | null;
};

const HEALTH_PROBE_WARNING =
  "The health probe only verifies endpoint reachability. Project permissions and remote data access are still out of scope in this pass.";

function readTrimmedEnvValue(value: string | undefined) {
  const trimmedValue = value?.trim();
  return trimmedValue ? trimmedValue : null;
}

function readAppwriteEnvironmentConfig(): AppwriteEnvironmentConfig {
  const authModeInput = readTrimmedEnvValue(process.env.APPWRITE_AUTH_MODE);

  return {
    endpoint: readTrimmedEnvValue(process.env.APPWRITE_ENDPOINT),
    projectId: readTrimmedEnvValue(process.env.APPWRITE_PROJECT_ID),
    apiKey: readTrimmedEnvValue(process.env.APPWRITE_API_KEY),
    authMode: normalizeAuthMode(authModeInput),
    authModeInput,
  };
}

function hasAnyAppwriteEnvironmentValue(config: AppwriteEnvironmentConfig) {
  return Boolean(
    config.endpoint ||
      config.projectId ||
      config.apiKey ||
      (config.authModeInput && config.authModeInput.toLowerCase() !== "off"),
  );
}

function normalizeAuthMode(value: string | null): AppwriteAuthMode | null {
  if (!value) {
    return null;
  }

  const normalizedValue = value.toLowerCase();

  if (normalizedValue === "off" || normalizedValue === "anonymous") {
    return normalizedValue;
  }

  return null;
}

function buildBaseStatus(config: AppwriteEnvironmentConfig) {
  const warnings: string[] = [];
  let canProbe = false;

  if (!hasAnyAppwriteEnvironmentValue(config)) {
    return {
      status: "disabled" as const,
      canProbe,
      warnings,
    };
  }

  if (!config.endpoint) {
    warnings.push("APPWRITE_ENDPOINT is not set.");
  } else {
    try {
      const parsedEndpoint = new URL(config.endpoint);

      if (!["http:", "https:"].includes(parsedEndpoint.protocol)) {
        warnings.push("APPWRITE_ENDPOINT must use http or https.");
      }
    } catch {
      warnings.push("APPWRITE_ENDPOINT is set but is not a valid URL.");
    }
  }

  if (!config.projectId) {
    warnings.push("APPWRITE_PROJECT_ID is not set.");
  }

  canProbe = warnings.length === 0;

  return {
    status: canProbe ? ("configured" as const) : ("incomplete" as const),
    canProbe,
    warnings,
  };
}

function buildAuthCapability(
  config: AppwriteEnvironmentConfig,
  canProbe: boolean,
): AppwriteAuthCapability {
  const warnings: string[] = [];

  if (!config.authModeInput || config.authMode === "off") {
    return {
      mode: "off",
      enabled: false,
      configured: false,
      status: "disabled",
      warnings,
      error: null,
    };
  }

  if (!config.authMode) {
    warnings.push("APPWRITE_AUTH_MODE must be either 'off' or 'anonymous'.");

    return {
      mode: "off",
      enabled: true,
      configured: false,
      status: "incomplete",
      warnings,
      error: "Invalid Appwrite auth mode.",
    };
  }

  if (!canProbe || !config.apiKey) {
    const missingSettings = [
      !config.endpoint ? "APPWRITE_ENDPOINT" : null,
      !config.projectId ? "APPWRITE_PROJECT_ID" : null,
      !config.apiKey ? "APPWRITE_API_KEY" : null,
    ].filter(Boolean);

    warnings.push(
      missingSettings.length > 0
        ? `APPWRITE_AUTH_MODE=anonymous requires ${missingSettings.join(", ")}.`
        : "APPWRITE_AUTH_MODE=anonymous requires a valid APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID, and APPWRITE_API_KEY.",
    );

    return {
      mode: config.authMode,
      enabled: true,
      configured: false,
      status: "incomplete",
      warnings,
      error: null,
    };
  }

  warnings.push(
    "Anonymous Appwrite sessions must be enabled in the target Appwrite project.",
  );

  return {
    mode: config.authMode,
    enabled: true,
    configured: true,
    status: "ready",
    warnings,
    error: null,
  };
}

function createClient(config: AppwriteEnvironmentConfig) {
  if (!config.endpoint || !config.projectId) {
    throw new Error("Appwrite is not fully configured.");
  }

  const client = new Client()
    .setEndpoint(config.endpoint)
    .setProject(config.projectId);

  if (config.apiKey) {
    client.setKey(config.apiKey);
  }

  return client;
}

function createSessionClient(
  config: AppwriteEnvironmentConfig,
  sessionSecret: string,
) {
  if (!config.endpoint || !config.projectId) {
    throw new Error("Appwrite endpoint or project is missing.");
  }

  const normalizedSessionSecret = sessionSecret.trim();

  if (!normalizedSessionSecret) {
    throw new Error("Appwrite session secret is missing.");
  }

  return new Client()
    .setEndpoint(config.endpoint)
    .setProject(config.projectId)
    .setSession(normalizedSessionSecret);
}

function getErrorMessage(error: unknown) {
  if (error instanceof AppwriteException) {
    return error.message || "Appwrite request failed.";
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Appwrite request failed.";
}

export function readAppwriteIntegrationStatus(): AppwriteIntegrationStatus {
  const config = readAppwriteEnvironmentConfig();
  const baseStatus = buildBaseStatus(config);
  const auth = buildAuthCapability(config, baseStatus.canProbe);
  const status =
    baseStatus.status === "configured" && auth.status !== "incomplete"
      ? "configured"
      : baseStatus.status;

  return {
    enabled: hasAnyAppwriteEnvironmentValue(config),
    can_probe: baseStatus.canProbe,
    status,
    connection_status: "unchecked",
    endpoint: config.endpoint,
    project_id: config.projectId,
    has_api_key: Boolean(config.apiKey),
    latency_ms: null,
    auth,
    warnings: baseStatus.warnings,
    error: null,
  };
}

export function createAppwriteAdminClient() {
  const config = readAppwriteEnvironmentConfig();

  if (!config.apiKey) {
    throw new Error("APPWRITE_API_KEY is not set.");
  }

  return createClient(config);
}

export function createAppwriteSessionClient(sessionSecret: string) {
  return createSessionClient(readAppwriteEnvironmentConfig(), sessionSecret);
}

export async function probeAppwriteIntegrationStatus() {
  const config = readAppwriteEnvironmentConfig();
  const baseStatus = readAppwriteIntegrationStatus();

  if (!baseStatus.can_probe) {
    return baseStatus;
  }

  try {
    const health = new Health(createClient(config));
    const result = await health.get();
    const isReachable = result.status === "pass";
    const status = isReachable
      ? baseStatus.status === "configured"
        ? "ready"
        : baseStatus.status
      : "error";

    return {
      ...baseStatus,
      status,
      connection_status: isReachable ? "reachable" : "unreachable",
      latency_ms: typeof result.ping === "number" ? result.ping : null,
      warnings: Array.from(new Set([...baseStatus.warnings, HEALTH_PROBE_WARNING])),
      error: isReachable
        ? null
        : "The Appwrite health probe did not report a passing status.",
    } satisfies AppwriteIntegrationStatus;
  } catch (error) {
    return {
      ...baseStatus,
      status: "error",
      connection_status: "unreachable",
      warnings: Array.from(new Set([...baseStatus.warnings, HEALTH_PROBE_WARNING])),
      error: getErrorMessage(error),
    } satisfies AppwriteIntegrationStatus;
  }
}
