import OpenAI from "openai";

function extractErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  return "Unknown error";
}

export type ProviderID =
  | "openai"
  | "anthropic"
  | "gemini"
  | "ollama"
  | "custom";

export type ProviderConfig = {
  id: ProviderID;
  name: string;
  models: string[];
  defaultModel: string;
  baseUrlEnv?: string;
  apiKeyEnv?: string;
  defaultBaseUrl?: string;
  supportsModelDiscovery?: boolean;
};

const PROVIDER_CONFIGS: ProviderConfig[] = [
  {
    id: "openai",
    name: "OpenAI",
    models: ["gpt-5.2", "gpt-4.1", "gpt-4.1-mini", "gpt-4.1-nano", "gpt-4o", "gpt-4o-mini", "o3-mini"],
    defaultModel: "gpt-5.2",
    baseUrlEnv: "AI_INTEGRATIONS_OPENAI_BASE_URL",
    apiKeyEnv: "AI_INTEGRATIONS_OPENAI_API_KEY",
  },
  {
    id: "anthropic",
    name: "Anthropic",
    models: ["claude-sonnet-4-20250514", "claude-opus-4-20250514", "claude-haiku-3-5-20241022"],
    defaultModel: "claude-sonnet-4-20250514",
    baseUrlEnv: "ANTHROPIC_BASE_URL",
    apiKeyEnv: "ANTHROPIC_API_KEY",
    defaultBaseUrl: "https://api.anthropic.com/v1/",
  },
  {
    id: "gemini",
    name: "Google Gemini",
    models: ["gemini-2.5-pro", "gemini-2.5-flash", "gemini-2.0-flash"],
    defaultModel: "gemini-2.5-flash",
    baseUrlEnv: "GEMINI_BASE_URL",
    apiKeyEnv: "GEMINI_API_KEY",
    defaultBaseUrl: "https://generativelanguage.googleapis.com/v1beta/openai/",
  },
  {
    id: "ollama",
    name: "Ollama",
    models: ["llama3.1", "llama3", "mistral", "codellama", "phi3", "gemma2"],
    defaultModel: "llama3.1",
    baseUrlEnv: "OLLAMA_BASE_URL",
    defaultBaseUrl: "http://localhost:11434/v1",
    supportsModelDiscovery: true,
  },
  {
    id: "custom",
    name: "Custom (OpenAI-compatible)",
    models: [],
    defaultModel: "",
    baseUrlEnv: "CUSTOM_LLM_BASE_URL",
    apiKeyEnv: "CUSTOM_LLM_API_KEY",
    defaultBaseUrl: "http://localhost:8080/v1",
  },
];

export function getProviderConfigs(): ProviderConfig[] {
  return PROVIDER_CONFIGS;
}

export function getProviderConfig(id: ProviderID): ProviderConfig | undefined {
  return PROVIDER_CONFIGS.find((p) => p.id === id);
}

const LOCALHOST_HOSTS = new Set([
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "::1",
]);

function isLocalhostOnly(hostname: string): boolean {
  return LOCALHOST_HOSTS.has(hostname);
}

function isPrivateNetwork(hostname: string): boolean {
  if (LOCALHOST_HOSTS.has(hostname)) return true;
  if (hostname === "host.docker.internal") return true;
  if (hostname === "host.containers.internal") return true;
  if (hostname.startsWith("192.168.")) return true;
  if (hostname.startsWith("10.")) return true;
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(hostname)) return true;
  if (hostname.endsWith(".local")) return true;
  return false;
}

export function isAllowedEndpoint(url: string): boolean {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.toLowerCase();
    const allowPrivateNet = process.env.ALLOW_PRIVATE_NETWORK_ENDPOINTS === "true";
    return allowPrivateNet ? isPrivateNetwork(hostname) : isLocalhostOnly(hostname);
  } catch {
    return false;
  }
}

