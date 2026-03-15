import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  useSettings,
  type ProviderID,
} from "@/context/SettingsContext";
import { ListRow } from "@/src/components/ListRow";
import { SectionHeader } from "@/src/components/SectionHeader";
import { Surface } from "@/src/components/Surface";
import { useTheme } from "@/src/theme/useTheme";
import { getApiUrl } from "@/lib/api";

type ProviderStatus = "ready" | "needs_config" | "needs_endpoint";

type ProviderInfo = {
  id: ProviderID;
  name: string;
  models: string[];
  defaultModel: string;
  status: ProviderStatus;
  supportsModelDiscovery: boolean;
  requiresEndpoint: boolean;
};

const FALLBACK_PROVIDERS: ProviderInfo[] = [
  { id: "openai", name: "OpenAI", models: ["gpt-5.2", "gpt-4.1", "gpt-4.1-mini", "gpt-4.1-nano", "gpt-4o", "gpt-4o-mini", "o3-mini"], defaultModel: "gpt-5.2", status: "ready", supportsModelDiscovery: false, requiresEndpoint: false },
  { id: "anthropic", name: "Anthropic", models: ["claude-sonnet-4-20250514", "claude-opus-4-20250514", "claude-haiku-3-5-20241022"], defaultModel: "claude-sonnet-4-20250514", status: "needs_config", supportsModelDiscovery: false, requiresEndpoint: false },
  { id: "gemini", name: "Google Gemini", models: ["gemini-2.5-pro", "gemini-2.5-flash", "gemini-2.0-flash"], defaultModel: "gemini-2.5-flash", status: "needs_config", supportsModelDiscovery: false, requiresEndpoint: false },
  { id: "ollama", name: "Ollama", models: ["llama3.1", "llama3", "mistral", "codellama", "phi3", "gemma2"], defaultModel: "llama3.1", status: "ready", supportsModelDiscovery: true, requiresEndpoint: true },
  { id: "custom", name: "Custom (OpenAI-compatible)", models: [], defaultModel: "", status: "needs_endpoint", supportsModelDiscovery: false, requiresEndpoint: true },
];

