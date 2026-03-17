import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

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

export type Settings = {
  theme: ThemePreference;
  hapticFeedback: boolean;
  customInstructions: CustomInstructions;
  ai: ProviderSettings;
};

type SettingsContextType = {
  settings: Settings;
  isLoaded: boolean;
  updateTheme: (theme: ThemePreference) => Promise<void>;
  updateHapticFeedback: (enabled: boolean) => Promise<void>;
  updateCustomInstructions: (instructions: CustomInstructions) => Promise<void>;
  updateProvider: (provider: ProviderID) => Promise<void>;
  updateModel: (model: string) => Promise<void>;
  updateCustomEndpoint: (endpoint: string) => Promise<void>;
};

const SETTINGS_KEY = "persona:settings";

const defaultSettings: Settings = {
  theme: "dark",
  hapticFeedback: true,
  customInstructions: {
    aboutUser: "",
    responseStyle: "",
  },
  ai: {
    provider: "openai",
    model: "gpt-5.2",
    customEndpoint: "",
  },
};

const SettingsContext = createContext<SettingsContextType | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const raw = await AsyncStorage.getItem(SETTINGS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<Settings>;
        setSettings({ ...defaultSettings, ...parsed, ai: { ...defaultSettings.ai, ...(parsed.ai ?? {}) } });
      }
    } catch (e) {
      console.error("Failed to load settings", e);
    } finally {
      setIsLoaded(true);
    }
  };

  const saveSettings = async (updated: Settings) => {
    try {
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to save settings", e);
    }
  };

  const updateTheme = useCallback(async (theme: ThemePreference) => {
    setSettings((prev) => {
      const updated = { ...prev, theme };
      saveSettings(updated);
      return updated;
    });
  }, []);

  const updateHapticFeedback = useCallback(async (enabled: boolean) => {
    setSettings((prev) => {
      const updated = { ...prev, hapticFeedback: enabled };
      saveSettings(updated);
      return updated;
    });
  }, []);

  const updateCustomInstructions = useCallback(
    async (instructions: CustomInstructions) => {
      setSettings((prev) => {
        const updated = { ...prev, customInstructions: instructions };
        saveSettings(updated);
        return updated;
      });
    },
    []
  );

  const updateProvider = useCallback(async (provider: ProviderID) => {
    setSettings((prev) => {
      const updated = { ...prev, ai: { ...prev.ai, provider } };
      saveSettings(updated);
      return updated;
    });
  }, []);

  const updateModel = useCallback(async (model: string) => {
    setSettings((prev) => {
      const updated = { ...prev, ai: { ...prev.ai, model } };
      saveSettings(updated);
      return updated;
    });
  }, []);

  const updateCustomEndpoint = useCallback(async (endpoint: string) => {
    setSettings((prev) => {
      const updated = { ...prev, ai: { ...prev.ai, customEndpoint: endpoint } };
      saveSettings(updated);
      return updated;
    });
  }, []);

  return (
    <SettingsContext.Provider
      value={{
        settings,
        isLoaded,
        updateTheme,
        updateHapticFeedback,
        updateCustomInstructions,
        updateProvider,
        updateModel,
        updateCustomEndpoint,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}