function resolveBaseUrl(config: ProviderConfig, customEndpoint?: string): string | undefined {
  if (customEndpoint) {
    if (!isAllowedEndpoint(customEndpoint)) {
      throw new Error("Custom endpoints must point to localhost or private network addresses");
    }
    return customEndpoint;
  }
  if (config.baseUrlEnv && process.env[config.baseUrlEnv]) {
    return process.env[config.baseUrlEnv];
  }
  return config.defaultBaseUrl;
}

function resolveApiKey(config: ProviderConfig): string | undefined {
  if (config.apiKeyEnv && process.env[config.apiKeyEnv]) {
    return process.env[config.apiKeyEnv];
  }
  return undefined;
}

export type ProviderStatus = "ready" | "needs_config" | "needs_endpoint";

export function getProviderStatus(config: ProviderConfig): ProviderStatus {
  const id = config.id as string;

  if (id === "custom") {
    return "needs_endpoint";
  }

  const baseUrl = resolveBaseUrl(config);
  if (!baseUrl) return id === "ollama" ? "needs_endpoint" : "needs_config";

  if (config.apiKeyEnv) {
    const key = resolveApiKey(config);
    if (!key) return "needs_config";
  }

  return "ready";
}

const ENDPOINT_OVERRIDE_PROVIDERS = new Set<ProviderID>(["ollama", "custom"]);

export function createProviderClient(
  providerId: ProviderID,
  customEndpoint?: string
): OpenAI {
  const config = getProviderConfig(providerId);
  if (!config) {
    throw new Error(`Unknown provider: ${providerId}`);
  }

  const safeEndpoint = ENDPOINT_OVERRIDE_PROVIDERS.has(providerId)
    ? customEndpoint
    : undefined;

  const baseURL = resolveBaseUrl(config, safeEndpoint);
  if (!baseURL) {
    throw new Error(`No base URL configured for provider: ${config.name}`);
  }

  const apiKey = resolveApiKey(config);

  return new OpenAI({
    apiKey: apiKey || "ollama",
    baseURL,
  });
}

export type ProviderInfo = {
  id: ProviderID;
  name: string;
  models: string[];
  defaultModel: string;
  status: ProviderStatus;
  supportsModelDiscovery: boolean;
  requiresEndpoint: boolean;
};

export function getProviderInfoList(): ProviderInfo[] {
  return PROVIDER_CONFIGS.map((config) => ({
    id: config.id,
    name: config.name,
    models: config.models,
    defaultModel: config.defaultModel,
    status: getProviderStatus(config),
    supportsModelDiscovery: config.supportsModelDiscovery ?? false,
    requiresEndpoint: config.id === "ollama" || config.id === "custom",
  }));
}

export async function discoverOllamaModels(
  endpoint?: string
): Promise<string[]> {
  const baseUrl = endpoint || process.env.OLLAMA_BASE_URL || "http://localhost:11434";
  const tagsUrl = baseUrl.replace(/\/v1\/?$/, "").replace(/\/$/, "") + "/api/tags";

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const resp = await fetch(tagsUrl, { signal: controller.signal });
    clearTimeout(timeout);

    if (!resp.ok) return [];

    const data = (await resp.json()) as {
      models?: Array<{ name: string }>;
    };
    return (data.models ?? []).map((m) => m.name);
  } catch {
    return [];
  }
}

export async function checkProviderConnectivity(
  providerId: ProviderID,
  customEndpoint?: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    const client = createProviderClient(providerId, customEndpoint);
    const resp = await client.models.list();
    const models: string[] = [];
    for await (const m of resp) {
      models.push(m.id);
      if (models.length >= 1) break;
    }
    return { ok: true };
  } catch (err: unknown) {
    if (providerId === "ollama") {
      const ollamaModels = await discoverOllamaModels(customEndpoint);
      if (ollamaModels.length > 0) return { ok: true };
    }
    return { ok: false, error: extractErrorMessage(err) };
  }
}
