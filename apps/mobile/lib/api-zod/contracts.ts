import * as zod from "zod";

export const ProviderIdSchema = zod.enum([
  "openai",
  "anthropic",
  "gemini",
  "ollama",
  "custom",
]);

export const ProviderStatusSchema = zod.enum([
  "ready",
  "needs_config",
  "needs_endpoint",
]);

export const ProviderInfoSchema = zod.object({
  id: ProviderIdSchema,
  name: zod.string(),
  models: zod.array(zod.string()),
  defaultModel: zod.string(),
  status: ProviderStatusSchema,
  supportsModelDiscovery: zod.boolean(),
  requiresEndpoint: zod.boolean(),
});

export const ProviderInfoListResponseSchema = zod.object({
  providers: zod.array(ProviderInfoSchema),
});

export const ProviderCheckRequestSchema = zod.object({
  provider: ProviderIdSchema,
  customEndpoint: zod.string().optional(),
});

export const ProviderCheckResponseSchema = zod.object({
  ok: zod.boolean(),
  error: zod.string().optional(),
});

export const ProviderOllamaModelsResponseSchema = zod.object({
  models: zod.array(zod.string()),
  error: zod.string().optional(),
});

export const ChatMessageSchema = zod.object({
  role: zod.enum(["system", "user", "assistant"]),
  content: zod.string(),
});

export const ChatRequestSchema = zod.object({
  messages: zod.array(ChatMessageSchema).min(1),
  provider: ProviderIdSchema.optional(),
  model: zod.string().optional(),
  customEndpoint: zod.string().optional(),
});

export const ChatStreamChunkSchema = zod.object({
  content: zod.string(),
});

export const ApiErrorResponseSchema = zod.object({
  error: zod.string(),
});
