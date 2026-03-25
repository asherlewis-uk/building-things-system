# Building.Things

A high-fidelity local IDE workspace shell with dual-mode interaction, SQLite-backed persistence, offline previewing, and a fully stubbed local AI layer.

## What This Project Is

Building.Things is a local-first IDE shell built with Next.js App Router. It is designed to feel like a multi-panel coding workspace while keeping the entire persistence and assistant loop grounded in local application state.

The app is intentionally not wired to Anthropic, Gemini, or any other hosted model provider. The UI, routing, state management, database persistence, terminal simulation, preview generation, and write-mode flows are all real. The assistant layer is local and stubbed so the shell can be exercised without external API keys or outbound AI calls.

## Appwrite Integration

Appwrite is optional in this repository.

- **What Appwrite is used for today**
  - A server-side reachability probe so the settings UI can report whether an Appwrite endpoint is actually reachable.
  - An optional managed anonymous-session bootstrap used only for remote identity state.

- **What still stays local**
  - Workspaces, sessions, messages, files, artifacts, deployments, settings, MCP records, terminal state, and preview inputs all remain in local SQLite.
  - The assistant loop remains local and stubbed.

- **Required environment variables**
  - `APPWRITE_ENDPOINT` and `APPWRITE_PROJECT_ID` are required for the reachability probe.
  - `APPWRITE_API_KEY` is only required when `APPWRITE_AUTH_MODE="anonymous"`.
  - `APPWRITE_AUTH_MODE` supports `off` and `anonymous`.

- **Current limitations**
  - A successful probe only confirms endpoint reachability. It does not verify future collection access, permissions, or data-model readiness.
  - The current Appwrite pass does not sync or migrate local records into Appwrite.
  - Anonymous identity support still depends on Appwrite project settings allowing anonymous sessions.

## AI Agent Primer

If you are an AI agent or a new maintainer landing in this repository, the most important framing is this:

- **This is a real local IDE shell, not a fake prototype**
  - The panels, persistence, CRUD flows, workspace switching, config management, MCP records, preview generation, and write-mode execution paths are implemented.

- **This is not a hosted AI integration app**
  - External provider calls are intentionally absent.
  - `lib/ai-stub.ts` and `lib/services/assistant.ts` preserve a local-only assistant loop.

- **The architecture should stay honest**
  - No fake success states.
  - No silent no-ops.
  - No UI that implies remote execution when behavior is local or simulated.

- **Scope matters everywhere**
  - Files, sessions, artifacts, deployments, settings, and MCP state all belong to a workspace or session scope.

## Build Progress Snapshot

### Completed and working

- **Shell integration**
  - The main shell uses the new provider-backed sidebar, center panel, inspector panel, bottom rail, and settings modal.

- **Multi-workspace support**
  - Workspaces can be created, selected, renamed, deleted, and persisted.
  - The active workspace is stored and rehydrated from local app state.

- **Dual-mode behavior**
  - Sessions and messages support `chat` and `write`.
  - The current mode is explicitly sent with messages to avoid race conditions during mode switching.

- **Workspace-scoped resources**
  - Files, sessions, artifacts, deployments, terminal behavior, config, and MCP records are scoped correctly.

- **Inspector surfaces**
  - Code editing, offline preview, mobile preview, artifacts, and pseudo-deploy history are wired.

- **Config and MCP management**
  - Settings are persisted locally.
  - MCP entries can be created, updated, deleted, tested, and validated.

- **Terminal and preview**
  - The terminal is a real virtual shell over saved workspace files.
  - Preview is an honest rendering of saved file content, not a hidden live execution environment.

### Verified recently

- **Static verification**
  - `npm run lint` passes.
  - `npm run build` passes.

- **Read-only runtime verification**
  - The app root and key read-only API surfaces responded successfully on a clean dev server.

### Intentionally deferred or constrained

- **External model providers**
  - Anthropic, Gemini, and similar hosted AI calls are intentionally not integrated.

- **Host shell passthrough**
  - The terminal does not execute arbitrary host machine commands.

- **Real deployment backends**
  - Deployments are local pseudo-deploy records unless a future change explicitly introduces a real deployment provider.

## Feature Status Matrix

