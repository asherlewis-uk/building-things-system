import { useQuery } from "@tanstack/react-query";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  getExecutionCustomEndpoint,
  useSettings,
} from "@/context/SettingsContext";
import {
  getOllamaModels,
  getProviders,
  type ProviderInfo,
} from "@/lib/api";
import {
  buildLocalRuntimeCandidates,
  createLocalRuntimeChoiceKey,
  discoverLocalRuntimes,
  flattenLocalRuntimeChoices,
  normalizeRuntimeBaseUrl,
  probeLocalRuntimeModels,
  type LocalRuntimeChoice,
  type LocalRuntimeResult,
} from "@/lib/runtime/local";
import { runtimeEndpointRepository } from "@/lib/storage/repositories";
import type { ActiveRuntime, RuntimeEndpoint } from "@/lib/storage/types";
import {
  ActionChip,
  AppShell,
  GlassCard,
  IconButton,
  PrimaryButton,
  ScreenHeader,
  SectionLabel,
} from "@/src/components";
import { radii, spacing, typography } from "@/src/theme/tokens";
import { useTheme } from "@/src/theme/useTheme";

type EndpointDraft = {
  name: string;
  baseUrl: string;
  notes: string;
};

const EMPTY_ENDPOINT_DRAFT: EndpointDraft = {
  name: "",
  baseUrl: "",
  notes: "",
};

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function getProviderDescription(provider: ProviderInfo) {
  if (provider.id === "ollama") {
    return "The local runtime shelf below scans device-reachable endpoints. Requests still use the existing chat execution path.";
  }

  if (provider.requiresEndpoint) {
    return provider.status === "needs_endpoint"
      ? "This provider needs an endpoint before it can execute."
      : "This provider routes through the configured endpoint.";
  }

  if (provider.models.length > 0) {
    return `Default model: ${provider.defaultModel}`;
  }

  return "No models were returned for this provider.";
}

function buildProviderRuntime(
  provider: ProviderInfo,
  model: string,
  customEndpoint: string,
): ActiveRuntime {
  const executionEndpoint =
    getExecutionCustomEndpoint(provider.id, customEndpoint) ?? "";

  return {
    key: `provider::${provider.id}::${executionEndpoint || "default"}::${model}`,
    name: provider.name,
    model,
    kind: provider.id === "ollama" ? "ollama-compatible" : "provider",
    source: provider.id === "ollama"
      ? executionEndpoint
        ? "manual"
        : "provider"
      : "provider",
    ...(executionEndpoint ? { baseUrl: executionEndpoint } : {}),
  };
}

function buildLocalRuntime(choice: LocalRuntimeChoice): ActiveRuntime {
  return {
    key: choice.key,
    name: choice.runtimeName,
    model: choice.modelName,
    kind: "ollama-compatible",
    source: choice.source,
    baseUrl: choice.baseUrl,
  };
}

function buildManualOllamaRuntime(
  model: string,
  customEndpoint: string,
  result?: LocalRuntimeResult,
): ActiveRuntime {
  const trimmedEndpoint = customEndpoint.trim();

  return {
    key: createLocalRuntimeChoiceKey(trimmedEndpoint || "ollama", model),
    name: result?.name ?? "Manual Ollama runtime",
    model,
    kind: "ollama-compatible",
    source: "manual",
    ...(trimmedEndpoint ? { baseUrl: trimmedEndpoint } : {}),
  };
}

function runtimeFromCurrentSelection(
  provider: ProviderInfo | null,
  model: string,
  customEndpoint: string,
  choices: LocalRuntimeChoice[],
  results: LocalRuntimeResult[],
) {
  const trimmedEndpoint = customEndpoint.trim();

  if (!provider) {
    return null;
  }

  if (provider.id !== "ollama") {
    return buildProviderRuntime(provider, model, trimmedEndpoint);
  }

  const matchedChoice = choices.find(
    (choice) =>
      choice.baseUrl === trimmedEndpoint && choice.modelName === model,
  );

  if (matchedChoice) {
    return buildLocalRuntime(matchedChoice);
  }

  const matchedResult = results.find((result) => result.baseUrl === trimmedEndpoint);
  return buildManualOllamaRuntime(model, trimmedEndpoint, matchedResult);
}

