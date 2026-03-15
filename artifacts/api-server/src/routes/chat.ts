import { Router, type IRouter } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";
import { createProviderClient, getProviderConfig, type ProviderID } from "../providers";

const VALID_PROVIDERS = new Set<string>(["openai", "anthropic", "gemini", "ollama", "custom"]);

const router: IRouter = Router();

router.post("/chat", async (req, res) => {
  try {
    const { messages, provider, model, customEndpoint } = req.body as {
      messages: Array<{ role: string; content: string }>;
      provider?: string;
      model?: string;
      customEndpoint?: string;
    };

    if (!messages || !Array.isArray(messages)) {
      res.status(400).json({ error: "messages array required" });
      return;
    }

    if (provider && !VALID_PROVIDERS.has(provider)) {
      res.status(400).json({ error: `Unknown provider: ${provider}` });
      return;
    }

    let client = openai;
    let resolvedModel = model || "gpt-5.2";
    const validProvider = provider as ProviderID | undefined;

    if (validProvider && validProvider !== "openai") {
      const config = getProviderConfig(validProvider);
      if (!config) {
        res.status(400).json({ error: `Unknown provider: ${validProvider}` });
        return;
      }
      client = createProviderClient(validProvider, customEndpoint);
      if (!model) {
        resolvedModel = config.defaultModel;
      }
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");
    res.flushHeaders();

    const tokenLimitParam =
      validProvider === "ollama" || validProvider === "custom"
        ? { max_tokens: 8192 }
        : { max_completion_tokens: 8192 };

    const stream = await client.chat.completions.create({
      model: resolvedModel,
      ...tokenLimitParam,
      messages: messages as Array<{
        role: "system" | "user" | "assistant";
        content: string;
      }>,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }

    res.write("data: [DONE]\n\n");
    res.end();
  } catch (err: any) {
    console.error("Chat error:", err);
    const errorMsg = err?.message || "Internal server error";
    const isConfigError =
      errorMsg.includes("Custom endpoints must") ||
      errorMsg.includes("Unknown provider") ||
      errorMsg.includes("No base URL");

    if (!res.headersSent) {
      res.status(isConfigError ? 400 : 500).json({ error: errorMsg });
    } else {
      const displayError = isConfigError
        ? ` [Configuration error: ${errorMsg}]`
        : " [Error occurred — check provider configuration]";
      res.write(`data: ${JSON.stringify({ content: displayError })}\n\n`);
      res.write("data: [DONE]\n\n");
      res.end();
    }
  }
});

export default router;