| Capability                          | Status                        | Authoritative files                                                                                                               |
| ----------------------------------- | ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Workspace selection and persistence | Implemented                   | `components/workspace/workspace-provider.tsx`, `lib/services/workspaces.ts`, `app/api/workspaces/**`                              |
| Session CRUD and mode persistence   | Implemented                   | `lib/services/workspaces.ts`, `app/api/sessions/**`                                                                               |
| Chat and write execution            | Implemented, local-only       | `components/workspace/center-panel-content.tsx`, `app/api/sessions/[id]/messages/route.ts`, `lib/services/assistant.ts`           |
| File CRUD and editor state          | Implemented                   | `components/workspace/sidebar-panel.tsx`, `components/workspace/inspector-panel.tsx`, `app/api/files/**`, `lib/services/files.ts` |
| Terminal rail                       | Implemented as virtual shell  | `components/workspace/bottom-rail.tsx`, `app/api/terminal/route.ts`, `lib/terminal.ts`                                            |
| Offline preview and mobile preview  | Implemented                   | `components/workspace/inspector-panel.tsx`, `app/api/preview/[id]/route.ts`, `lib/preview.ts`                                     |
| Artifacts                           | Implemented                   | `app/api/sessions/[id]/artifacts/route.ts`, `lib/services/artifacts.ts`                                                           |
| Deployments                         | Implemented as pseudo-deploys | `app/api/sessions/[id]/deployments/route.ts`, `lib/services/deployments.ts`                                                       |
| Config management                   | Implemented                   | `components/workspace/settings-modal.tsx`, `app/api/config/route.ts`, `lib/services/config.ts`                                    |
| MCP management                      | Implemented, local-first      | `components/workspace/settings-modal.tsx`, `app/api/mcp/**`, `lib/services/mcp.ts`                                                |
| External AI providers               | Intentionally stubbed         | `lib/ai-stub.ts`, `lib/services/assistant.ts`                                                                                     |

## Core Product Model

The app revolves around a few core records:

- **Workspace**
  - The top-level container for files, sessions, MCP configuration, and workspace-specific settings.

- **Session**
  - A conversation or execution thread inside a workspace.
  - Each session has a persisted mode: `chat` or `write`.

- **Message**
  - A user or assistant message belonging to a session.
  - Messages persist the mode they were created in so mode transitions remain auditable.

- **File**
  - A virtual workspace file stored in SQLite.
  - Paths are normalized and scoped per workspace.

- **Artifact**
  - A saved output generated during a session, especially write-mode work.

- **Deployment**
  - A local pseudo-deploy record used to model deployment history honestly without pretending a real remote deploy happened.

- **MCP Server**
  - A persisted configuration record for workspace-scoped MCP connectivity and tool declarations.

## Architecture at a Glance

At a high level, the app is split into four layers:

1. **UI shell**
   - React components under `components/workspace/`
   - Renders the sidebar, center conversation area, inspector, bottom terminal rail, and settings modal

2. **Client state and orchestration**
   - `components/workspace/workspace-provider.tsx`
   - Owns active workspace/session/file selection, mode state, config loading, MCP lists, and shared refresh methods

3. **API routes**
   - `app/api/**`
   - Thin request/response layer that validates inputs and delegates to services

4. **Domain services and storage**
   - `lib/services/**`
   - `lib/db.ts`, `lib/db-schema.ts`
   - `lib/virtual-fs.ts`, `lib/preview.ts`, `lib/terminal.ts`, `lib/ai-stub.ts`

The general request flow looks like this:

`UI component -> WorkspaceProvider / local state -> fetch('/api/...') -> service layer -> SQLite / local helpers -> response -> SWR refresh / provider refresh`

## Agent Navigation Map

If you are changing a feature, start from the authoritative file for that concern instead of grepping randomly.

- **Workspace switching bugs**
  - Start at `components/workspace/workspace-provider.tsx`
  - Then inspect `lib/services/workspaces.ts`
  - Then confirm API behavior in `app/api/workspaces/active/route.ts`

- **Chat vs write mode bugs**
  - Start at `components/workspace/center-panel-content.tsx`
  - Then inspect `app/api/sessions/[id]/messages/route.ts`
  - Then inspect `lib/services/assistant.ts`

- **File tree or editor bugs**
  - Start at `components/workspace/sidebar-panel.tsx` and `components/workspace/inspector-panel.tsx`
  - Then inspect `app/api/files/**`
  - Then inspect `lib/services/files.ts` and `lib/virtual-fs.ts`

- **Terminal bugs**
  - Start at `components/workspace/bottom-rail.tsx`
  - Then inspect `app/api/terminal/route.ts`
  - Then inspect `lib/terminal.ts`

- **Preview bugs**
  - Start at `components/workspace/inspector-panel.tsx`
  - Then inspect `app/api/preview/[id]/route.ts`
  - Then inspect `lib/preview.ts`

