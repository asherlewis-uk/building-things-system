import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { settingsRepository } from "@/lib/storage/repositories";
import type {
  ActiveRuntime,
  DensityPreference,
} from "@/lib/storage/types";

export type ThemePreference = "system" | "light" | "dark";

export type CustomInstructions = {
  aboutUser: string;
  responseStyle: string;
};

export type ProviderID =
  | "openai"
  | "anthropic"
  | "gemini"
  | "ollama"
  | "custom";

export type ProviderSettings = {
  provider: ProviderID;
  model: string;
  customEndpoint: string;
};

export function providerUsesCustomEndpoint(provider: ProviderID) {
  return provider === "ollama" || provider === "custom";
}

export function normalizeCustomEndpointForProvider(
  provider: ProviderID,
  customEndpoint?: string,
) {
  if (!providerUsesCustomEndpoint(provider)) {
    return "";
  }

  return customEndpoint?.trim() ?? "";
}

export function getExecutionCustomEndpoint(
  provider: ProviderID,
  customEndpoint?: string,
) {
  const normalizedEndpoint = normalizeCustomEndpointForProvider(
    provider,
    customEndpoint,
  );

  return normalizedEndpoint || undefined;
}

export type Settings = {
  theme: ThemePreference;
  hapticFeedback: boolean;
  reducedMotion: boolean;
  density: DensityPreference;
  sendWithEnter: boolean;
  customInstructions: CustomInstructions;
  activeRuntime: ActiveRuntime | null;
  ai: ProviderSettings;
};

type RuntimeSelectionInput = {
  provider: ProviderID;
  model: string;
  customEndpoint?: string;
  activeRuntime: ActiveRuntime | null;
};

type SettingsContextType = {
  settings: Settings;
  isLoaded: boolean;
  updateTheme: (theme: ThemePreference) => Promise<void>;
  updateHapticFeedback: (enabled: boolean) => Promise<void>;
  updateReducedMotion: (enabled: boolean) => Promise<void>;
  updateDensity: (density: DensityPreference) => Promise<void>;
  updateSendWithEnter: (enabled: boolean) => Promise<void>;
  updateCustomInstructions: (instructions: CustomInstructions) => Promise<void>;
  updateProvider: (provider: ProviderID) => Promise<void>;
  updateModel: (model: string) => Promise<void>;
  updateCustomEndpoint: (endpoint: string) => Promise<void>;
  updateActiveRuntime: (runtime: ActiveRuntime | null) => Promise<void>;
  selectRuntime: (selection: RuntimeSelectionInput) => Promise<void>;
};

const defaultSettings: Settings = {
  theme: "dark",
  hapticFeedback: true,
  reducedMotion: false,
  density: "comfortable",
  sendWithEnter: false,
  customInstructions: {
    aboutUser: "",
    responseStyle: "",
  },
  activeRuntime: null,
  ai: {
    provider: "openai",
    model: "gpt-5.2",
    customEndpoint: "",
  },
};

const SettingsContext = createContext<SettingsContextType | null>(null);

