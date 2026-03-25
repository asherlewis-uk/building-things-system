"use client";

import * as React from "react";
import {
  AlertCircle,
  LoaderCircle,
  PlugZap,
  Save,
  Settings2,
  Trash2,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getClientErrorMessage, readJsonResponse } from "@/lib/client-api";
import { useWorkspace } from "@/components/workspace/workspace-provider";
import type {
  AppwriteIntegrationStatus,
  McpServer,
  RemoteIdentityState,
  ResolvedConfig,
} from "@/lib/types";

type SettingsFormState = {
  app: {
    default_mode: string;
    panel_density: string;
    code_font_size: string;
    preview_default_path: string;
    deploy_target: string;
    terminal_start_directory: string;
    assistant_response_style: string;
  };
  workspace: {
    default_mode: string;
    panel_density: string;
    code_font_size: string;
    preview_default_path: string;
    deploy_target: string;
    terminal_start_directory: string;
    assistant_response_style: string;
    accent_color: string;
    auto_artifact_snapshots: boolean;
  };
};

type McpFormState = {
  name: string;
  transport_type: "http" | "sse" | "stdio";
  endpoint: string;
  command: string;
  auth_mode: "none" | "bearer" | "header";
  enabled: boolean;
  declared_tools: string;
};

function buildSettingsForm(config: ResolvedConfig | null): SettingsFormState {
  return {
    app: {
      default_mode: config?.app.default_mode ?? "write",
      panel_density: config?.app.panel_density ?? "comfortable",
      code_font_size: String(config?.app.code_font_size ?? 13),
      preview_default_path: config?.app.preview_default_path ?? "",
      deploy_target: config?.app.deploy_target ?? "local-preview",
      terminal_start_directory: config?.app.terminal_start_directory ?? "/",
      assistant_response_style:
        config?.app.assistant_response_style ?? "balanced",
    },
    workspace: {
      default_mode: config?.workspace.default_mode ?? "",
      panel_density: config?.workspace.panel_density ?? "",
      code_font_size:
        config?.workspace.code_font_size != null
          ? String(config.workspace.code_font_size)
          : "",
      preview_default_path: config?.workspace.preview_default_path ?? "",
      deploy_target: config?.workspace.deploy_target ?? "",
      terminal_start_directory:
        config?.workspace.terminal_start_directory ?? "",
      assistant_response_style:
        config?.workspace.assistant_response_style ?? "",
      accent_color: config?.workspace.accent_color ?? "#F6FF00",
      auto_artifact_snapshots:
        config?.workspace.auto_artifact_snapshots ?? true,
    },
  };
}

function buildMcpForm(server?: McpServer | null): McpFormState {
  const declaredTools = (() => {
    if (!server?.declared_tools_json) {
      return "";
    }

    try {
      return (JSON.parse(server.declared_tools_json) as string[]).join(", ");
    } catch {
      return "";
    }
  })();

  return {
    name: server?.name ?? "",
    transport_type: server?.transport_type ?? "http",
    endpoint: server?.endpoint ?? "",
    command: server?.command ?? "",
    auth_mode: server?.auth_mode ?? "none",
    enabled: server ? Boolean(server.enabled) : true,
    declared_tools: declaredTools,
  };
}

function getAppwriteFooterCopy(
  status: AppwriteIntegrationStatus["status"] | undefined,
  identity: RemoteIdentityState | null,
) {
  if (identity?.status === "connected" && identity.user) {
    return `${identity.user.label} has an Appwrite guest identity. Workspaces, sessions, files, and messages still stay in SQLite.`;
  }

  switch (status) {
    case "incomplete":
      return "Config is partial or invalid. The shell stays local-first.";
    case "configured":
      return "Core env vars are set. Reachability has not been checked yet.";
    case "ready":
      return "Appwrite responded, but local SQLite remains authoritative.";
    case "error":
      return "The latest Appwrite probe failed. Local mode stays active.";
    case "disabled":
    default:
      return "Optional and currently off.";
  }
}

function getAppwriteSummary(
  status: AppwriteIntegrationStatus | null,
  isChecking: boolean,
) {
  if (isChecking) {
    return "Checking the Appwrite endpoint from the server.";
  }

  switch (status?.status) {
    case "incomplete":
      return "Some Appwrite values are missing or invalid. Requested Appwrite behavior stays unavailable until those warnings are fixed.";
    case "configured":
      return "Core Appwrite env vars are valid. A live probe will mark the integration ready once the endpoint responds.";
    case "ready":
      return "Appwrite responded to a server-side health probe. SQLite-backed local persistence remains the source of truth.";
    case "error":
      return "Appwrite can be probed, but the latest server-side reachability check failed.";
    case "disabled":
    default:
      return "No Appwrite env vars are set. The integration stays off and the local-first SQLite flow remains active.";
  }
}

function getAppwriteAuthSummary(status: AppwriteIntegrationStatus | null) {
  if (!status) {
    return "Disabled";
  }

  if (!status.auth.enabled) {
    return "Disabled";
  }

  if (status.auth.status === "incomplete") {
    return status.auth.mode === "anonymous"
      ? "Anonymous (incomplete)"
      : "Invalid";
  }

  return status.auth.mode === "anonymous" ? "Anonymous" : "Disabled";
}