- **Settings or MCP bugs**
  - Start at `components/workspace/settings-modal.tsx`
  - Then inspect `app/api/config/route.ts` or `app/api/mcp/**`
  - Then inspect `lib/services/config.ts` and `lib/services/mcp.ts`

- **Database or schema bugs**
  - Start at `lib/db.ts`, `lib/db-schema.ts`, and `lib/types.ts`
  - Then verify all route and service assumptions still match the schema

## Frontend Architecture

The workspace UI is composed of a set of focused panels.

### `components/workspace/shell.tsx`

- Mounts the full workspace shell
- Wraps the app in `WorkspaceProvider`
- Hosts the three main columns and the bottom rail
- Mounts `SettingsModal` once at the shell level

### `components/workspace/workspace-provider.tsx`

This is the authoritative client-side coordination layer.

It is responsible for:

- Loading the active workspace and workspace list
- Persisting workspace switching through `/api/workspaces/active`
- Tracking the selected session and selected file
- Exposing the current interaction mode
- Loading effective config and MCP server state
- Providing shared refresh functions consumed by multiple panels
- Keeping workspace-scoped UI state synchronized after writes, file changes, or settings updates

### `components/workspace/sidebar-panel.tsx`

Responsible for navigation and workspace-scoped management:

- Workspace creation, rename, delete, and selection
- Session creation and selection
- File tree browsing and file CRUD actions
- MCP visibility and settings entry points
- Search and selection UX for the left rail

### `components/workspace/center-panel-content.tsx`

Owns the main conversation and execution experience:

- Displays session messages
- Sends new user messages to `/api/sessions/[id]/messages`
- Supports both `chat` and `write` mode
- Streams assistant output back into the center panel
- Refreshes workspace-scoped files, sessions, and artifacts after write-mode operations
- Handles share/notice/error states for the central workflow

### `components/workspace/inspector-panel.tsx`

Owns the right-hand utility surfaces:

- Code editor view for the selected file
- Offline preview and mobile preview
- Artifact list and artifact details
- Pseudo-deploy history and actions

### `components/workspace/bottom-rail.tsx`

Implements the local terminal rail:

- Tracks terminal history by workspace/session key
- Maintains current working directory per scoped terminal history
- Sends commands to `/api/terminal`
- Uses config to seed the initial terminal directory

### `components/workspace/settings-modal.tsx`

Central place for settings and integration management:

- App-level and workspace-level configuration editing
- MCP server create/update/delete/test flows
- Validation feedback and persisted configuration state

## Backend and Service Architecture

The backend is intentionally thin at the route layer. Business logic lives in `lib/services/`.

### API route responsibilities

Routes under `app/api/` generally do three things:

- Parse and validate request input
- Resolve the correct workspace or session scope
- Delegate to a service function and normalize the response

Important route groups include:

- `app/api/workspaces/**`
  - Workspace list, create, update, delete, and active workspace persistence

- `app/api/sessions/**`
  - Session list/create/update/delete
  - Message fetch/create
  - Session-scoped artifacts and deployments

- `app/api/files/**`
  - Workspace-scoped file list and file CRUD

- `app/api/config/route.ts`
  - Effective config resolution and persistence

- `app/api/mcp/**`
  - MCP server list/create/update/delete/test

- `app/api/terminal/route.ts`
  - Workspace-scoped terminal command execution over virtual files

- `app/api/preview/[id]/route.ts`
  - Offline rendering of saved file content

### Domain services

`lib/services/workspaces.ts`

- Creates, updates, deletes, and resolves workspaces
- Persists the active workspace
- Manages session CRUD, archive/restore, and workspace scoping

`lib/services/files.ts`

- Creates, updates, deletes, and loads files
- Validates and normalizes virtual paths
- Enforces workspace-scoped uniqueness

`lib/services/config.ts`

- Defines app and workspace defaults
- Merges effective configuration
- Reads environment-derived status
- Normalizes persisted settings into a consistent shape

`lib/services/mcp.ts`

- Persists MCP server configuration
- Validates transport/auth/tool declaration inputs
- Updates status fields and test metadata
- Keeps malformed stored `declared_tools_json` from breaking the UI or API flows

`lib/services/artifacts.ts`

- Lists and creates session artifacts
- Validates artifact content and metadata constraints

`lib/services/deployments.ts`

- Creates local pseudo-deploy records
- Stores status, environment, logs, and summary fields for the deploy inspector UI

`lib/services/assistant.ts`

