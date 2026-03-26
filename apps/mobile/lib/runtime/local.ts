import { Platform } from "react-native";

import type {
  ActiveRuntimeKind,
  RuntimeEndpoint,
} from "@/lib/storage/types";

export type LocalRuntimeStatus =
  | "available"
  | "empty"
  | "unsupported"
  | "unreachable";

export type LocalRuntimeModel = {
  name: string;
};

export type LocalRuntimeCandidate = {
  id: string;
  name: string;
  baseUrl: string;
  editable: boolean;
  notes?: string;
  source: "builtin" | "saved";
  sortIndex: number;
};

export type LocalRuntimeResult = LocalRuntimeCandidate & {
  status: LocalRuntimeStatus;
  runtimeKind?: ActiveRuntimeKind;
  models: LocalRuntimeModel[];
  message: string;
};

export type LocalRuntimeChoice = {
  key: string;
  runtimeId: string;
  runtimeName: string;
  baseUrl: string;
  modelName: string;
  runtimeKind: "ollama-compatible";
  source: "builtin" | "saved";
};

const COMMON_LOCAL_RUNTIME_BASE_URLS = [
  "http://localhost:11434/api",
  "http://127.0.0.1:11434/api",
  "http://localhost:11343/api",
  "http://127.0.0.1:11343/api",
] as const;

const ANDROID_EMULATOR_RUNTIME_BASE_URLS = [
  "http://10.0.2.2:11434/api",
  "http://10.0.2.2:11343/api",
] as const;
const LOCAL_RUNTIME_TIMEOUT_MS = 1600;

function trimTrailingSlash(value: string) {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

function statusRank(status: LocalRuntimeStatus) {
  switch (status) {
    case "available":
      return 4;
    case "empty":
      return 3;
    case "unsupported":
      return 2;
    case "unreachable":
      return 1;
    default:
      return 0;
  }
}

function isOllamaTagsPayload(
  payload: unknown,
): payload is {
  models: Array<{
    name?: unknown;
  }>;
} {
  if (typeof payload !== "object" || payload === null) {
    return false;
  }

  if (!("models" in payload)) {
    return false;
  }

  return Array.isArray(payload.models);
}

function withFallbackName(baseUrl: string) {
  try {
    const url = new URL(baseUrl);
    return `Saved runtime ${url.hostname}:${url.port || "80"}`;
  } catch {
    return "Saved runtime";
  }
}

function dedupeBuiltIns(results: LocalRuntimeResult[]) {
  const builtIns = results.filter((result) => result.source === "builtin");
  const saved = results.filter((result) => result.source === "saved");
  const grouped = new Map<string, LocalRuntimeResult>();

  for (const result of builtIns) {
    const url = new URL(result.baseUrl);
    const groupKey =
      url.hostname === "localhost" || url.hostname === "127.0.0.1"
        ? `${url.protocol}//${url.port}${url.pathname}`
        : result.baseUrl;
    const existing = grouped.get(groupKey);

    if (!existing) {
      grouped.set(groupKey, result);
      continue;
    }

    const shouldReplace =
      statusRank(result.status) > statusRank(existing.status) ||
      (statusRank(result.status) === statusRank(existing.status) &&
        existing.baseUrl.includes("127.0.0.1") &&
        result.baseUrl.includes("localhost"));

    if (shouldReplace) {
      grouped.set(groupKey, {
        ...result,
        sortIndex: Math.min(result.sortIndex, existing.sortIndex),
      });
    }
  }

  return [...grouped.values(), ...saved].sort(
    (left, right) => left.sortIndex - right.sortIndex,
  );
}

export function getDefaultLocalRuntimeBaseUrls() {
  if (Platform.OS === "android") {
    return [...COMMON_LOCAL_RUNTIME_BASE_URLS, ...ANDROID_EMULATOR_RUNTIME_BASE_URLS];
  }

  return [...COMMON_LOCAL_RUNTIME_BASE_URLS];
}

export function normalizeRuntimeBaseUrl(input: string) {
  const trimmed = input.trim();

  if (!trimmed) {
    return null;
  }

  const withProtocol = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `http://${trimmed}`;

  try {
    const url = new URL(withProtocol);

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return null;
    }

    let pathname = url.pathname.replace(/\/+$/, "");

    if (!pathname || pathname === "/") {
      pathname = "/api";
    } else if (pathname.endsWith("/api/tags")) {
      pathname = pathname.slice(0, -"/tags".length);
    } else if (pathname.endsWith("/tags")) {
      pathname = pathname.slice(0, -"/tags".length);
    } else if (!pathname.endsWith("/api")) {
      pathname = `${pathname}/api`;
    }

    url.pathname = pathname;
    url.search = "";
    url.hash = "";

    return trimTrailingSlash(url.toString());
  } catch {
    return null;
  }
}

export function createLocalRuntimeChoiceKey(baseUrl: string, modelName: string) {
  return `${baseUrl}::${modelName}`;
}

