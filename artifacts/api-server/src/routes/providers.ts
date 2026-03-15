import { Router, type IRouter } from "express";
import {
  getProviderInfoList,
  getProviderConfig,
  discoverOllamaModels,
  checkProviderConnectivity,
  isAllowedEndpoint,
  type ProviderID,
} from "../providers";

const VALID_PROVIDERS = new Set<string>(["openai", "anthropic", "gemini", "ollama", "custom"]);

const router: IRouter = Router();

router.get("/providers", (_req, res) => {
  const providers = getProviderInfoList();
  res.json({ providers });
});

router.get("/providers/ollama/models", async (req, res) => {
  const endpoint = (req.query.endpoint as string) || undefined;
  if (endpoint && !isAllowedEndpoint(endpoint)) {
    res.status(400).json({ error: "Endpoint must point to localhost or private network", models: [] });
    return;
  }
  const models = await discoverOllamaModels(endpoint);
  res.json({ models });
});

router.post("/providers/check", async (req, res) => {
  const { provider, customEndpoint } = req.body as {
    provider: string;
    customEndpoint?: string;
  };

  if (!provider || !VALID_PROVIDERS.has(provider)) {
    res.status(400).json({ error: "Valid provider is required" });
    return;
  }

  const allowsCustomEndpoint = provider === "ollama" || provider === "custom";
  const safeEndpoint = allowsCustomEndpoint ? customEndpoint : undefined;

  try {
    const result = await checkProviderConnectivity(
      provider as ProviderID,
      safeEndpoint
    );
    res.json(result);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Connection check failed";
    res.json({ ok: false, error: msg });
  }
});

export default router;