- Implements local assistant behavior for both `chat` and `write`
- Interprets user prompts for write operations
- Can create or update files and produce artifacts during write mode
- Builds deterministic local assistant responses without relying on external providers

## HTTP API Reference

These tables describe the current API surface under `app/api/`.

### API conventions

- **JSON by default**
  - Most mutation routes expect JSON request bodies and return JSON responses.

- **Streaming responses for assistant output**
  - `POST /api/chat`
  - `POST /api/sessions/[id]/messages`
  - These return `text/plain` streams and include the `X-AI-Stub` response header.

- **Workspace scoping**
  - Many list and config routes accept a `workspace_id` input.
  - `workspace_id = "active"` resolves through the persisted active workspace.
  - `workspace_id = "default"` resolves to the earliest/default workspace.

### Workspace endpoints

| Route                    | Methods                  | Purpose                                   | Key inputs / notes         |
| ------------------------ | ------------------------ | ----------------------------------------- | -------------------------- |
| `/api/workspaces`        | `GET`, `POST`            | List all workspaces or create a workspace | `POST` body: `name`        |
| `/api/workspaces/[id]`   | `GET`, `PATCH`, `DELETE` | Load, rename, or delete a workspace       | `PATCH` body: `name`       |
| `/api/workspaces/active` | `GET`, `PUT`             | Load or persist the active workspace      | `PUT` body: `workspace_id` |

### Session endpoints

| Route                            | Methods                  | Purpose                                                               | Key inputs / notes                                                                              |
| -------------------------------- | ------------------------ | --------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `/api/sessions`                  | `GET`, `POST`            | List workspace sessions or create a session                           | `GET` query: `workspace_id`, `include_archived=1`; `POST` body: `title`, `workspace_id`, `mode` |
| `/api/sessions/[id]`             | `GET`, `PATCH`, `DELETE` | Load, update, archive/restore, or delete a session                    | `PATCH` body supports `title`, `mode`, `archived`, `restore`                                    |
| `/api/sessions/[id]/messages`    | `GET`, `POST`            | Load session messages or append a message and stream assistant output | `POST` body: `content`, `role`, `mode`, `current_file_id`                                       |
| `/api/sessions/[id]/artifacts`   | `GET`, `POST`            | List or create session artifacts                                      | `POST` body: `title`, `type`, `content`, `metadata_json`                                        |
| `/api/sessions/[id]/deployments` | `GET`, `POST`            | List or create pseudo-deployment records                              | `POST` body: `environment`, `url`, `summary`                                                    |

### File, preview, and artifact endpoints

| Route                 | Methods                         | Purpose                                            | Key inputs / notes                                                                          |
| --------------------- | ------------------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `/api/files`          | `GET`, `POST`                   | List workspace files or create a file              | `GET` query: `workspace_id`; `POST` body: `workspace_id`, `name`, `path`, `content`, `type` |
| `/api/files/[id]`     | `GET`, `PUT`, `PATCH`, `DELETE` | Load, update, or delete a file                     | `PUT/PATCH` body: `content`, `name`, `path`, `type`                                         |
| `/api/preview/[id]`   | `GET`                           | Build an offline preview payload from a saved file | Returns HTML or SVG content depending on file type                                          |
| `/api/artifacts/[id]` | `DELETE`                        | Delete a single artifact                           | Used by inspector-side artifact management                                                  |

### Config, MCP, terminal, and ad hoc chat endpoints