export function buildLocalRuntimeCandidates(savedEndpoints: RuntimeEndpoint[]) {
  const candidatesByUrl = new Map<string, LocalRuntimeCandidate>();

  getDefaultLocalRuntimeBaseUrls().forEach((baseUrl, index) => {
    candidatesByUrl.set(baseUrl, {
      id: `builtin-${index}`,
      name: `Local runtime ${new URL(baseUrl).host}`,
      baseUrl,
      editable: false,
      source: "builtin",
      sortIndex: index,
    });
  });

  savedEndpoints.forEach((endpoint, index) => {
    const normalizedBaseUrl = normalizeRuntimeBaseUrl(endpoint.baseUrl);

    if (!normalizedBaseUrl) {
      return;
    }

    candidatesByUrl.set(normalizedBaseUrl, {
      id: endpoint.id,
      name: endpoint.name.trim() || withFallbackName(normalizedBaseUrl),
      baseUrl: normalizedBaseUrl,
      editable: true,
      notes: endpoint.notes?.trim() || undefined,
      source: "saved",
      sortIndex: getDefaultLocalRuntimeBaseUrls().length + index,
    });
  });

  return [...candidatesByUrl.values()].sort(
    (left, right) => left.sortIndex - right.sortIndex,
  );
}

export async function discoverLocalRuntimes(
  savedEndpoints: RuntimeEndpoint[],
  probeEndpoint: (baseUrl: string) => Promise<string[]>,
) {
  const candidates = buildLocalRuntimeCandidates(savedEndpoints);

  const results = await Promise.all(
    candidates.map(async (candidate) => {
      try {
        const models = await probeEndpoint(candidate.baseUrl);
        const normalizedModels = models
          .map((model) => model.trim())
          .filter(Boolean)
          .map((model) => ({ name: model }));

        return {
          ...candidate,
          status:
            normalizedModels.length > 0
              ? ("available" as const)
              : ("empty" as const),
          runtimeKind: "ollama-compatible" as const,
          models: normalizedModels,
          message:
            normalizedModels.length > 0
              ? `${normalizedModels.length} model${normalizedModels.length === 1 ? "" : "s"} discovered from this runtime.`
              : "This endpoint responded, but it returned no models.",
        } satisfies LocalRuntimeResult;
      } catch (error) {
        const message =
          error instanceof Error && error.message
            ? error.message
            : "This runtime could not be reached from the current app session.";
        const normalizedMessage = message.toLowerCase();
        const status: LocalRuntimeStatus =
          normalizedMessage.includes("unsupported") ||
          normalizedMessage.includes("not ollama")
            ? "unsupported"
            : "unreachable";

        return {
          ...candidate,
          status,
          models: [],
          message,
        } satisfies LocalRuntimeResult;
      }
    }),
  );

  return dedupeBuiltIns(results);
}

export async function probeLocalRuntimeModels(
  baseUrl: string,
  fetchImpl: typeof fetch = globalThis.fetch,
) {
  const controller = new AbortController();
  const timeoutId = globalThis.setTimeout(
    () => controller.abort(),
    LOCAL_RUNTIME_TIMEOUT_MS,
  );

  try {
    const response = await fetchImpl(`${baseUrl}/tags`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(
        response.status === 404
          ? "Reached this address, but it did not respond like an Ollama-compatible /api/tags endpoint."
          : `Reached this address, but it replied with HTTP ${response.status}.`,
      );
    }

    const payload = (await response.json()) as unknown;

    if (!isOllamaTagsPayload(payload)) {
      throw new Error(
        "Reached this address, but it did not return the JSON shape expected from an Ollama-compatible runtime.",
      );
    }

    return payload.models
      .map((model) =>
        typeof model.name === "string" && model.name.trim()
          ? model.name.trim()
          : null,
      )
      .filter((model): model is string => model !== null);
  } catch (error) {
    const errorName =
      typeof error === "object" &&
      error !== null &&
      "name" in error &&
      typeof error.name === "string"
        ? error.name
        : "";

    if (errorName === "AbortError") {
      throw new Error("This device timed out while probing the endpoint.");
    }

    if (error instanceof Error) {
      throw error;
    }

    throw new Error("Could not reach this endpoint from the current app session.");
  } finally {
    globalThis.clearTimeout(timeoutId);
  }
}

export function flattenLocalRuntimeChoices(results: LocalRuntimeResult[]) {
  return results.flatMap((result) => {
    if (result.status !== "available" || result.runtimeKind !== "ollama-compatible") {
      return [];
    }

    return result.models.map((model) => ({
      key: createLocalRuntimeChoiceKey(result.baseUrl, model.name),
      runtimeId: result.id,
      runtimeName: result.name,
      baseUrl: result.baseUrl,
      modelName: model.name,
      runtimeKind: "ollama-compatible" as const,
      source: result.source,
    }));
  });
}
