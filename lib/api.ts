import {
  ApiErrorResponseSchema,
  ChatRequestSchema,
  ChatStreamChunkSchema,
  ProviderInfoListResponseSchema,
  ProviderOllamaModelsResponseSchema,
} from "@/lib/api-zod";

const API_URL_OVERRIDE = process.env.EXPO_PUBLIC_API_URL?.trim() ?? "";
const DEV_DOMAIN = process.env.EXPO_PUBLIC_DOMAIN?.trim() ?? "";

type ApiParser<T> = {
  parse: (value: unknown) => T;
};

export class ApiClientError extends Error {
  readonly status: number;
  readonly payload: unknown;

  constructor(message: string, status: number, payload: unknown) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.payload = payload;
  }
}

export type ProviderListResponse = ReturnType<
  typeof ProviderInfoListResponseSchema.parse
>;
export type ProviderInfo = ProviderListResponse["providers"][number];
export type ProviderOllamaModelsResponse = ReturnType<
  typeof ProviderOllamaModelsResponseSchema.parse
>;
export type ChatRequest = ReturnType<typeof ChatRequestSchema.parse>;
export type ChatStreamChunk = ReturnType<typeof ChatStreamChunkSchema.parse>;

type JsonRequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
};

function withTrailingSlash(url: string) {
  return url.endsWith("/") ? url : `${url}/`;
}

export function getApiUrl(): string {
  if (API_URL_OVERRIDE) {
    return withTrailingSlash(API_URL_OVERRIDE);
  }

  if (DEV_DOMAIN) {
    return `https://${DEV_DOMAIN}/api/`;
  }

  if (typeof globalThis.location?.origin === "string") {
    return new URL("/api/", globalThis.location.origin).toString();
  }

  return "http://localhost/api/";
}

function buildApiUrl(
  path: string,
  searchParams?: Record<string, string | undefined>,
) {
  const url = new URL(path.replace(/^\//, ""), getApiUrl());

  if (searchParams) {
    for (const [key, value] of Object.entries(searchParams)) {
      if (value) {
        url.searchParams.set(key, value);
      }
    }
  }

  return url.toString();
}

async function parseErrorResponse(response: Response) {
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    const payload = await response.json();
    const parsedError = ApiErrorResponseSchema.safeParse(payload);

    if (parsedError.success) {
      return {
        message: parsedError.data.error,
        payload,
      };
    }

    return {
      message: response.statusText || "Request failed",
      payload,
    };
  }

  const text = await response.text();
  return {
    message: text || response.statusText || "Request failed",
    payload: text,
  };
}

async function apiRequest<T>(
  path: string,
  schema: ApiParser<T>,
  options: JsonRequestOptions = {},
) {
  const headers = new Headers(options.headers);
  const hasBody = options.body !== undefined;

  if (hasBody && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(buildApiUrl(path), {
    ...options,
    body: hasBody ? JSON.stringify(options.body) : undefined,
    headers,
  });

  if (!response.ok) {
    const { message, payload } = await parseErrorResponse(response);
    throw new ApiClientError(message, response.status, payload);
  }

  const data = await response.json();
  return schema.parse(data);
}

export async function getProviders() {
  return apiRequest("providers", ProviderInfoListResponseSchema);
}

export async function getOllamaModels(endpoint?: string) {
  const response = await fetch(
    buildApiUrl("providers/ollama/models", { endpoint }),
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    },
  );

  if (!response.ok) {
    const { message, payload } = await parseErrorResponse(response);
    throw new ApiClientError(message, response.status, payload);
  }

  const data = await response.json();
  return ProviderOllamaModelsResponseSchema.parse(data);
}

export async function streamChat(
  payload: ChatRequest,
  onChunk: (chunk: ChatStreamChunk) => void,
) {
  const body = ChatRequestSchema.parse(payload);
  const response = await fetch(buildApiUrl("chat"), {
    method: "POST",
    headers: {
      Accept: "text/event-stream",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const { message, payload: errorPayload } = await parseErrorResponse(response);
    throw new ApiClientError(message, response.status, errorPayload);
  }

  if (!response.body) {
    throw new ApiClientError("Streaming response body was not available.", 500, null);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();

    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true });
    const events = buffer.split("\n\n");
    buffer = events.pop() ?? "";

    for (const event of events) {
      const lines = event
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);

      for (const line of lines) {
        if (!line.startsWith("data:")) {
          continue;
        }

        const payloadText = line.slice(5).trim();

        if (payloadText === "[DONE]") {
          return;
        }

        const payloadJson = JSON.parse(payloadText);
        const parsedChunk = ChatStreamChunkSchema.parse(payloadJson);
        onChunk(parsedChunk);
      }
    }
  }
}