| Route                | Methods                  | Purpose                                             | Key inputs / notes                                                                                                                                  |
| -------------------- | ------------------------ | --------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/api/config`        | `GET`, `PUT`             | Load or persist app/workspace settings              | `GET` query: `workspace_id`; `PUT` body: `workspace_id`, `app`, `workspace`                                                                         |
| `/api/mcp`           | `GET`, `POST`            | List or create workspace MCP server records         | `GET` query: `workspace_id`; `POST` body: `workspace_id`, `name`, `transport_type`, `endpoint`, `command`, `auth_mode`, `enabled`, `declared_tools` |
| `/api/mcp/[id]`      | `GET`, `PATCH`, `DELETE` | Load, update, or delete a single MCP server         | `PATCH` body mirrors MCP editable fields                                                                                                            |
| `/api/mcp/[id]/test` | `POST`                   | Re-validate a persisted MCP configuration           | Returns the updated server record with validation status fields                                                                                     |
| `/api/terminal`      | `POST`                   | Execute a workspace-scoped virtual terminal command | Body: `command`, `cwd`, `sessionId`, `workspace_id`                                                                                                 |
| `/api/chat`          | `POST`                   | Run ad hoc local chat without a persisted session   | Body: `messages`, `system`; always local-only                                                                                                       |

## Persistence and Database Design

SQLite is the source of truth for the shell. The database file is `workspace.db`.

### Database entry points

- `lib/db.ts`
  - Opens the singleton SQLite connection
  - Initializes schema on first use
  - Stores and retrieves app-state values such as the active workspace

- `lib/db-schema.ts`
  - Creates base tables and indexes
  - Performs lightweight schema evolution with `ensureColumn(...)`
  - Normalizes historical file paths and file metadata

### Important tables

- `workspaces`
- `sessions`
- `messages`
- `files`
- `artifacts`
- `deployments`
- `mcp_servers`
- `app_state`

### Persistence rules worth knowing

- Files are stored per workspace, not globally
- File paths are normalized through the virtual filesystem utilities
- The active workspace is stored in `app_state`
- Session mode is persisted on the session and on each message
- Workspace settings are merged with app defaults to produce effective config

## Database Schema Reference

SQLite is permissive, so the canonical application contract is the combination of `lib/db-schema.ts` and `lib/types.ts`.

### `workspaces`

| Column          | Application shape | Notes                                     |
| --------------- | ----------------- | ----------------------------------------- |
| `id`            | `string`          | Primary key                               |
| `name`          | `string`          | Display name                              |
| `created_at`    | `string`          | ISO timestamp                             |
| `updated_at`    | `string`          | ISO timestamp; added via schema evolution |
| `settings_json` | `string \| null`  | Serialized workspace settings blob        |

### `sessions`

| Column         | Application shape   | Notes                          |
| -------------- | ------------------- | ------------------------------ |
| `id`           | `string`            | Primary key                    |
| `workspace_id` | `string`            | Foreign key to `workspaces.id` |
| `title`        | `string`            | Session title                  |
| `mode`         | `"chat" \| "write"` | Persisted session mode         |
| `created_at`   | `string`            | ISO timestamp                  |
| `updated_at`   | `string`            | ISO timestamp                  |
| `archived_at`  | `string \| null`    | Soft-archive marker            |

### `messages`

| Column          | Application shape                   | Notes                                                    |
| --------------- | ----------------------------------- | -------------------------------------------------------- |
| `id`            | `string`                            | Primary key                                              |
| `session_id`    | `string`                            | Foreign key to `sessions.id`                             |
| `role`          | `"user" \| "assistant" \| "system"` | Message author role                                      |
| `content`       | `string`                            | Stored message text                                      |
| `mode`          | `"chat" \| "write"`                 | Mode in effect when the message was created              |
| `metadata_json` | `string \| null`                    | Serialized structured metadata, especially write results |
| `created_at`    | `string`                            | ISO timestamp                                            |

### `files`

| Column         | Application shape | Notes                                     |
| -------------- | ----------------- | ----------------------------------------- |
| `id`           | `string`          | Primary key                               |
| `workspace_id` | `string`          | Foreign key to `workspaces.id`            |
| `name`         | `string`          | Display filename                          |
| `path`         | `string`          | Normalized workspace-relative stored path |
| `content`      | `string`          | Full saved file contents                  |
| `type`         | `string`          | Inferred or supplied file type            |
| `created_at`   | `string`          | ISO timestamp                             |
| `updated_at`   | `string`          | ISO timestamp                             |

### `artifacts`

| Column          | Application shape | Notes                        |
| --------------- | ----------------- | ---------------------------- |
| `id`            | `string`          | Primary key                  |
| `session_id`    | `string`          | Foreign key to `sessions.id` |
| `title`         | `string`          | Artifact title               |
| `type`          | `string`          | Artifact category            |
| `content`       | `string`          | Stored artifact body         |
| `metadata_json` | `string \| null`  | Serialized artifact metadata |
| `created_at`    | `string`          | ISO timestamp                |

### `deployments`

| Column        | Application shape                    | Notes                             |
| ------------- | ------------------------------------ | --------------------------------- |
| `id`          | `string`                             | Primary key                       |
| `session_id`  | `string`                             | Foreign key to `sessions.id`      |
| `environment` | `string`                             | Target environment label          |
| `status`      | `"pending" \| "success" \| "failed"` | Pseudo-deployment state           |
| `url`         | `string \| null`                     | Optional deployment URL           |
| `created_at`  | `string`                             | ISO timestamp                     |
| `updated_at`  | `string`                             | ISO timestamp                     |
| `summary`     | `string \| null`                     | Human-readable deployment summary |
| `logs_json`   | `string \| null`                     | Serialized deployment log entries |

### `mcp_servers`

| Column                | Application shape                                      | Notes                                  |
| --------------------- | ------------------------------------------------------ | -------------------------------------- |
| `id`                  | `string`                                               | Primary key                            |
| `workspace_id`        | `string`                                               | Foreign key to `workspaces.id`         |
| `name`                | `string`                                               | Display name                           |
| `transport_type`      | `"stdio" \| "http" \| "sse"`                           | MCP transport selection                |
| `endpoint`            | `string \| null`                                       | Used for HTTP/SSE transports           |
| `command`             | `string \| null`                                       | Used for stdio transport               |
| `auth_mode`           | `"none" \| "bearer" \| "header"`                       | Local auth strategy metadata           |
| `enabled`             | `boolean`                                              | Stored as integer, consumed as boolean |
| `status`              | `"disabled" \| "unconfigured" \| "offline" \| "ready"` | Derived validation status              |
| `tool_count`          | `number`                                               | Count of declared tools                |
| `declared_tools_json` | `string \| null`                                       | Serialized declared tool names         |
| `last_checked_at`     | `string \| null`                                       | Last validation timestamp              |
| `last_error`          | `string \| null`                                       | Last validation error                  |
| `created_at`          | `string`                                               | ISO timestamp                          |
| `updated_at`          | `string`                                               | ISO timestamp                          |

### `app_state`

| Column       | Application shape | Notes                    |
| ------------ | ----------------- | ------------------------ |
| `key`        | `string`          | Primary key              |
| `value`      | `string`          | Serialized value payload |
| `updated_at` | `string`          | ISO timestamp            |

### Important `app_state` keys

| Key                   | Meaning                              |
| --------------------- | ------------------------------------ |
| `active_workspace_id` | Persisted active workspace selection |
| `app_settings_json`   | Serialized app-level settings blob   |

## Virtual Filesystem, Terminal, and Preview

Three utility modules make the shell behave like an IDE instead of a plain CRUD app.

### `lib/virtual-fs.ts`

- Normalizes stored and displayed paths
- Resolves relative vs absolute virtual paths
- Infers file types from extensions
- Builds directory listings from flat file records
- Determines whether a file is previewable

### `lib/terminal.ts`

- Implements the local pseudo-shell used by the bottom rail
- Supports commands such as `help`, `pwd`, `ls`, `cd`, `cat`, `echo`, and `clear`
- Operates against workspace-scoped virtual files rather than the host machine filesystem

### `lib/preview.ts`

- Builds honest offline previews from saved file content
- Renders raw HTML and SVG directly when appropriate
- Shows scripts and stylesheets as source when executing them would be misleading
- Returns explicit empty or unavailable states when preview is not possible

## Assistant Model and Local-Only Behavior

There are two assistant-related modules, with different roles:

- `lib/ai-stub.ts`
  - Produces simple local stub text and streaming helpers
  - Explicitly states that no Anthropic or Gemini request was made

- `lib/services/assistant.ts`
  - Implements the shell's actual local chat/write orchestration
  - Uses session history, current file context, and config to generate local responses and file mutations

This split is important:

- The product behaves like an AI-enabled workspace shell
- The implementation remains local and testable without external model dependencies
- The UI should never imply that a real hosted model call occurred when it did not

## End-to-End Runtime Flows

### Chat flow

1. The center panel sends a user message to `/api/sessions/[id]/messages`
2. The route validates the request and loads the session
3. The effective message mode is resolved and persisted
4. The assistant service builds a local chat response
5. The response streams back to the client and is inserted into `messages`

### Write flow

1. The center panel sends a message in `write` mode, optionally with the selected file id
2. The route persists the message with `mode = write`
3. `lib/services/assistant.ts` interprets the request and updates files and/or artifacts
4. The assistant response streams back to the center panel
5. The client refreshes files, sessions, and artifacts so the inspector reflects the latest saved state

### Terminal flow

1. The bottom rail sends a command, cwd, session key, and workspace id to `/api/terminal`
2. The route resolves workspace scope and loads that workspace's files
3. `lib/terminal.ts` executes the local command against virtual files
4. The response returns new lines, cwd, and clear-state metadata

### Preview flow

1. The inspector requests `/api/preview/[fileId]`
2. The route loads the saved file record
3. `lib/preview.ts` converts saved content into an honest preview payload
4. The inspector renders that payload in the preview pane

## Project Structure

```text
app/
  api/
    chat/
    config/
    files/
    mcp/
    preview/
    sessions/
    terminal/
    workspaces/
