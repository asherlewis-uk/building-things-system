export type DensityPreference = "compact" | "comfortable";

export type LibraryItemType = "note" | "prompt" | "context";

export type ActiveRuntimeKind = "provider" | "ollama-compatible";

export type ActiveRuntimeSource = "provider" | "builtin" | "saved" | "manual";

export type LibraryItem = {
  id: string;
  title: string;
  content: string;
  type: LibraryItemType;
  createdAt: number;
  updatedAt: number;
};

export type RuntimeEndpoint = {
  id: string;
  name: string;
  baseUrl: string;
  notes?: string;
  createdAt: number;
  updatedAt: number;
};

export type ActiveRuntime = {
  key: string;
  name: string;
  model: string;
  kind: ActiveRuntimeKind;
  source: ActiveRuntimeSource;
  baseUrl?: string;
};