function mergeSettings(parsed: Partial<Settings> | null) {
  const mergedAi = {
    ...defaultSettings.ai,
    ...(parsed?.ai ?? {}),
  };
  const mergedCustomEndpoint = normalizeCustomEndpointForProvider(
    mergedAi.provider,
    mergedAi.customEndpoint,
  );
  const rawActiveRuntime = parsed?.activeRuntime ?? defaultSettings.activeRuntime;
  const normalizedActiveRuntime = rawActiveRuntime
    ? (() => {
        const { baseUrl: _ignoredBaseUrl, ...activeRuntimeWithoutBaseUrl } =
          rawActiveRuntime;

        return mergedCustomEndpoint
          ? {
              ...activeRuntimeWithoutBaseUrl,
              baseUrl: mergedCustomEndpoint,
            }
          : activeRuntimeWithoutBaseUrl;
      })()
    : defaultSettings.activeRuntime;

  return {
    ...defaultSettings,
    ...parsed,
    customInstructions: {
      ...defaultSettings.customInstructions,
      ...(parsed?.customInstructions ?? {}),
    },
    activeRuntime: normalizedActiveRuntime,
    ai: {
      ...mergedAi,
      customEndpoint: mergedCustomEndpoint,
    },
  } satisfies Settings;
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    void loadSettings();
  }, []);

  const saveSettings = useCallback(async (updated: Settings) => {
    try {
      await settingsRepository.save(updated);
    } catch (error) {
      console.error("Failed to save settings.", error);
    }
  }, []);

  const updateSettings = useCallback(
    async (buildNextSettings: (currentSettings: Settings) => Settings) => {
      setSettings((currentSettings) => {
        const nextSettings = buildNextSettings(currentSettings);
        void saveSettings(nextSettings);
        return nextSettings;
      });
    },
    [saveSettings],
  );

  async function loadSettings() {
    try {
      const storedSettings = await settingsRepository.load<Partial<Settings>>();
      setSettings(mergeSettings(storedSettings));
    } catch (error) {
      console.error("Failed to load settings.", error);
    } finally {
      setIsLoaded(true);
    }
  }

  const updateTheme = useCallback(
    async (theme: ThemePreference) => {
      await updateSettings((currentSettings) => ({
        ...currentSettings,
        theme,
      }));
    },
    [updateSettings],
  );

  const updateHapticFeedback = useCallback(
    async (enabled: boolean) => {
      await updateSettings((currentSettings) => ({
        ...currentSettings,
        hapticFeedback: enabled,
      }));
    },
    [updateSettings],
  );

  const updateReducedMotion = useCallback(
    async (enabled: boolean) => {
      await updateSettings((currentSettings) => ({
        ...currentSettings,
        reducedMotion: enabled,
      }));
    },
    [updateSettings],
  );

  const updateDensity = useCallback(
    async (density: DensityPreference) => {
      await updateSettings((currentSettings) => ({
        ...currentSettings,
        density,
      }));
    },
    [updateSettings],
  );

  const updateSendWithEnter = useCallback(
    async (enabled: boolean) => {
      await updateSettings((currentSettings) => ({
        ...currentSettings,
        sendWithEnter: enabled,
      }));
    },
    [updateSettings],
  );

  const updateCustomInstructions = useCallback(
    async (instructions: CustomInstructions) => {
      await updateSettings((currentSettings) => ({
        ...currentSettings,
        customInstructions: instructions,
      }));
    },
    [updateSettings],
  );

  const updateProvider = useCallback(
    async (provider: ProviderID) => {
      await updateSettings((currentSettings) => ({
        ...currentSettings,
        ai: {
          ...currentSettings.ai,
          provider,
          customEndpoint: normalizeCustomEndpointForProvider(
            provider,
            currentSettings.ai.customEndpoint,
          ),
        },
      }));
    },
    [updateSettings],
  );

  const updateModel = useCallback(
    async (model: string) => {
      await updateSettings((currentSettings) => ({
        ...currentSettings,
        ai: {
          ...currentSettings.ai,
          model,
        },
      }));
    },
    [updateSettings],
  );

  const updateCustomEndpoint = useCallback(
    async (endpoint: string) => {
      await updateSettings((currentSettings) => ({
        ...currentSettings,
        ai: {
          ...currentSettings.ai,
          customEndpoint: normalizeCustomEndpointForProvider(
            currentSettings.ai.provider,
            endpoint,
          ),
        },
      }));
    },
    [updateSettings],
  );

  const updateActiveRuntime = useCallback(
    async (activeRuntime: ActiveRuntime | null) => {
      await updateSettings((currentSettings) => ({
        ...currentSettings,
        activeRuntime,
      }));
    },
    [updateSettings],
  );

  const selectRuntime = useCallback(
    async (selection: RuntimeSelectionInput) => {
      await updateSettings((currentSettings) => ({
        ...currentSettings,
        activeRuntime: selection.activeRuntime,
        ai: {
          provider: selection.provider,
          model: selection.model,
          customEndpoint: normalizeCustomEndpointForProvider(
            selection.provider,
            selection.customEndpoint,
          ),
        },
      }));
    },
    [updateSettings],
  );

  const value = useMemo(
    () => ({
      settings,
      isLoaded,
      updateTheme,
      updateHapticFeedback,
      updateReducedMotion,
      updateDensity,
      updateSendWithEnter,
      updateCustomInstructions,
      updateProvider,
      updateModel,
      updateCustomEndpoint,
      updateActiveRuntime,
      selectRuntime,
    }),
    [
      isLoaded,
      selectRuntime,
      settings,
      updateActiveRuntime,
      updateCustomEndpoint,
      updateCustomInstructions,
      updateDensity,
      updateHapticFeedback,
      updateModel,
      updateProvider,
      updateReducedMotion,
      updateSendWithEnter,
      updateTheme,
    ],
  );

  return (
    <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);

  if (!context) {
    throw new Error("useSettings must be used within SettingsProvider");
  }

  return context;
}