function getAppwriteAuthTone(
  status: AppwriteIntegrationStatus | null,
): "default" | "success" | "warning" | "danger" {
  if (!status) {
    return "default";
  }

  if (status.auth.status === "ready") {
    return "success";
  }

  if (status.auth.status === "incomplete") {
    return "warning";
  }

  if (status.auth.status === "error") {
    return "danger";
  }

  return "default";
}

function getAppwriteConnectionLabel(
  status: AppwriteIntegrationStatus | null,
  isChecking: boolean,
) {
  if (isChecking) {
    return "Checking...";
  }

  if (!status) {
    return "Not checked";
  }

  if (status.connection_status === "reachable") {
    return status.latency_ms != null
      ? `Reachable (${status.latency_ms}ms)`
      : "Reachable";
  }

  if (status.connection_status === "unreachable") {
    return "Unreachable";
  }

  return "Not checked";
}

function getAppwriteStatusTone(
  status: AppwriteIntegrationStatus["status"] | undefined,
): "default" | "success" | "warning" | "danger" {
  switch (status) {
    case "ready":
      return "success";
    case "incomplete":
    case "configured":
      return "warning";
    case "error":
      return "danger";
    case "disabled":
    default:
      return "default";
  }
}

function getAppwriteConnectionTone(
  status: AppwriteIntegrationStatus | null,
  isChecking: boolean,
): "default" | "success" | "warning" | "danger" {
  if (isChecking) {
    return "warning";
  }

  if (status?.connection_status === "reachable") {
    return "success";
  }

  if (status?.connection_status === "unreachable") {
    return "danger";
  }

  return "default";
}

function getRemoteIdentitySummary(identity: RemoteIdentityState | null) {
  if (identity?.message) {
    return identity.message;
  }

  switch (identity?.status) {
    case "connected":
      return identity.user
        ? `Browser session is connected as ${identity.user.label}. This only adds remote identity; workspace data stays local.`
        : "Browser session is connected to Appwrite. Workspace data stays local.";
    case "ready":
      return "Appwrite auth is available, but no browser session is active yet.";
    case "incomplete":
      return "Appwrite auth was requested, but the required identity settings are still incomplete.";
    case "error":
      return "The Appwrite identity layer is enabled, but the latest browser auth check failed.";
    case "disabled":
    case "local":
    default:
      return "The shell is currently operating in local-only identity mode.";
  }
}

function getRemoteIdentityTone(
  identity: RemoteIdentityState | null,
): "default" | "success" | "warning" | "danger" {
  switch (identity?.status) {
    case "connected":
      return "success";
    case "ready":
    case "incomplete":
      return "warning";
    case "error":
      return "danger";
    case "disabled":
    case "local":
    default:
      return "default";
  }
}

function getRemoteIdentityLabel(identity: RemoteIdentityState | null) {
  switch (identity?.status) {
    case "connected":
      return identity.user ? `Connected (${identity.user.label})` : "Connected";
    case "ready":
      return "Ready";
    case "incomplete":
      return "Incomplete";
    case "error":
      return "Error";
    case "disabled":
      return "Disabled";
    case "local":
    default:
      return "Local only";
  }
}

function getRemoteIdentityModeLabel(identity: RemoteIdentityState | null) {
  if (!identity || identity.mode === "local") {
    return "local";
  }

  return "appwrite";
}