components/
  ui/
  workspace/
hooks/
lib/
  services/
  ai-stub.ts
  db.ts
  db-schema.ts
  preview.ts
  terminal.ts
  types.ts
  utils.ts
  virtual-fs.ts
workspace.db
```

## Technology Stack

- Next.js 15 App Router
- React 19
- TypeScript
- SQLite via `sqlite` and `sqlite3`
- SWR for client-side data refresh
- Tailwind CSS and Radix UI primitives for interface construction
- Lucide icons for workspace chrome

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy environment defaults if you want a local env file:

   ```bash
   cp .env.example .env.local
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open the app in the browser and exercise the shell locally.

## Verification Commands

Use these before shipping changes:

```bash
npm run lint
npm run build
npm run dev
```

## Manual Smoke Test Checklist

- Create and switch workspaces
- Create chat and write sessions
- Send a chat prompt and confirm the response streams locally
- Send a write prompt and confirm files/artifacts refresh
- Create, rename, save, and delete files
- Use the terminal to inspect the virtual filesystem
- Open preview and mobile preview for saved files
- Create an artifact or pseudo-deploy record from a session flow
- Open settings and validate config + MCP persistence behavior

## Architectural Invariants

These are the rules most likely to be broken by rushed changes.

- **Workspace scoping is mandatory**
  - Do not add file, session, artifact, deployment, config, or MCP behavior that accidentally leaks across workspaces.