export default function AIProviderScreen() {
  const { colors, spacing: sp, typography: t, radii, screenInsets } = useTheme();
  const insets = useSafeAreaInsets();
  const {
    settings,
    updateProvider,
    updateModel,
    updateCustomEndpoint,
  } = useSettings();

  const [providers, setProviders] = useState<ProviderInfo[]>(FALLBACK_PROVIDERS);
  const [loading, setLoading] = useState(true);
  const [ollamaModels, setOllamaModels] = useState<string[]>([]);
  const [checkingConnection, setCheckingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "ok" | "error">("idle");

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const selectedProvider = providers.find((p) => p.id === settings.ai.provider);
  const currentModels = selectedProvider?.id === "ollama" && ollamaModels.length > 0
    ? ollamaModels
    : selectedProvider?.models ?? [];

  useEffect(() => {
    fetchProviders();
  }, []);

  useEffect(() => {
    if (settings.ai.provider === "ollama") {
      fetchOllamaModels();
    }
  }, [settings.ai.provider, settings.ai.customEndpoint]);

  const fetchProviders = async () => {
    try {
      const baseUrl = getApiUrl();
      const resp = await fetch(`${baseUrl}api/providers`);
      if (resp.ok) {
        const data = await resp.json();
        setProviders(data.providers);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const fetchOllamaModels = async () => {
    try {
      const baseUrl = getApiUrl();
      const endpoint = settings.ai.customEndpoint
        ? `?endpoint=${encodeURIComponent(settings.ai.customEndpoint)}`
        : "";
      const resp = await fetch(`${baseUrl}api/providers/ollama/models${endpoint}`);
      if (resp.ok) {
        const data = await resp.json();
        if (data.models?.length > 0) {
          setOllamaModels(data.models);
        }
      }
    } catch {
    }
  };

  const handleCheckConnection = useCallback(async () => {
    setCheckingConnection(true);
    setConnectionStatus("idle");
    try {
      const baseUrl = getApiUrl();
      const resp = await fetch(`${baseUrl}api/providers/check`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: settings.ai.provider,
          customEndpoint: settings.ai.customEndpoint || undefined,
        }),
      });
      const data = await resp.json();
      setConnectionStatus(data.ok ? "ok" : "error");
    } catch {
      setConnectionStatus("error");
    } finally {
      setCheckingConnection(false);
    }
  }, [settings.ai.provider, settings.ai.customEndpoint]);

  const handleSelectProvider = async (id: ProviderID) => {
    await updateProvider(id);
    const providerConfig = providers.find((p) => p.id === id);
    if (providerConfig?.defaultModel) {
      await updateModel(providerConfig.defaultModel);
    }
    setConnectionStatus("idle");
  };

  const handleSelectModel = async (model: string) => {
    await updateModel(model);
  };

  const needsEndpoint =
    settings.ai.provider === "ollama" || settings.ai.provider === "custom";

  return (
    <View style={[styles.container, { backgroundColor: colors.groupedBackground }]}>
      <View
        style={[
          styles.header,
          {
            paddingTop: topPad + sp.sm,
            borderBottomColor: colors.separator,
          },
        ]}
      >
        <Pressable
          onPress={() => router.back()}
          style={styles.backBtn}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <Feather name="arrow-left" size={22} color={colors.label} />
        </Pressable>
        <Text style={[t.headline, { color: colors.label }]}>AI Provider</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        contentInsetAdjustmentBehavior="automatic"
      >
        <SectionHeader title="Provider" />
        <Surface variant="grouped" style={{ marginHorizontal: screenInsets.groupedHorizontal }}>
          {providers.map((p, idx) => {
            const isSelected = settings.ai.provider === p.id;
            const statusColor =
              p.status === "ready"
                ? "#34C759"
                : p.status === "needs_endpoint"
                  ? "#FF9500"
                  : "#FF3B30";
            const statusLabel =
              p.status === "ready"
                ? "Ready"
                : p.status === "needs_endpoint"
                  ? "Needs endpoint"
                  : "Not configured";
            return (
              <View key={p.id}>
                <Pressable
                  onPress={() => handleSelectProvider(p.id)}
                  style={({ pressed }) => [
                    styles.providerRow,
                    {
                      paddingHorizontal: sp.base,
                      minHeight: 44,
                      opacity: pressed ? 0.6 : 1,
                    },
                    isSelected ? { backgroundColor: colors.tintGhost } : undefined,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={`${p.name}${isSelected ? ", selected" : ""}, ${statusLabel}`}
                >
                  <View
                    style={[
                      styles.providerIconBox,
                      {
                        backgroundColor:
                          p.status === "needs_config"
                            ? "rgba(255,59,48,0.12)"
                            : colors.tintGhost,
                        borderRadius: 7,
                      },
                    ]}
                  >
                    <Feather
                      name={getProviderIcon(p.id)}
                      size={16}
                      color={p.status === "needs_config" ? colors.tertiaryLabel : colors.tint}
                    />
                  </View>
                  <View style={styles.providerTextCol}>
                    <Text style={[t.body, { color: colors.label }]} numberOfLines={1}>
                      {p.name}
                    </Text>
                    {p.status !== "ready" && (
                      <Text style={[t.caption1, { color: colors.secondaryLabel }]} numberOfLines={1}>
                        {statusLabel}
                      </Text>
                    )}
                  </View>
                  <View
                    style={[
                      styles.statusDot,
                      { backgroundColor: statusColor },
                    ]}
                  />
                  {isSelected && (
                    <Feather name="check" size={16} color={colors.tint} />
                  )}
                </Pressable>
                {idx < providers.length - 1 && (
                  <View
                    style={[
                      styles.sep,
                      { backgroundColor: colors.separator, marginLeft: 56 },
                    ]}
                  />
                )}
              </View>
            );
          })}
        </Surface>

        {needsEndpoint && (
          <>
            <SectionHeader title="Endpoint" />
            <Surface variant="grouped" style={{ marginHorizontal: screenInsets.groupedHorizontal }}>
              <View style={[styles.inputRow, { paddingHorizontal: sp.base }]}>
                <TextInput
                  style={[
                    t.body,
                    styles.textInput,
                    {
                      color: colors.label,
                      backgroundColor: colors.tertiarySystemBackground,
                      borderRadius: radii.sm,
                      paddingHorizontal: sp.sm,
                    },
                  ]}
                  placeholder={
                    settings.ai.provider === "ollama"
                      ? "http://localhost:11434/v1"
                      : "http://localhost:8080/v1"
                  }
                  placeholderTextColor={colors.tertiaryLabel}
                  value={settings.ai.customEndpoint}
                  onChangeText={updateCustomEndpoint}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="url"
                  accessibilityLabel="Endpoint URL"
                />
              </View>
              <View
                style={[
                  styles.sep,
                  { backgroundColor: colors.separator, marginLeft: sp.base },
                ]}
              />
              <View style={[styles.checkRow, { paddingHorizontal: sp.base }]}>
                <Pressable
                  onPress={handleCheckConnection}
                  disabled={checkingConnection}
                  style={[
                    styles.checkBtn,
                    {
                      backgroundColor: colors.tint,
                      borderRadius: radii.sm,
                      opacity: checkingConnection ? 0.6 : 1,
                    },
                  ]}
                  accessibilityLabel="Test connection"
                  accessibilityRole="button"
                >
                  {checkingConnection ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={[t.callout, { color: "#fff", fontWeight: "600" }]}>
                      Test Connection
                    </Text>
                  )}
                </Pressable>
                {connectionStatus !== "idle" && (
                  <View style={styles.statusRow}>
                    <View
                      style={[
                        styles.statusDot,
                        {
                          backgroundColor:
                            connectionStatus === "ok" ? "#34C759" : "#FF3B30",
                        },
                      ]}
                    />
                    <Text
                      style={[
                        t.caption1,
                        {
                          color:
                            connectionStatus === "ok"
                              ? "#34C759"
                              : "#FF3B30",
                        },
                      ]}
                    >
                      {connectionStatus === "ok" ? "Connected" : "Failed"}
                    </Text>
                  </View>
                )}
              </View>
            </Surface>
          </>
        )}

        <SectionHeader title="Model" />
        <Surface variant="grouped" style={{ marginHorizontal: screenInsets.groupedHorizontal }}>
          {currentModels.length > 0 ? (
            currentModels.map((model, idx) => (
              <ListRow
                key={model}
                title={formatModelName(model)}
                subtitle={model !== formatModelName(model) ? model : undefined}
                accessory="none"
                onPress={() => handleSelectModel(model)}
                showSeparator={idx < currentModels.length - 1}
                style={
                  settings.ai.model === model
                    ? { backgroundColor: colors.tintGhost }
                    : undefined
                }
              />
            ))
          ) : (
            <View style={[styles.emptyModels, { paddingHorizontal: sp.base }]}>
              <Text style={[t.callout, { color: colors.secondaryLabel, textAlign: "center" }]}>
                {settings.ai.provider === "custom"
                  ? "Enter an endpoint URL and test the connection to discover models, or type a model name manually."
                  : loading
                    ? "Loading models..."
                    : "No models available. Check endpoint configuration."}
              </Text>
            </View>
          )}
          {settings.ai.provider === "custom" && (
            <>
              <View
                style={[
                  styles.sep,
                  { backgroundColor: colors.separator, marginLeft: sp.base },
                ]}
              />
              <View style={[styles.inputRow, { paddingHorizontal: sp.base }]}>
                <TextInput
                  style={[
                    t.body,
                    styles.textInput,
                    {
                      color: colors.label,
                      backgroundColor: colors.tertiarySystemBackground,
                      borderRadius: radii.sm,
                      paddingHorizontal: sp.sm,
                    },
                  ]}
                  placeholder="Model name (e.g. mistral)"
                  placeholderTextColor={colors.tertiaryLabel}
                  value={settings.ai.model}
                  onChangeText={updateModel}
                  autoCapitalize="none"
                  autoCorrect={false}
                  accessibilityLabel="Model name"
                />
              </View>
            </>
          )}
        </Surface>

        <View style={[styles.footnote, { paddingHorizontal: screenInsets.horizontal }]}>
          <Text style={[t.caption1, { color: colors.tertiaryLabel }]}>
            {getProviderFootnote(settings.ai.provider)}
          </Text>
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  );
}

function getProviderIcon(id: ProviderID): React.ComponentProps<typeof Feather>["name"] {
  switch (id) {
    case "openai":
      return "zap";
    case "anthropic":
      return "hexagon";
    case "gemini":
      return "star";
    case "ollama":
      return "server";
    case "custom":
      return "link";
  }
}

function formatModelName(model: string): string {
  return model
    .replace(/-\d{8}$/, "")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function getProviderFootnote(id: ProviderID): string {
  switch (id) {
    case "openai":
      return "Uses the configured OpenAI integration. Models are accessed via the OpenAI API.";
    case "anthropic":
      return "Requires ANTHROPIC_API_KEY environment variable. Uses the OpenAI-compatible endpoint.";
    case "gemini":
      return "Requires GEMINI_API_KEY environment variable. Uses the OpenAI-compatible endpoint.";
    case "ollama":
      return "Connects to a local Ollama instance. Make sure Ollama is running and accessible from the server.";
    case "custom":
      return "Connect to any OpenAI-compatible API endpoint (LM Studio, LocalAI, text-generation-webui, vLLM, etc.).";
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 22,
  },
  headerSpacer: {
    width: 44,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  inputRow: {
    paddingVertical: 10,
  },
  textInput: {
    height: 40,
    paddingVertical: 8,
  },
  sep: {
    height: StyleSheet.hairlineWidth,
  },
  checkRow: {
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  checkBtn: {
    height: 36,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 140,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  providerRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
    paddingVertical: 6,
  },
  providerIconBox: {
    width: 30,
    height: 30,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  providerTextCol: {
    flex: 1,
    justifyContent: "center" as const,
    gap: 2,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  emptyModels: {
    paddingVertical: 20,
  },
  footnote: {
    paddingTop: 8,
  },
});
