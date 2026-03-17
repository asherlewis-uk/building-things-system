import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  getOllamaModels,
  getProviders,
  type ProviderInfo,
} from "@/lib/api";
import {
  AppShell,
  GlassCard,
  PrimaryButton,
  ScreenHeader,
  SectionLabel,
} from "@/src/components";
import { useSettings } from "@/context/SettingsContext";
import { radii, spacing, typography } from "@/src/theme/tokens";
import { useTheme } from "@/src/theme/useTheme";

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function getProviderDescription(provider: ProviderInfo) {
  if (provider.requiresEndpoint) {
    return provider.status === "needs_endpoint"
      ? "Configure an endpoint before this provider can be used."
      : "Routes through a configured endpoint.";
  }

  if (provider.supportsModelDiscovery) {
    return "Discovers models dynamically from the connected runtime.";
  }

  if (provider.models.length > 0) {
    return `Default model: ${provider.defaultModel}`;
  }

  return "No models were returned by the backend.";
}

export default function ModelsScreen() {
  const theme = useTheme();
  const {
    settings,
    updateCustomEndpoint,
    updateModel,
    updateProvider,
  } = useSettings();
  const providersQuery = useQuery({
    queryKey: ["providers"],
    queryFn: getProviders,
  });
  const ollamaModelsQuery = useQuery({
    queryKey: ["ollama-models", settings.ai.customEndpoint || null],
    queryFn: () => getOllamaModels(settings.ai.customEndpoint || undefined),
    enabled: settings.ai.provider === "ollama",
  });
  const providers = providersQuery.data?.providers ?? [];
  const selectedProvider =
    providers.find((provider) => provider.id === settings.ai.provider) ?? null;
  const availableModels =
    settings.ai.provider === "ollama"
      ? ollamaModelsQuery.data?.models ?? []
      : selectedProvider?.models ?? [];
  const providersErrorMessage = getErrorMessage(
    providersQuery.error,
    "Unable to load providers.",
  );
  const ollamaErrorMessage = getErrorMessage(
    ollamaModelsQuery.error,
    "Unable to load Ollama models.",
  );
  const [endpointDraft, setEndpointDraft] = useState(settings.ai.customEndpoint);
  const endpointRequired = Boolean(selectedProvider?.requiresEndpoint);
  const endpointVisible = endpointRequired || settings.ai.provider === "ollama";
  const trimmedEndpointDraft = endpointDraft.trim();
  const endpointDirty = trimmedEndpointDraft !== settings.ai.customEndpoint.trim();

  useEffect(() => {
    setEndpointDraft(settings.ai.customEndpoint);
  }, [settings.ai.customEndpoint, settings.ai.provider]);

  useEffect(() => {
    if (!selectedProvider) {
      return;
    }

    if (settings.ai.provider === "ollama") {
      if (availableModels.length > 0 && !availableModels.includes(settings.ai.model)) {
        void updateModel(availableModels[0]);
      }
      return;
    }

    if (selectedProvider.models.length === 0) {
      return;
    }

    if (!selectedProvider.models.includes(settings.ai.model)) {
      void updateModel(selectedProvider.defaultModel ?? selectedProvider.models[0]);
    }
  }, [
    availableModels,
    selectedProvider,
    settings.ai.model,
    settings.ai.provider,
    updateModel,
  ]);

  const handleProviderSelect = async (provider: ProviderInfo) => {
    if (settings.ai.provider === provider.id) {
      return;
    }

    await updateProvider(provider.id);

    if (provider.id === "ollama") {
      return;
    }

    const nextModel = provider.models.includes(settings.ai.model)
      ? settings.ai.model
      : provider.defaultModel ?? provider.models[0] ?? "";

    if (nextModel !== settings.ai.model) {
      await updateModel(nextModel);
    }
  };

  return (
    <AppShell contentStyle={styles.shellContent}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader
          title="Models"
          subtitle="Model and provider decisions belong here so runtime choice stays visible instead of hiding inside Settings."
        />

        <View style={styles.contentStack}>
          <GlassCard
            title="Model destination"
            description="This destination is for model and provider posture, not for conversation content. The first pass keeps that choice explicit without hiding runtime issues."
            footer={
              providersQuery.isPending
                ? "Checking provider availability..."
                : providersQuery.isError
                  ? providersErrorMessage
                  : `Provider choices are loading from the shared backend surface. Current provider: ${selectedProvider?.name ?? "Unavailable"}.`
            }
            meta="Runtime"
          />

          <SectionLabel
            aside={selectedProvider?.name ?? "Loading"}
            label="Providers"
          />
          <View style={styles.cardStack}>
            {providersQuery.isPending ? (
              <GlassCard>
                <View style={styles.statusCardContent}>
                  <ActivityIndicator color={theme.text.primary} />
                  <Text
                    style={[typography.footnote, { color: theme.text.secondary }]}
                  >
                    Loading providers from the backend...
                  </Text>
                </View>
              </GlassCard>
            ) : providersQuery.isError ? (
              <GlassCard
                title="Providers unavailable"
                description={providersErrorMessage}
              />
            ) : providers.length > 0 ? (
              providers.map((provider) => (
                <GlassCard
                  key={provider.id}
                  onPress={() => {
                    void handleProviderSelect(provider);
                  }}
                  selected={settings.ai.provider === provider.id}
                >
                  <Text
                    style={[
                      typography.subheadline,
                      styles.cardTitle,
                      { color: theme.text.primary },
                    ]}
                  >
                    {provider.name}
                  </Text>
                  <Text
                    style={[typography.footnote, { color: theme.text.secondary }]}
                  >
                    {getProviderDescription(provider)}
                  </Text>
                </GlassCard>
              ))
            ) : (
              <GlassCard
                title="No providers available"
                description="The backend returned an empty provider list."
              />
            )}
          </View>

          <SectionLabel label="Available Models" />
          <View style={styles.cardStack}>
            {providersQuery.isPending ? (
              <GlassCard
                title="Waiting for provider data"
                description="Model selection will appear after the provider list loads."
              />
            ) : !selectedProvider ? (
              <GlassCard
                title="Provider unavailable"
                description="The selected provider is not currently reported by the backend."
              />
            ) : settings.ai.provider === "ollama" && ollamaModelsQuery.isPending ? (
              <GlassCard
                title="Loading Ollama models"
                description="Waiting for the runtime to return available models."
              />
            ) : settings.ai.provider === "ollama" && ollamaModelsQuery.isError ? (
              <GlassCard
                title="Ollama models unavailable"
                description={ollamaErrorMessage}
              />
            ) : availableModels.length > 0 ? (
              availableModels.map((model) => (
                <GlassCard
                  key={model}
                  onPress={() => void updateModel(model)}
                  selected={settings.ai.model === model}
                >
                  <Text
                    style={[
                      typography.subheadline,
                      styles.cardTitle,
                      { color: theme.text.primary },
                    ]}
                  >
                    {model}
                  </Text>
                  <Text
                    style={[typography.caption1, { color: theme.text.tertiary }]}
                  >
                    {settings.ai.provider === "ollama"
                      ? trimmedEndpointDraft || "Default Ollama endpoint"
                      : model === selectedProvider.defaultModel
                        ? "Default model from provider metadata"
                        : `${selectedProvider.name} provider`}
                  </Text>
                </GlassCard>
              ))
            ) : (
              <GlassCard
                title="No models available"
                description={
                  settings.ai.provider === "ollama"
                    ? "The backend did not return any Ollama models."
                    : `${selectedProvider.name} did not return any models.`
                }
              />
            )}
          </View>

          {endpointVisible ? (
            <>
              <SectionLabel
                aside={endpointRequired ? "Required" : "Optional"}
                label="Endpoint"
              />
              <View style={styles.cardStack}>
                <GlassCard
                  title="Endpoint configuration"
                  description={
                    endpointRequired
                      ? "This provider requires an endpoint before requests can be sent."
                      : "Override the runtime endpoint when you need a non-default Ollama host."
                  }
                >
                  <View style={styles.endpointStack}>
                    <TextInput
                      autoCapitalize="none"
                      autoCorrect={false}
                      keyboardType="url"
                      onChangeText={setEndpointDraft}
                      placeholder={
                        endpointRequired
                          ? "https://your-endpoint.example.com"
                          : "http://localhost:11434"
                      }
                      placeholderTextColor={theme.text.tertiary}
                      style={[
                        typography.body,
                        styles.endpointInput,
                        {
                          color: theme.text.primary,
                          backgroundColor: theme.surface.glassTint,
                          borderColor: theme.border.idle,
                        },
                      ]}
                      value={endpointDraft}
                    />
                    <PrimaryButton
                      active={endpointDirty}
                      disabled={!endpointDirty}
                      label="Save Endpoint"
                      onPress={() => void updateCustomEndpoint(trimmedEndpointDraft)}
                    />
                  </View>
                </GlassCard>
              </View>
            </>
          ) : null}
        </View>
      </ScrollView>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  shellContent: {
    flex: 1,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  scrollContent: {
    paddingBottom: spacing.xxxl,
  },
  contentStack: {
    gap: spacing.sm,
  },
  cardStack: {
    gap: spacing.sm,
    paddingHorizontal: spacing.base,
  },
  statusCardContent: {
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  cardTitle: {
    fontFamily: "Inter_500Medium",
  },
  endpointStack: {
    gap: spacing.sm,
  },
  endpointInput: {
    minHeight: 52,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderRadius: radii.control,
    borderWidth: 1,
  },
});