- **The provider is the client-side source of orchestration truth**
  - If a mutation changes visible workspace/session/file state, refresh through the provider or the same caches it controls.

- **Route handlers should stay thin**
  - Validation and response shaping belong in routes.
  - Business rules belong in `lib/services/`.

- **Session mode is persisted data, not just UI state**
  - If you change message creation behavior, preserve the session/message mode contract.

- **Preview must stay honest**
  - The preview should show saved content truthfully.
  - Do not secretly introduce a fake live-preview claim when the system is rendering saved content.

- **Terminal must stay virtual unless explicitly redesigned**
  - The current terminal is deterministic and workspace-file-backed.
  - Do not blur the line between virtual shell behavior and host shell execution.

- **Local-only assistant behavior is intentional**
  - Do not wire external AI providers unless the product goal changes explicitly.

- **Schema changes require full contract updates**
  - If you add or change persisted fields, update `lib/db-schema.ts`, `lib/types.ts`, relevant services, and any routes or panels that consume them.

## Recently Landed High-Value Behavior

These are recent improvements worth understanding before you touch the same areas.

- **Message mode race protection**
  - The center panel sends the current mode explicitly during message creation.
  - The session message route persists and honors that mode immediately.

- **Write-mode refresh correctness**
  - After write execution, sessions, files, artifacts, and relevant caches are refreshed so the UI reflects saved changes immediately.

- **Terminal scoping**
  - Terminal history and cwd are keyed by workspace and session.
  - Terminal file access is workspace-scoped on the backend.

- **Active workspace correctness**
  - The provider now trusts the persisted active workspace when reconciling workspace state.

- **MCP parsing hardening**
  - Malformed stored `declared_tools_json` is handled defensively in both UI and service code.

## Safe Change Checklist for Agents

Before you declare a feature done, confirm all of the following:

- **Authoritative layer**
  - You changed the real source of truth, not just a wrapper component.

- **Scope correctness**
  - Workspace and session scoping still hold after the change.

- **Refresh behavior**
  - The affected panel actually refreshes after writes or mutations.

- **Persistence contract**
  - New fields or changed semantics are reflected in schema, types, services, routes, and UI.

- **Truthful UI**
  - Empty states, preview states, deploy states, and assistant states describe what really happened.

- **Verification**
  - Run `npm run lint` and `npm run build`.
  - Prefer read-only smoke verification before mutating local data.

## If You Need to Change X, Edit Y, and Z

Use this as a blast-radius cheat sheet before making changes.