export default function ModelsScreen() {
  const theme = useTheme();
  const {
    settings,
    selectRuntime,
    updateActiveRuntime,
    updateCustomEndpoint,
  } = useSettings();
  const [savedEndpoints, setSavedEndpoints] = useState<RuntimeEndpoint[]>([]);
  const [endpointsLoaded, setEndpointsLoaded] = useState(false);
  const endpointsLoadedRef = useRef(false);
  const endpointsLoadPromiseRef = useRef<Promise<void> | null>(null);
  const [runtimeResults, setRuntimeResults] = useState<LocalRuntimeResult[]>([]);
  const [scanning, setScanning] = useState(false);
  const [scanTick, setScanTick] = useState(0);
  const [showEditor, setShowEditor] = useState(false);
  const [editingEndpointId, setEditingEndpointId] = useState<string | null>(null);
  const [endpointDraft, setEndpointDraft] = useState<EndpointDraft>(EMPTY_ENDPOINT_DRAFT);
  const [endpointFormError, setEndpointFormError] = useState<string | null>(null);
  const [executionEndpointDraft, setExecutionEndpointDraft] = useState(
    settings.ai.customEndpoint,
  );
  const currentExecutionEndpoint = getExecutionCustomEndpoint(
    settings.ai.provider,
    settings.ai.customEndpoint,
  );
  const providersQuery = useQuery({
    queryKey: ["providers"],
    queryFn: getProviders,
  });
  const ollamaModelsQuery = useQuery({
    queryKey: ["ollama-models", currentExecutionEndpoint ?? null],
    queryFn: () => getOllamaModels(currentExecutionEndpoint),
    enabled: settings.ai.provider === "ollama",
  });
  const providers = providersQuery.data?.providers ?? [];
  const selectedProvider =
    providers.find((provider) => provider.id === settings.ai.provider) ?? null;
  const localChoices = useMemo(
    () => flattenLocalRuntimeChoices(runtimeResults),
    [runtimeResults],
  );
  const activeLocalChoice = useMemo(
    () =>
      localChoices.find(
        (choice) =>
          choice.key === settings.activeRuntime?.key ||
          (choice.baseUrl === currentExecutionEndpoint &&
            choice.modelName === settings.ai.model),
      ) ?? null,
    [
      localChoices,
      settings.activeRuntime?.key,
      currentExecutionEndpoint,
      settings.ai.model,
    ],
  );
  const activeLocalResult = useMemo(
    () =>
      runtimeResults.find(
        (result) =>
          result.baseUrl === activeLocalChoice?.baseUrl ||
          result.baseUrl === currentExecutionEndpoint,
      ) ?? null,
    [activeLocalChoice?.baseUrl, currentExecutionEndpoint, runtimeResults],
  );
  const executionModels =
    settings.ai.provider === "ollama"
      ? ollamaModelsQuery.data?.models ?? []
      : selectedProvider?.models ?? [];
  const executionModelsAside =
    settings.ai.provider === "ollama"
      ? settings.activeRuntime?.name ?? "Ollama"
      : selectedProvider?.name ?? "Unavailable";
  const visibleRuntimeResults = runtimeResults.filter(
    (result) =>
      result.editable ||
      result.status === "available" ||
      result.status === "empty",
  );
  const currentRuntimeName =
    settings.activeRuntime?.name ?? selectedProvider?.name ?? "Runtime not resolved";
  const currentRuntimeModel = settings.activeRuntime?.model ?? settings.ai.model;
  const currentRuntimeDescription =
    settings.ai.provider === "ollama"
      ? activeLocalResult
        ? activeLocalResult.message
        : currentExecutionEndpoint
          ? "This Ollama endpoint is configured, but it has not been confirmed by the current device scan."
          : "Select a discovered runtime or set an endpoint to make Ollama explicit."
      : selectedProvider
        ? getProviderDescription(selectedProvider)
        : "Loading provider metadata.";
  const currentRuntimeMeta =
    settings.activeRuntime?.source === "saved"
      ? "Saved endpoint"
      : settings.activeRuntime?.source === "builtin"
        ? "Local scan"
        : settings.activeRuntime?.source === "manual"
          ? "Manual endpoint"
          : "Provider";
  const providersErrorMessage = getErrorMessage(
    providersQuery.error,
    "Unable to load providers.",
  );
  const ollamaErrorMessage = getErrorMessage(
    ollamaModelsQuery.error,
    "Unable to load Ollama models.",
  );
  const executionEndpointTrimmed = executionEndpointDraft.trim();
  const executionEndpointDirty =
    executionEndpointTrimmed !== (currentExecutionEndpoint ?? "");
  const endpointVisible = Boolean(selectedProvider?.requiresEndpoint) ||
    settings.ai.provider === "ollama";
  const builtCandidateCount = useMemo(
    () => buildLocalRuntimeCandidates(savedEndpoints).length,
    [savedEndpoints],
  );

  const loadSavedEndpoints = useCallback(async () => {
    if (endpointsLoadPromiseRef.current) {
      return endpointsLoadPromiseRef.current;
    }

    endpointsLoadPromiseRef.current = (async () => {
      try {
        const storedEndpoints = await runtimeEndpointRepository.getAll();
        setSavedEndpoints(storedEndpoints);
      } catch (error) {
        console.error("Failed to load runtime endpoints.", error);
        setSavedEndpoints([]);
      } finally {
        endpointsLoadedRef.current = true;
        setEndpointsLoaded(true);
      }
    })();

    return endpointsLoadPromiseRef.current;
  }, []);

  const ensureEndpointsLoaded = useCallback(async () => {
    if (endpointsLoadedRef.current) {
      return;
    }

    await (endpointsLoadPromiseRef.current ?? loadSavedEndpoints());
  }, [loadSavedEndpoints]);

  useEffect(() => {
    void loadSavedEndpoints();
  }, [loadSavedEndpoints]);

  useEffect(() => {
    if (!endpointsLoaded) {
      return;
    }

    let cancelled = false;

    setScanning(true);

    discoverLocalRuntimes(savedEndpoints, probeLocalRuntimeModels).then((results) => {
      if (cancelled) {
        return;
      }

      setRuntimeResults(results);
      setScanning(false);
    });

    return () => {
      cancelled = true;
    };
  }, [endpointsLoaded, savedEndpoints, scanTick]);

  useEffect(() => {
    setExecutionEndpointDraft(settings.ai.customEndpoint);
  }, [settings.ai.customEndpoint, settings.ai.provider]);

  useEffect(() => {
    if (settings.ai.provider !== "ollama" || !settings.ai.model) {
      return;
    }

    const nextRuntime = runtimeFromCurrentSelection(
      selectedProvider,
      settings.ai.model,
      settings.ai.customEndpoint,
      localChoices,
      runtimeResults,
    );

    if (
      !nextRuntime ||
      (settings.activeRuntime?.key === nextRuntime.key &&
        settings.activeRuntime?.source === nextRuntime.source &&
        settings.activeRuntime?.baseUrl === nextRuntime.baseUrl)
    ) {
      return;
    }

    void updateActiveRuntime(nextRuntime);
  }, [
    localChoices,
    runtimeResults,
    selectedProvider,
    settings.activeRuntime?.baseUrl,
    settings.activeRuntime?.key,
    settings.activeRuntime?.source,
    settings.ai.customEndpoint,
    settings.ai.model,
    settings.ai.provider,
    updateActiveRuntime,
  ]);

  useEffect(() => {
    if (!selectedProvider) {
      return;
    }

    if (
      executionModels.length === 0 ||
      executionModels.includes(settings.ai.model)
    ) {
      return;
    }

    const nextModel =
      settings.ai.provider === "ollama"
        ? executionModels[0]
        : selectedProvider.defaultModel ?? executionModels[0];
    const nextRuntime = runtimeFromCurrentSelection(
      selectedProvider,
      nextModel,
      settings.ai.customEndpoint,
      localChoices,
      runtimeResults,
    );

    void selectRuntime({
      provider: selectedProvider.id,
      model: nextModel,
      customEndpoint: settings.ai.customEndpoint,
      activeRuntime: nextRuntime,
    });
  }, [
    executionModels,
    localChoices,
    runtimeResults,
    selectRuntime,
    selectedProvider,
    settings.ai.customEndpoint,
    settings.ai.model,
    settings.ai.provider,
  ]);

  const handleProviderSelect = async (provider: ProviderInfo) => {
    const nextModel =
      provider.id === "ollama"
        ? provider.defaultModel ?? provider.models[0] ?? settings.ai.model
        : provider.models.includes(settings.ai.model)
          ? settings.ai.model
          : provider.defaultModel ?? provider.models[0] ?? settings.ai.model;
    const nextExecutionEndpoint =
      getExecutionCustomEndpoint(provider.id, settings.ai.customEndpoint) ?? "";
    const nextRuntime = runtimeFromCurrentSelection(
      provider,
      nextModel,
      nextExecutionEndpoint,
      localChoices,
      runtimeResults,
    );

    await selectRuntime({
      provider: provider.id,
      model: nextModel,
      customEndpoint: nextExecutionEndpoint,
      activeRuntime: nextRuntime,
    });
  };

  const handleModelSelect = async (model: string) => {
    if (!selectedProvider) {
      return;
    }

    const nextRuntime = runtimeFromCurrentSelection(
      selectedProvider,
      model,
      settings.ai.customEndpoint,
      localChoices,
      runtimeResults,
    );

    await selectRuntime({
      provider: selectedProvider.id,
      model,
      customEndpoint: settings.ai.customEndpoint,
      activeRuntime: nextRuntime,
    });
  };

  const handleRuntimeChoiceSelect = async (choice: LocalRuntimeChoice) => {
    await selectRuntime({
      provider: "ollama",
      model: choice.modelName,
      customEndpoint: choice.baseUrl,
      activeRuntime: buildLocalRuntime(choice),
    });
  };

  const handleStartCreateEndpoint = () => {
    setEndpointDraft(EMPTY_ENDPOINT_DRAFT);
    setEditingEndpointId(null);
    setEndpointFormError(null);
    setShowEditor(true);
  };

  const handleStartEditEndpoint = (endpoint: RuntimeEndpoint) => {
    setEndpointDraft({
      name: endpoint.name,
      baseUrl: endpoint.baseUrl,
      notes: endpoint.notes ?? "",
    });
    setEditingEndpointId(endpoint.id);
    setEndpointFormError(null);
    setShowEditor(true);
  };

  const handleCancelEditor = () => {
    setEndpointDraft(EMPTY_ENDPOINT_DRAFT);
    setEditingEndpointId(null);
    setEndpointFormError(null);
    setShowEditor(false);
  };

  const handleSaveEndpoint = async () => {
    await ensureEndpointsLoaded();

    const name = endpointDraft.name.trim();
    const normalizedBaseUrl = normalizeRuntimeBaseUrl(endpointDraft.baseUrl);
    const notes = endpointDraft.notes.trim() || undefined;

    if (!name) {
      setEndpointFormError("Give this endpoint a name.");
      return;
    }

    if (!normalizedBaseUrl) {
      setEndpointFormError(
        "Use a local HTTP or HTTPS endpoint such as http://localhost:11434/api.",
      );
      return;
    }

    if (editingEndpointId) {
      const updatedEndpoint = await runtimeEndpointRepository.update(editingEndpointId, {
        name,
        baseUrl: normalizedBaseUrl,
        notes,
      });

      if (updatedEndpoint) {
        setSavedEndpoints((currentEndpoints) =>
          currentEndpoints
            .map((endpoint) =>
              endpoint.id === editingEndpointId ? updatedEndpoint : endpoint,
            )
            .sort((left, right) => right.updatedAt - left.updatedAt),
        );
      }
    } else {
      const now = Date.now();
      const nextEndpoint: RuntimeEndpoint = {
        id: runtimeEndpointRepository.createId(),
        name,
        baseUrl: normalizedBaseUrl,
        notes,
        createdAt: now,
        updatedAt: now,
      };

      await runtimeEndpointRepository.create(nextEndpoint);
      setSavedEndpoints((currentEndpoints) => [nextEndpoint, ...currentEndpoints]);
    }

    handleCancelEditor();
  };

  const handleDeleteEndpoint = async (endpoint: RuntimeEndpoint) => {
    await ensureEndpointsLoaded();
    await runtimeEndpointRepository.remove(endpoint.id);
    setSavedEndpoints((currentEndpoints) =>
      currentEndpoints.filter((currentEndpoint) => currentEndpoint.id !== endpoint.id),
    );

    if (editingEndpointId === endpoint.id) {
      handleCancelEditor();
    }

    if (
      settings.ai.provider === "ollama" &&
      settings.ai.customEndpoint === endpoint.baseUrl
    ) {
      await updateActiveRuntime(
        buildManualOllamaRuntime(settings.ai.model, settings.ai.customEndpoint),
      );
    }
  };

  const handleApplyExecutionEndpoint = async () => {
    await updateCustomEndpoint(executionEndpointTrimmed);

    if (!selectedProvider) {
      return;
    }

    const nextRuntime = runtimeFromCurrentSelection(
      selectedProvider,
      settings.ai.model,
      executionEndpointTrimmed,
      localChoices,
      runtimeResults,
    );

    await updateActiveRuntime(nextRuntime);
  };

  return (
    <AppShell contentStyle={styles.shellContent}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader
          title="Models"
          subtitle="Keep the active runtime visible, manage saved endpoints locally, and make model choice explicit without changing the real chat execution path."
        />

        <View style={styles.contentStack}>
          <GlassCard
            title={currentRuntimeModel || "No runtime selected yet"}
            description={currentRuntimeDescription}
            footer={
              currentExecutionEndpoint
                ? currentExecutionEndpoint
                : "Execution still uses the existing provider request path from this app."
            }
            meta={currentRuntimeMeta}
          >
            <Text style={[typography.subheadline, { color: theme.text.primary }]}>
              {currentRuntimeName}
            </Text>
            <Text style={[typography.footnote, { color: theme.text.secondary }]}>
              Provider: {settings.ai.provider}
            </Text>
          </GlassCard>

          <SectionLabel
            aside={scanning ? "Scanning" : `${localChoices.length} choice${localChoices.length === 1 ? "" : "s"}`}
            label="Local Runtime Shelf"
          />
          <View style={styles.cardStack}>
            <GlassCard
              title="Device-side discovery"
              description="Built-in localhost candidates are scanned automatically, and saved endpoints stay editable here. This discovery is device-side; chat execution still follows the existing request path."
              footer={
                scanning
                  ? "Scanning common local endpoints..."
                  : `${builtCandidateCount} endpoint candidate${builtCandidateCount === 1 ? "" : "s"} checked.`
              }
            >
              <View style={styles.primaryActionRow}>
                <PrimaryButton
                  active={scanning}
                  disabled={!endpointsLoaded}
                  label={scanning ? "Scanning..." : "Rescan"}
                  onPress={() => setScanTick((currentTick) => currentTick + 1)}
                />
                <PrimaryButton
                  disabled={!endpointsLoaded}
                  label={
                    !endpointsLoaded
                      ? "Loading Endpoints..."
                      : showEditor
                        ? "Close Editor"
                        : "Add Endpoint"
                  }
                  onPress={showEditor ? handleCancelEditor : handleStartCreateEndpoint}
                />
              </View>
            </GlassCard>

            {visibleRuntimeResults.length > 0 ? (
              visibleRuntimeResults.map((result) => (
                <GlassCard
                  key={`${result.source}-${result.baseUrl}`}
                  title={result.name}
                  description={result.message}
                  footer={result.baseUrl}
                  meta={
                    result.status === "available"
                      ? "Models ready"
                      : result.status === "empty"
                        ? "No models"
                        : result.status === "unsupported"
                          ? "Unsupported"
                          : "Unavailable"
                  }
                >
                  {result.notes ? (
                    <Text style={[typography.footnote, { color: theme.text.secondary }]}>
                      {result.notes}
                    </Text>
                  ) : null}

                  {result.models.length > 0 ? (
                    <View style={styles.chipGrid}>
                      {result.models.map((model) => {
                        const choiceKey = createLocalRuntimeChoiceKey(
                          result.baseUrl,
                          model.name,
                        );

                        return (
                          <ActionChip
                            key={choiceKey}
                            label={model.name}
                            onPress={() =>
                              void handleRuntimeChoiceSelect({
                                key: choiceKey,
                                runtimeId: result.id,
                                runtimeName: result.name,
                                baseUrl: result.baseUrl,
                                modelName: model.name,
                                runtimeKind: "ollama-compatible",
                                source: result.source,
                              })
                            }
                            selected={settings.activeRuntime?.key === choiceKey}
                            style={styles.chip}
                          />
                        );
                      })}
                    </View>
                  ) : null}

                  {result.editable ? (
                    <View style={styles.utilityRow}>
                      <IconButton
                        icon="edit-3"
                        label="Edit"
                        onPress={() => {
                          const endpoint = savedEndpoints.find(
                            (savedEndpoint) => savedEndpoint.id === result.id,
                          );

                          if (endpoint) {
                            handleStartEditEndpoint(endpoint);
                          }
                        }}
                      />
                      <IconButton
                        icon="trash-2"
                        label="Delete"
                        onPress={() => {
                          const endpoint = savedEndpoints.find(
                            (savedEndpoint) => savedEndpoint.id === result.id,
                          );

                          if (endpoint) {
                            void handleDeleteEndpoint(endpoint);
                          }
                        }}
                      />
                    </View>
                  ) : null}
                </GlassCard>
              ))
            ) : (
              <GlassCard
                title="No reachable local runtimes"
                description="Nothing on the current device scan answered like an Ollama-compatible runtime yet. You can rescan or save a specific endpoint."
              />
            )}

            {showEditor ? (
              <GlassCard
                title={editingEndpointId ? "Edit endpoint" : "Save endpoint"}
                description="Saved endpoints are local to this device and feed the runtime shelf without changing the underlying chat request path."
                meta={editingEndpointId ? "Editing" : "New"}
              >
                <View style={styles.formStack}>
                  <TextInput
                    autoCapitalize="words"
                    onChangeText={(name) => {
                      setEndpointDraft((currentDraft) => ({ ...currentDraft, name }));
                      setEndpointFormError(null);
                    }}
                    placeholder="Runtime name"
                    placeholderTextColor={theme.text.tertiary}
                    style={[
                      styles.input,
                      {
                        color: theme.text.primary,
                        backgroundColor: theme.surface.glassTint,
                        borderColor: theme.border.idle,
                      },
                    ]}
                    value={endpointDraft.name}
                  />
                  <TextInput
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="url"
                    onChangeText={(baseUrl) => {
                      setEndpointDraft((currentDraft) => ({ ...currentDraft, baseUrl }));
                      setEndpointFormError(null);
                    }}
                    placeholder="http://localhost:11434/api"
                    placeholderTextColor={theme.text.tertiary}
                    style={[
                      styles.input,
                      {
                        color: theme.text.primary,
                        backgroundColor: theme.surface.glassTint,
                        borderColor: theme.border.idle,
                      },
                    ]}
                    value={endpointDraft.baseUrl}
                  />
                  <TextInput
                    multiline
                    onChangeText={(notes) =>
                      setEndpointDraft((currentDraft) => ({ ...currentDraft, notes }))
                    }
                    placeholder="Optional note about this runtime"
                    placeholderTextColor={theme.text.tertiary}
                    style={[
                      styles.textArea,
                      {
                        color: theme.text.primary,
                        backgroundColor: theme.surface.glassTint,
                        borderColor: theme.border.idle,
                      },
                    ]}
                    textAlignVertical="top"
                    value={endpointDraft.notes}
                  />
                  <Text style={[typography.caption1, { color: theme.text.tertiary }]}>
                    Examples: `http://localhost:11434/api`, `http://127.0.0.1:11434/api`, or an emulator alias such as `http://10.0.2.2:11434/api`.
                  </Text>
                  {endpointFormError ? (
                    <Text style={[typography.footnote, { color: theme.state.danger }]}>
                      {endpointFormError}
                    </Text>
                  ) : null}
                  <View style={styles.primaryActionRow}>
                    <PrimaryButton label="Cancel" onPress={handleCancelEditor} />
                    <PrimaryButton
                      active
                      label={editingEndpointId ? "Save Endpoint" : "Add Endpoint"}
                      onPress={() => {
                        void handleSaveEndpoint();
                      }}
                    />
                  </View>
                </View>
              </GlassCard>
            ) : null}
          </View>

          <SectionLabel
            aside={selectedProvider?.name ?? "Loading"}
            label="Provider Catalog"
          />
          <View style={styles.cardStack}>
            {providersQuery.isPending ? (
              <GlassCard>
                <View style={styles.statusCardContent}>
                  <ActivityIndicator color={theme.text.primary} />
                  <Text style={[typography.footnote, { color: theme.text.secondary }]}>
                    Loading providers from the shared backend...
                  </Text>
                </View>
              </GlassCard>
            ) : providersQuery.isError ? (
              <GlassCard
                title="Providers unavailable"
                description={providersErrorMessage}
              />
            ) : (
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
                  <Text style={[typography.footnote, { color: theme.text.secondary }]}>
                    {getProviderDescription(provider)}
                  </Text>
                </GlassCard>
              ))
            )}
          </View>

          <SectionLabel
            aside={executionModelsAside}
            label="Execution Models"
          />
          <View style={styles.cardStack}>
            {settings.ai.provider === "ollama" && ollamaModelsQuery.isPending ? (
              <GlassCard
                title="Checking current Ollama endpoint"
                description="Refreshing execution-path models from the currently configured endpoint."
              />
            ) : settings.ai.provider === "ollama" && ollamaModelsQuery.isError ? (
              <GlassCard
                title="Ollama models unavailable"
                description={`${ollamaErrorMessage} Local runtime discovery remains visible above, but it does not replace the execution-path model list.`}
              />
            ) : providersQuery.isPending ? (
              <GlassCard
                title="Waiting for provider data"
                description="Execution model choices appear after provider metadata loads."
              />
            ) : !selectedProvider ? (
              <GlassCard
                title="Provider unavailable"
                description="The selected provider is not currently reported by the backend."
              />
            ) : executionModels.length > 0 ? (
              executionModels.map((model) => (
                <GlassCard
                  key={model}
                  onPress={() => {
                    void handleModelSelect(model);
                  }}
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
                  <Text style={[typography.caption1, { color: theme.text.tertiary }]}>
                    {settings.ai.provider === "ollama"
                      ? currentExecutionEndpoint || "Current Ollama endpoint"
                      : model === selectedProvider.defaultModel
                        ? "Default model from provider metadata"
                        : `${selectedProvider.name} provider`}
                  </Text>
                </GlassCard>
              ))
            ) : (
              <GlassCard
                title="No execution models available"
                description={
                  settings.ai.provider === "ollama"
                    ? "The current Ollama endpoint did not return any models."
                    : `${selectedProvider.name} did not return any models.`
                }
              />
            )}
          </View>

          {endpointVisible ? (
            <>
              <SectionLabel
                aside={selectedProvider?.requiresEndpoint ? "Required" : "Optional"}
                label="Execution Endpoint"
              />
              <View style={styles.cardStack}>
                <GlassCard
                  title="Current endpoint override"
                  description={
                    settings.ai.provider === "ollama"
                      ? "Use this when you need a specific Ollama host that is not coming from the runtime shelf."
                      : "Keep the endpoint explicit for providers that require it."
                  }
                >
                  <View style={styles.formStack}>
                    <TextInput
                      autoCapitalize="none"
                      autoCorrect={false}
                      keyboardType="url"
                      onChangeText={setExecutionEndpointDraft}
                      placeholder={
                        settings.ai.provider === "ollama"
                          ? "http://localhost:11434/api"
                          : "https://your-endpoint.example.com"
                      }
                      placeholderTextColor={theme.text.tertiary}
                      style={[
                        styles.input,
                        {
                          color: theme.text.primary,
                          backgroundColor: theme.surface.glassTint,
                          borderColor: theme.border.idle,
                        },
                      ]}
                      value={executionEndpointDraft}
                    />
                    <PrimaryButton
                      active={executionEndpointDirty}
                      disabled={!executionEndpointDirty}
                      label="Apply Endpoint"
                      onPress={() => {
                        void handleApplyExecutionEndpoint();
                      }}
                    />
                    {settings.ai.provider === "ollama" &&
                    ollamaModelsQuery.isError &&
                    executionEndpointTrimmed ? (
                      <Text style={[typography.footnote, { color: theme.state.danger }]}>
                        {ollamaErrorMessage}
                      </Text>
                    ) : null}
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
  chipGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  chip: {},
  utilityRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  primaryActionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  formStack: {
    gap: spacing.sm,
  },
  input: {
    minHeight: 52,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderRadius: radii.control,
    borderWidth: 1,
  },
  textArea: {
    minHeight: 108,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderRadius: radii.control,
    borderWidth: 1,
  },
});