export function SettingsModal() {
  const {
    currentWorkspace,
    currentWorkspaceId,
    isSettingsOpen,
    setSettingsOpen,
    mcpServers,
    remoteIdentity,
    remoteIdentityBusy,
    connectRemoteIdentity,
    disconnectRemoteIdentity,
    refreshConfig,
    refreshRemoteIdentity,
    refreshMcpServers,
    resolvedConfig,
  } = useWorkspace();
  const [settingsForm, setSettingsForm] = React.useState<SettingsFormState>(
    () => buildSettingsForm(resolvedConfig),
  );
  const [mcpForm, setMcpForm] = React.useState<McpFormState>(() =>
    buildMcpForm(),
  );
  const [editingMcpId, setEditingMcpId] = React.useState<string | null>(null);
  const [activeSection, setActiveSection] = React.useState<
    "general" | "workspace" | "mcp" | "environment"
  >("general");
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(
    null,
  );
  const [isSavingConfig, setIsSavingConfig] = React.useState(false);
  const [isSavingMcp, setIsSavingMcp] = React.useState(false);
  const [testingMcpId, setTestingMcpId] = React.useState<string | null>(null);
  const [deletingMcpId, setDeletingMcpId] = React.useState<string | null>(null);
  const [liveAppwriteStatus, setLiveAppwriteStatus] =
    React.useState<AppwriteIntegrationStatus | null>(
      resolvedConfig?.env.appwrite ?? null,
    );
  const [isCheckingAppwrite, setIsCheckingAppwrite] = React.useState(false);
  const [appwriteCheckError, setAppwriteCheckError] = React.useState<
    string | null
  >(null);

  React.useEffect(() => {
    setSettingsForm(buildSettingsForm(resolvedConfig));
    setLiveAppwriteStatus(resolvedConfig?.env.appwrite ?? null);
  }, [resolvedConfig]);

  React.useEffect(() => {
    if (!isSettingsOpen) {
      setActiveSection("general");
      setErrorMessage(null);
      setSuccessMessage(null);
      setEditingMcpId(null);
      setMcpForm(buildMcpForm());
      setAppwriteCheckError(null);
    }
  }, [isSettingsOpen]);

  React.useEffect(() => {
    if (!isSettingsOpen || activeSection !== "environment") {
      return;
    }

    if (!resolvedConfig?.env.appwrite.can_probe) {
      setLiveAppwriteStatus(resolvedConfig?.env.appwrite ?? null);
      setAppwriteCheckError(null);
      return;
    }

    let cancelled = false;

    const checkAppwriteStatus = async () => {
      setIsCheckingAppwrite(true);
      setAppwriteCheckError(null);

      try {
        const res = await fetch("/api/integrations/appwrite/status", {
          cache: "no-store",
        });
        const data = await readJsonResponse<AppwriteIntegrationStatus>(res);

        if (!cancelled) {
          setLiveAppwriteStatus(data);
        }
      } catch (error) {
        if (!cancelled) {
          setAppwriteCheckError(
            getClientErrorMessage(error, "Failed to check Appwrite status."),
          );
        }
      } finally {
        if (!cancelled) {
          setIsCheckingAppwrite(false);
        }
      }
    };

    void checkAppwriteStatus();

    return () => {
      cancelled = true;
    };
  }, [
    activeSection,
    isSettingsOpen,
    resolvedConfig?.env.appwrite,
    resolvedConfig?.env.appwrite.can_probe,
  ]);

  const handleClose = React.useCallback(() => {
    setSettingsOpen(false);
  }, [setSettingsOpen]);

  React.useEffect(() => {
    if (!isSettingsOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleClose, isSettingsOpen]);

  if (!isSettingsOpen) {
    return null;
  }

  const handleSaveConfig = async () => {
    if (!currentWorkspaceId) {
      setErrorMessage("Select a workspace before editing settings.");
      return;
    }

    setIsSavingConfig(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await fetch("/api/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspace_id: currentWorkspaceId,
          app: {
            default_mode: settingsForm.app.default_mode,
            panel_density: settingsForm.app.panel_density,
            code_font_size: Number(settingsForm.app.code_font_size),
            preview_default_path: settingsForm.app.preview_default_path || null,
            deploy_target: settingsForm.app.deploy_target,
            terminal_start_directory: settingsForm.app.terminal_start_directory,
            assistant_response_style: settingsForm.app.assistant_response_style,
          },
          workspace: {
            default_mode: settingsForm.workspace.default_mode || null,
            panel_density: settingsForm.workspace.panel_density || null,
            code_font_size: settingsForm.workspace.code_font_size
              ? Number(settingsForm.workspace.code_font_size)
              : null,
            preview_default_path:
              settingsForm.workspace.preview_default_path || null,
            deploy_target: settingsForm.workspace.deploy_target || null,
            terminal_start_directory:
              settingsForm.workspace.terminal_start_directory || null,
            assistant_response_style:
              settingsForm.workspace.assistant_response_style || null,
            accent_color: settingsForm.workspace.accent_color || null,
            auto_artifact_snapshots:
              settingsForm.workspace.auto_artifact_snapshots,
          },
        }),
      });
      const data = await readJsonResponse<ResolvedConfig>(res);
      setSettingsForm(buildSettingsForm(data));
      await refreshConfig();
      setSuccessMessage("Settings saved.");
    } catch (error) {
      setErrorMessage(getClientErrorMessage(error, "Failed to save settings."));
    } finally {
      setIsSavingConfig(false);
    }
  };

  const handleSaveMcp = async () => {
    if (!currentWorkspaceId) {
      setErrorMessage("Select a workspace before configuring MCP servers.");
      return;
    }

    setIsSavingMcp(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const endpoint = editingMcpId ? `/api/mcp/${editingMcpId}` : "/api/mcp";
      const method = editingMcpId ? "PATCH" : "POST";
      await readJsonResponse<McpServer>(
        await fetch(endpoint, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            workspace_id: currentWorkspaceId,
            name: mcpForm.name,
            transport_type: mcpForm.transport_type,
            endpoint: mcpForm.endpoint || null,
            command: mcpForm.command || null,
            auth_mode: mcpForm.auth_mode,
            enabled: mcpForm.enabled,
            declared_tools: mcpForm.declared_tools,
          }),
        }),
      );
      await refreshMcpServers();
      setEditingMcpId(null);
      setMcpForm(buildMcpForm());
      setSuccessMessage(
        editingMcpId ? "MCP server updated." : "MCP server created.",
      );
    } catch (error) {
      setErrorMessage(
        getClientErrorMessage(error, "Failed to save MCP server."),
      );
    } finally {
      setIsSavingMcp(false);
    }
  };

  const handleTestMcp = async (serverId: string) => {
    setTestingMcpId(serverId);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await readJsonResponse<McpServer>(
        await fetch(`/api/mcp/${serverId}/test`, { method: "POST" }),
      );
      await refreshMcpServers();
      setSuccessMessage("MCP validation completed.");
    } catch (error) {
      setErrorMessage(
        getClientErrorMessage(error, "Failed to validate MCP server."),
      );
    } finally {
      setTestingMcpId(null);
    }
  };

  const handleDeleteMcp = async (serverId: string) => {
    if (!window.confirm("Delete this MCP server definition?")) {
      return;
    }

    setDeletingMcpId(serverId);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await readJsonResponse<{ success: true }>(
        await fetch(`/api/mcp/${serverId}`, { method: "DELETE" }),
      );
      await refreshMcpServers();
      if (editingMcpId === serverId) {
        setEditingMcpId(null);
        setMcpForm(buildMcpForm());
      }
      setSuccessMessage("MCP server deleted.");
    } catch (error) {
      setErrorMessage(
        getClientErrorMessage(error, "Failed to delete MCP server."),
      );
    } finally {
      setDeletingMcpId(null);
    }
  };

  const handleConnectRemoteIdentity = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);

    const nextState = await connectRemoteIdentity();

    if (!nextState) {
      setErrorMessage("Failed to update Appwrite identity state.");
      return;
    }

    if (nextState.status === "connected") {
      setSuccessMessage("Appwrite anonymous session connected.");
      return;
    }

    if (nextState.status === "error") {
      setErrorMessage(nextState.error || "Failed to connect Appwrite session.");
      return;
    }

    setErrorMessage(nextState.message);
  };

  const handleDisconnectRemoteIdentity = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);

    const nextState = await disconnectRemoteIdentity();

    if (!nextState) {
      setErrorMessage("Failed to update Appwrite identity state.");
      return;
    }

    if (nextState.status === "error") {
      setErrorMessage(
        nextState.error || "Failed to disconnect Appwrite session.",
      );
      return;
    }

    if (nextState.status === "ready") {
      setSuccessMessage(
        "Appwrite session disconnected. Local SQLite remains primary.",
      );
      return;
    }

    setErrorMessage(nextState.message);
  };

  const envWarnings = resolvedConfig?.env.warnings ?? [];
  const appwriteStatus = liveAppwriteStatus ?? resolvedConfig?.env.appwrite;
  const identityState = remoteIdentity;
  const combinedEnvWarnings = Array.from(
    new Set([
      ...envWarnings,
      ...(appwriteStatus?.warnings ?? []),
      ...(appwriteStatus?.auth.warnings ?? []),
      ...(identityState?.warnings ?? []),
      ...(appwriteCheckError ? [appwriteCheckError] : []),
    ]),
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={handleClose} />
      <div className="absolute inset-y-6 right-6 flex w-[min(880px,calc(100vw-48px))] overflow-hidden rounded-2xl border border-zinc-800 bg-[#0a0a0c] shadow-2xl shadow-black/60">
        <div className="flex w-56 shrink-0 flex-col border-r border-zinc-800 bg-zinc-950/70">
          <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-4">
            <div>
              <p className="text-sm font-semibold text-zinc-100">
                Workspace Settings
              </p>
              <p className="text-[11px] text-zinc-500">
                {currentWorkspace?.name ?? "No workspace selected"}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-zinc-500 hover:text-zinc-200"
              onClick={handleClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="p-3 space-y-2">
            <NavButton
              active={activeSection === "general"}
              label="General"
              onClick={() => setActiveSection("general")}
            />
            <NavButton
              active={activeSection === "workspace"}
              label="Workspace"
              onClick={() => setActiveSection("workspace")}
            />
            <NavButton
              active={activeSection === "mcp"}
              label="MCP"
              onClick={() => setActiveSection("mcp")}
            />
            <NavButton
              active={activeSection === "environment"}
              label="Environment"
              onClick={() => setActiveSection("environment")}
            />
          </div>
          <div className="mt-auto border-t border-zinc-800 px-4 py-3">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[11px] font-medium text-zinc-300">
                  Appwrite
                </p>
                <div className="flex items-center gap-2">
                  {isCheckingAppwrite && (
                    <LoaderCircle className="h-3 w-3 animate-spin text-zinc-500" />
                  )}
                  <IntegrationStatusBadge
                    status={appwriteStatus?.status ?? "disabled"}
                  />
                </div>
              </div>
              <p className="mt-2 text-[11px] text-zinc-500">
                {getAppwriteFooterCopy(appwriteStatus?.status, identityState)}
              </p>
            </div>
          </div>
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-4">
            <div>
              <p className="text-sm font-semibold text-zinc-100">
                Local-first configuration
              </p>
              <p className="text-[11px] text-zinc-500">
                Settings, MCP definitions, and env status are persisted locally.
              </p>
            </div>
            <Button
              variant="secondary"
              className="h-8 bg-zinc-900 text-zinc-100 hover:bg-zinc-800"
              onClick={handleSaveConfig}
              disabled={isSavingConfig || activeSection === "mcp"}
            >
              {isSavingConfig ? (
                <LoaderCircle className="mr-2 h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="mr-2 h-3.5 w-3.5" />
              )}
              Save Settings
            </Button>
          </div>
          {(errorMessage || successMessage) && (
            <div className="border-b border-zinc-800 px-5 py-3">
              {errorMessage ? (
                <div className="flex items-start gap-2 rounded-lg border border-red-900/60 bg-red-950/40 px-3 py-2 text-[11px] text-red-200">
                  <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              ) : (
                <div className="rounded-lg border border-emerald-900/50 bg-emerald-950/30 px-3 py-2 text-[11px] text-emerald-200">
                  {successMessage}
                </div>
              )}
            </div>
          )}
          <ScrollArea className="flex-1">
            <div className="p-5 space-y-6">
              {activeSection === "general" && (
                <div className="space-y-5">
                  <SectionTitle
                    title="App defaults"
                    description="These values apply across workspaces unless the current workspace overrides them."
                  />
                  <SettingsGrid>
                    <SelectField
                      label="Default Mode"
                      value={settingsForm.app.default_mode}
                      onChange={(value) =>
                        setSettingsForm((previous) => ({
                          ...previous,
                          app: { ...previous.app, default_mode: value },
                        }))
                      }
                      options={[
                        { label: "Write", value: "write" },
                        { label: "Chat", value: "chat" },
                      ]}
                    />
                    <SelectField
                      label="Panel Density"
                      value={settingsForm.app.panel_density}
                      onChange={(value) =>
                        setSettingsForm((previous) => ({
                          ...previous,
                          app: { ...previous.app, panel_density: value },
                        }))
                      }
                      options={[
                        { label: "Comfortable", value: "comfortable" },
                        { label: "Compact", value: "compact" },
                      ]}
                    />
                    <FormField
                      label="Code Font Size"
                      value={settingsForm.app.code_font_size}
                      onChange={(value) =>
                        setSettingsForm((previous) => ({
                          ...previous,
                          app: { ...previous.app, code_font_size: value },
                        }))
                      }
                    />
                    <SelectField
                      label="Assistant Response Style"
                      value={settingsForm.app.assistant_response_style}
                      onChange={(value) =>
                        setSettingsForm((previous) => ({
                          ...previous,
                          app: {
                            ...previous.app,
                            assistant_response_style: value,
                          },
                        }))
                      }
                      options={[
                        { label: "Balanced", value: "balanced" },
                        { label: "Concise", value: "concise" },
                        { label: "Detailed", value: "detailed" },
                      ]}
                    />
                    <FormField
                      label="Default Preview Path"
                      value={settingsForm.app.preview_default_path}
                      onChange={(value) =>
                        setSettingsForm((previous) => ({
                          ...previous,
                          app: { ...previous.app, preview_default_path: value },
                        }))
                      }
                    />
                    <FormField
                      label="Deploy Target"
                      value={settingsForm.app.deploy_target}
                      onChange={(value) =>
                        setSettingsForm((previous) => ({
                          ...previous,
                          app: { ...previous.app, deploy_target: value },
                        }))
                      }
                    />
                    <FormField
                      label="Terminal Start Directory"
                      value={settingsForm.app.terminal_start_directory}
                      onChange={(value) =>
                        setSettingsForm((previous) => ({
                          ...previous,
                          app: {
                            ...previous.app,
                            terminal_start_directory: value,
                          },
                        }))
                      }
                    />
                  </SettingsGrid>
                </div>
              )}
              {activeSection === "workspace" && (
                <div className="space-y-5">
                  <SectionTitle
                    title="Workspace overrides"
                    description="These values apply only to the active workspace. Leave fields blank to inherit app defaults."
                  />
                  <SettingsGrid>
                    <SelectField
                      label="Workspace Default Mode"
                      value={settingsForm.workspace.default_mode}
                      onChange={(value) =>
                        setSettingsForm((previous) => ({
                          ...previous,
                          workspace: {
                            ...previous.workspace,
                            default_mode: value,
                          },
                        }))
                      }
                      options={[
                        { label: "Inherit", value: "" },
                        { label: "Write", value: "write" },
                        { label: "Chat", value: "chat" },
                      ]}
                    />
                    <SelectField
                      label="Workspace Density"
                      value={settingsForm.workspace.panel_density}
                      onChange={(value) =>
                        setSettingsForm((previous) => ({
                          ...previous,
                          workspace: {
                            ...previous.workspace,
                            panel_density: value,
                          },
                        }))
                      }
                      options={[
                        { label: "Inherit", value: "" },
                        { label: "Comfortable", value: "comfortable" },
                        { label: "Compact", value: "compact" },
                      ]}
                    />
                    <FormField
                      label="Workspace Font Size"
                      value={settingsForm.workspace.code_font_size}
                      onChange={(value) =>
                        setSettingsForm((previous) => ({
                          ...previous,
                          workspace: {
                            ...previous.workspace,
                            code_font_size: value,
                          },
                        }))
                      }
                    />
                    <SelectField
                      label="Workspace Response Style"
                      value={settingsForm.workspace.assistant_response_style}
                      onChange={(value) =>
                        setSettingsForm((previous) => ({
                          ...previous,
                          workspace: {
                            ...previous.workspace,
                            assistant_response_style: value,
                          },
                        }))
                      }
                      options={[
                        { label: "Inherit", value: "" },
                        { label: "Balanced", value: "balanced" },
                        { label: "Concise", value: "concise" },
                        { label: "Detailed", value: "detailed" },
                      ]}
                    />
                    <FormField
                      label="Workspace Preview Path"
                      value={settingsForm.workspace.preview_default_path}
                      onChange={(value) =>
                        setSettingsForm((previous) => ({
                          ...previous,
                          workspace: {
                            ...previous.workspace,
                            preview_default_path: value,
                          },
                        }))
                      }
                    />
                    <FormField
                      label="Workspace Deploy Target"
                      value={settingsForm.workspace.deploy_target}
                      onChange={(value) =>
                        setSettingsForm((previous) => ({
                          ...previous,
                          workspace: {
                            ...previous.workspace,
                            deploy_target: value,
                          },
                        }))
                      }
                    />
                    <FormField
                      label="Workspace Terminal Directory"
                      value={settingsForm.workspace.terminal_start_directory}
                      onChange={(value) =>
                        setSettingsForm((previous) => ({
                          ...previous,
                          workspace: {
                            ...previous.workspace,
                            terminal_start_directory: value,
                          },
                        }))
                      }
                    />
                    <FormField
                      label="Accent Color"
                      value={settingsForm.workspace.accent_color}
                      onChange={(value) =>
                        setSettingsForm((previous) => ({
                          ...previous,
                          workspace: {
                            ...previous.workspace,
                            accent_color: value,
                          },
                        }))
                      }
                    />
                  </SettingsGrid>
                  <label className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-950/60 px-4 py-3 text-sm text-zinc-300">
                    <input
                      type="checkbox"
                      checked={settingsForm.workspace.auto_artifact_snapshots}
                      onChange={(event) =>
                        setSettingsForm((previous) => ({
                          ...previous,
                          workspace: {
                            ...previous.workspace,
                            auto_artifact_snapshots: event.target.checked,
                          },
                        }))
                      }
                    />
                    Automatically capture write-mode artifacts for this
                    workspace
                  </label>
                </div>
              )}
              {activeSection === "mcp" && (
                <div className="space-y-6">
                  <SectionTitle
                    title="MCP servers"
                    description="These definitions are stored locally. Validation is local-only and reports honest readiness states."
                  />
                  <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                    <div className="space-y-3">
                      {mcpServers.length === 0 ? (
                        <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-4 text-sm text-zinc-500">
                          No MCP server definitions exist for this workspace
                          yet.
                        </div>
                      ) : (
                        mcpServers.map((server) => (
                          <div
                            key={server.id}
                            className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="truncate text-sm font-medium text-zinc-100">
                                    {server.name}
                                  </p>
                                  <Badge
                                    variant="outline"
                                    className="border-zinc-700 text-[10px] text-zinc-400"
                                  >
                                    {server.transport_type}
                                  </Badge>
                                  <StatusBadge status={server.status} />
                                </div>
                                <p className="mt-1 text-[11px] text-zinc-500">
                                  {server.command ||
                                    server.endpoint ||
                                    "No transport target configured."}
                                </p>
                                <p className="mt-2 text-[11px] text-zinc-400">
                                  {server.tool_count} declared tool
                                  {server.tool_count === 1 ? "" : "s"}
                                </p>
                                {server.last_error && (
                                  <p className="mt-2 text-[11px] text-red-300">
                                    {server.last_error}
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 px-2 text-zinc-400 hover:text-zinc-200"
                                  onClick={() => {
                                    setEditingMcpId(server.id);
                                    setMcpForm(buildMcpForm(server));
                                  }}
                                >
                                  Edit
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 px-2 text-zinc-400 hover:text-zinc-200"
                                  onClick={() => handleTestMcp(server.id)}
                                  disabled={testingMcpId === server.id}
                                >
                                  {testingMcpId === server.id
                                    ? "Testing…"
                                    : "Test"}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-zinc-500 hover:text-red-200"
                                  onClick={() => handleDeleteMcp(server.id)}
                                  disabled={deletingMcpId === server.id}
                                >
                                  {deletingMcpId === server.id ? (
                                    <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                                  ) : (
                                    <Trash2 className="h-3.5 w-3.5" />
                                  )}
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-zinc-100">
                            {editingMcpId
                              ? "Edit MCP Server"
                              : "New MCP Server"}
                          </p>
                          <p className="text-[11px] text-zinc-500">
                            Local configuration only.
                          </p>
                        </div>
                        {editingMcpId && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-zinc-400 hover:text-zinc-200"
                            onClick={() => {
                              setEditingMcpId(null);
                              setMcpForm(buildMcpForm());
                            }}
                          >
                            Reset
                          </Button>
                        )}
                      </div>
                      <FormField
                        label="Name"
                        value={mcpForm.name}
                        onChange={(value) =>
                          setMcpForm((previous) => ({
                            ...previous,
                            name: value,
                          }))
                        }
                      />
                      <SelectField
                        label="Transport"
                        value={mcpForm.transport_type}
                        onChange={(value) =>
                          setMcpForm((previous) => ({
                            ...previous,
                            transport_type:
                              value as McpFormState["transport_type"],
                          }))
                        }
                        options={[
                          { label: "HTTP", value: "http" },
                          { label: "SSE", value: "sse" },
                          { label: "stdio", value: "stdio" },
                        ]}
                      />
                      <FormField
                        label="Endpoint"
                        value={mcpForm.endpoint}
                        onChange={(value) =>
                          setMcpForm((previous) => ({
                            ...previous,
                            endpoint: value,
                          }))
                        }
                      />
                      <FormField
                        label="Command"
                        value={mcpForm.command}
                        onChange={(value) =>
                          setMcpForm((previous) => ({
                            ...previous,
                            command: value,
                          }))
                        }
                      />
                      <SelectField
                        label="Auth Mode"
                        value={mcpForm.auth_mode}
                        onChange={(value) =>
                          setMcpForm((previous) => ({
                            ...previous,
                            auth_mode: value as McpFormState["auth_mode"],
                          }))
                        }
                        options={[
                          { label: "None", value: "none" },
                          { label: "Bearer", value: "bearer" },
                          { label: "Header", value: "header" },
                        ]}
                      />
                      <FormField
                        label="Declared Tools"
                        value={mcpForm.declared_tools}
                        onChange={(value) =>
                          setMcpForm((previous) => ({
                            ...previous,
                            declared_tools: value,
                          }))
                        }
                      />
                      <label className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-sm text-zinc-300">
                        <input
                          type="checkbox"
                          checked={mcpForm.enabled}
                          onChange={(event) =>
                            setMcpForm((previous) => ({
                              ...previous,
                              enabled: event.target.checked,
                            }))
                          }
                        />
                        Enabled
                      </label>
                      <Button
                        className="w-full bg-[#F6FF00] text-black hover:bg-[#F6FF00]/90"
                        onClick={handleSaveMcp}
                        disabled={isSavingMcp}
                      >
                        {isSavingMcp ? (
                          <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <PlugZap className="mr-2 h-4 w-4" />
                        )}
                        {editingMcpId ? "Save MCP Server" : "Create MCP Server"}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
              {activeSection === "environment" && (
                <div className="space-y-5">
                  <SectionTitle
                    title="Environment status"
                    description="The app stays local-first. Appwrite is optional and only marked ready after a server-side health probe succeeds."
                  />
                  <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-zinc-100">
                            Appwrite integration
                          </p>
                          <IntegrationStatusBadge
                            status={appwriteStatus?.status ?? "disabled"}
                          />
                          {isCheckingAppwrite && (
                            <LoaderCircle className="h-3.5 w-3.5 animate-spin text-zinc-500" />
                          )}
                        </div>
                        <p className="mt-2 text-[11px] text-zinc-500">
                          {getAppwriteSummary(
                            appwriteStatus ?? null,
                            isCheckingAppwrite,
                          )}
                        </p>
                        <p className="mt-2 text-[11px] text-zinc-500">
                          {getRemoteIdentitySummary(identityState)}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button
                        variant="secondary"
                        className="h-8 bg-zinc-900 text-zinc-100 hover:bg-zinc-800"
                        onClick={() => void refreshRemoteIdentity()}
                        disabled={
                          remoteIdentityBusy != null || isCheckingAppwrite
                        }
                      >
                        {remoteIdentityBusy === "refresh" ? (
                          <LoaderCircle className="mr-2 h-3.5 w-3.5 animate-spin" />
                        ) : null}
                        Refresh Identity
                      </Button>
                      {appwriteStatus?.auth.status === "ready" &&
                        identityState?.status !== "connected" && (
                          <Button
                            className="h-8 bg-[#F6FF00] text-black hover:bg-[#F6FF00]/90"
                            onClick={handleConnectRemoteIdentity}
                            disabled={
                              remoteIdentityBusy != null || isCheckingAppwrite
                            }
                          >
                            {remoteIdentityBusy === "connect" ? (
                              <LoaderCircle className="mr-2 h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <PlugZap className="mr-2 h-3.5 w-3.5" />
                            )}
                            Connect Anonymous Session
                          </Button>
                        )}
                      {identityState?.status === "connected" && (
                        <Button
                          variant="secondary"
                          className="h-8 bg-zinc-900 text-zinc-100 hover:bg-zinc-800"
                          onClick={handleDisconnectRemoteIdentity}
                          disabled={remoteIdentityBusy != null}
                        >
                          {remoteIdentityBusy === "disconnect" ? (
                            <LoaderCircle className="mr-2 h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <X className="mr-2 h-3.5 w-3.5" />
                          )}
                          Disconnect Session
                        </Button>
                      )}
                    </div>
                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      <EnvironmentCard
                        title="Appwrite Status"
                        value={appwriteStatus?.status ?? "disabled"}
                        tone={getAppwriteStatusTone(appwriteStatus?.status)}
                      />
                      <EnvironmentCard
                        title="Auth Mode"
                        value={getAppwriteAuthSummary(appwriteStatus ?? null)}
                        tone={getAppwriteAuthTone(appwriteStatus ?? null)}
                      />
                      <EnvironmentCard
                        title="Connection Probe"
                        value={getAppwriteConnectionLabel(
                          appwriteStatus ?? null,
                          isCheckingAppwrite,
                        )}
                        tone={getAppwriteConnectionTone(
                          appwriteStatus ?? null,
                          isCheckingAppwrite,
                        )}
                      />
                      <EnvironmentCard
                        title="Identity Mode"
                        value={getRemoteIdentityModeLabel(identityState)}
                        tone={getRemoteIdentityTone(identityState)}
                      />
                      <EnvironmentCard
                        title="Identity Session"
                        value={getRemoteIdentityLabel(identityState)}
                        tone={getRemoteIdentityTone(identityState)}
                      />
                      <EnvironmentCard
                        title="Endpoint"
                        value={appwriteStatus?.endpoint ?? "Not set"}
                      />
                      <EnvironmentCard
                        title="Current Identity"
                        value={identityState?.user?.label ?? "Not connected"}
                        tone={
                          identityState?.status === "connected"
                            ? "success"
                            : "default"
                        }
                      />
                    </div>
                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      <EnvironmentCard
                        title="Project ID"
                        value={appwriteStatus?.project_id ?? "Not set"}
                      />
                      <EnvironmentCard
                        title="API Key"
                        value={
                          appwriteStatus?.has_api_key ? "Configured" : "Missing"
                        }
                        tone={
                          appwriteStatus?.has_api_key
                            ? "success"
                            : appwriteStatus?.auth.enabled
                              ? "warning"
                              : "default"
                        }
                      />
                    </div>
                    {appwriteStatus?.error && (
                      <div className="mt-4 flex items-start gap-2 rounded-lg border border-red-900/60 bg-red-950/30 px-3 py-2 text-[11px] text-red-200">
                        <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                        <span>{appwriteStatus.error}</span>
                      </div>
                    )}
                    {appwriteStatus?.auth.error && (
                      <div className="mt-4 flex items-start gap-2 rounded-lg border border-red-900/60 bg-red-950/30 px-3 py-2 text-[11px] text-red-200">
                        <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                        <span>{appwriteStatus.auth.error}</span>
                      </div>
                    )}
                    {identityState?.error && (
                      <div className="mt-4 flex items-start gap-2 rounded-lg border border-red-900/60 bg-red-950/30 px-3 py-2 text-[11px] text-red-200">
                        <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                        <span>{identityState.error}</span>
                      </div>
                    )}
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <EnvironmentCard
                      title="APP_URL"
                      value={resolvedConfig?.env.app_url ?? "Not set"}
                      tone={
                        resolvedConfig?.env.app_url_valid
                          ? "success"
                          : "default"
                      }
                    />
                    <EnvironmentCard
                      title="Disable HMR"
                      value={resolvedConfig?.env.disable_hmr ? "true" : "false"}
                    />
                  </div>
                  {combinedEnvWarnings.length > 0 && (
                    <div className="space-y-2">
                      {combinedEnvWarnings.map((warning) => (
                        <div
                          key={warning}
                          className="flex items-start gap-2 rounded-lg border border-amber-900/50 bg-amber-950/30 px-3 py-2 text-[11px] text-amber-200"
                        >
                          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                          <span>{warning}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}

function NavButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
        active
          ? "border-zinc-700 bg-zinc-900 text-zinc-100"
          : "border-transparent text-zinc-500 hover:border-zinc-800 hover:bg-zinc-900/50 hover:text-zinc-300"
      }`}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

function SectionTitle({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-2">
        <Settings2 className="h-4 w-4 text-zinc-500" />
        <p className="text-sm font-medium text-zinc-100">{title}</p>
      </div>
      <p className="mt-1 text-[11px] text-zinc-500">{description}</p>
    </div>
  );
}

function SettingsGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 md:grid-cols-2">{children}</div>;
}

function FormField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="space-y-2">
      <span className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">
        {label}
      </span>
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="border-zinc-800 bg-zinc-950/60 text-zinc-100"
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ label: string; value: string }>;
}) {
  return (
    <label className="space-y-2">
      <span className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="flex h-9 w-full rounded-md border border-zinc-800 bg-zinc-950/60 px-3 py-1 text-sm text-zinc-100 shadow-sm outline-none"
      >
        {options.map((option) => (
          <option key={option.value || option.label} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function StatusBadge({ status }: { status: McpServer["status"] }) {
  const styles = {
    disabled: "border-zinc-700 text-zinc-500",
    unconfigured: "border-amber-700/50 bg-amber-950/30 text-amber-200",
    offline: "border-blue-700/50 bg-blue-950/30 text-blue-200",
    ready: "border-emerald-700/50 bg-emerald-950/30 text-emerald-200",
  } as const;

  return (
    <Badge variant="outline" className={`text-[10px] ${styles[status]}`}>
      {status}
    </Badge>
  );
}

function IntegrationStatusBadge({
  status,
}: {
  status: AppwriteIntegrationStatus["status"];
}) {
  const styles = {
    disabled: "border-zinc-700 text-zinc-500",
    incomplete: "border-amber-700/50 bg-amber-950/30 text-amber-200",
    configured: "border-blue-700/50 bg-blue-950/30 text-blue-200",
    ready: "border-emerald-700/50 bg-emerald-950/30 text-emerald-200",
    error: "border-red-700/50 bg-red-950/30 text-red-200",
  } as const;

  return (
    <Badge variant="outline" className={`text-[10px] ${styles[status]}`}>
      {status}
    </Badge>
  );
}

function EnvironmentCard({
  title,
  value,
  tone = "default",
}: {
  title: string;
  value: string;
  tone?: "default" | "success" | "warning" | "danger";
}) {
  const toneClass =
    tone === "success"
      ? "border-emerald-800/60 bg-emerald-950/20"
      : tone === "warning"
        ? "border-amber-800/60 bg-amber-950/20"
        : tone === "danger"
          ? "border-red-800/60 bg-red-950/20"
        : "border-zinc-800 bg-zinc-950/60";

  return (
    <div className={`rounded-xl border p-4 ${toneClass}`}>
      <p className="text-[11px] uppercase tracking-wide text-zinc-500">
        {title}
      </p>
      <p className="mt-2 break-all text-sm text-zinc-200">{value}</p>
    </div>
  );
}