| If you need to change...                              | Edit these first                                                                                                                                              | Also verify                                                                |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Workspace selection or active workspace persistence   | `components/workspace/workspace-provider.tsx`, `lib/services/workspaces.ts`, `app/api/workspaces/active/route.ts`                                             | Sidebar selection flow, session/file refresh on workspace switch           |
| Workspace CRUD behavior                               | `components/workspace/sidebar-panel.tsx`, `lib/services/workspaces.ts`, `app/api/workspaces/route.ts`, `app/api/workspaces/[id]/route.ts`                     | Active workspace fallback, cascaded session/file state                     |
| Session creation, archive, restore, or mode semantics | `lib/services/workspaces.ts`, `app/api/sessions/route.ts`, `app/api/sessions/[id]/route.ts`, `components/workspace/sidebar-panel.tsx`                         | Center panel and provider assumptions                                      |
| Chat or write-mode execution                          | `components/workspace/center-panel-content.tsx`, `app/api/sessions/[id]/messages/route.ts`, `lib/services/assistant.ts`                                       | Message streaming, session mode persistence, artifact/file refresh         |
| Write-result metadata shape                           | `lib/types.ts`, `lib/services/assistant.ts`, `app/api/sessions/[id]/messages/route.ts`, center-panel renderers                                                | Existing message history rendering and structured metadata parsing         |
| File creation, rename, save, or delete behavior       | `components/workspace/sidebar-panel.tsx`, `components/workspace/inspector-panel.tsx`, `app/api/files/**`, `lib/services/files.ts`                             | Path normalization, preview lookup, terminal file visibility               |
| File path normalization rules                         | `lib/virtual-fs.ts`, `lib/services/files.ts`, `lib/db-schema.ts`                                                                                              | Existing stored path normalization, directory listing, terminal navigation |
| Preview behavior or supported previewable file types  | `lib/preview.ts`, `lib/virtual-fs.ts`, `app/api/preview/[id]/route.ts`, `components/workspace/inspector-panel.tsx`                                            | Mobile preview, empty states, saved-content honesty                        |
| Terminal command set or cwd behavior                  | `lib/terminal.ts`, `app/api/terminal/route.ts`, `components/workspace/bottom-rail.tsx`, `lib/types.ts`                                                        | Session/workspace scoping, clear behavior, cwd persistence                 |
| Config settings or default values                     | `lib/types.ts`, `lib/services/config.ts`, `app/api/config/route.ts`, `components/workspace/settings-modal.tsx`, `components/workspace/workspace-provider.tsx` | Effective config merging and UI defaults                                   |
| MCP validation or persisted MCP fields                | `lib/types.ts`, `lib/services/mcp.ts`, `app/api/mcp/**`, `components/workspace/settings-modal.tsx`                                                            | Stored JSON parsing, status transitions, workspace scoping                 |
| Artifact model or artifact UI                         | `lib/services/artifacts.ts`, `app/api/sessions/[id]/artifacts/route.ts`, `app/api/artifacts/[id]/route.ts`, `components/workspace/inspector-panel.tsx`        | Write-mode artifact creation and deletion flows                            |
| Deployment record behavior                            | `lib/services/deployments.ts`, `app/api/sessions/[id]/deployments/route.ts`, `components/workspace/inspector-panel.tsx`                                       | Logs serialization, status display, pseudo-deploy honesty                  |
| Database schema or persisted fields                   | `lib/db-schema.ts`, `lib/types.ts`, affected `lib/services/**`, affected `app/api/**` routes                                                                  | Existing DB migration behavior and backward compatibility                  |
| External AI provider integration                      | `lib/services/assistant.ts`, `lib/ai-stub.ts`, `lib/services/config.ts`, settings UI, environment handling                                                    | Product constraints, honest UI language, security of API keys              |

### High-risk coupling reminders

- **Center panel + message route + assistant service**
  - These three files form the core chat/write loop and should usually be changed together.

- **Sidebar + provider + workspace/session services**
  - If selection or creation flows feel wrong, the bug is often in reconciliation rather than the button UI itself.

- **Inspector + files service + preview/terminal helpers**
  - File changes often ripple into previewability, path handling, and terminal visibility.

- **Settings modal + config service + MCP service**
  - A UI-only change here is rarely enough; persisted normalization and validation usually also need updates.

## Development Notes

- Treat `lib/services/` as the business-logic layer
- Keep route handlers thin
- Keep UI actions honest: avoid fake success states and silent no-ops
- Preserve workspace scoping when adding any new feature that touches files, sessions, artifacts, deployments, config, or MCP
- If you add new persisted concepts, update both `lib/types.ts` and `lib/db-schema.ts`

## Current Product Constraints

- No external AI provider calls are required for normal operation
- No hosted model credentials should be hardcoded into the app
- Preview is intentionally offline-first and based on saved content
- Terminal behavior is virtual and deterministic, not a passthrough to the host shell
- Deployments are local pseudo-deploy records unless a real deployment integration is intentionally added later
