# DESKTOP_CONTEXT.template.md

\[\[ TEMPLATE META \]\] Name: Residual Risk Assessment  

Description: Use this template to turn a chat request into a PRD-style workflow that forces explicit risk assessment and residual risk assessment before work is considered complete. It should be used for features, fixes, refactors, integrations, deployments, and environment changes where hidden assumptions or incomplete verification can cause failures.  

Instructions: Paste the request and all relevant context into this template. The assistant should define the scope, identify constraints, and describe the intended outcome. It must then surface both risks and residual risks clearly: risks are what could go wrong during or because of the work, while residual risks are what remains unverified, fragile, assumed, incomplete, or still likely to fail after the proposed or completed work. Responses should be concrete, scoped, and action-oriented. Do not pad with summaries of completed work. Always end with the exact validations, tests, or next actions still required.

---

## Template Header

This is the app-specific context file for `apps/desktop` within `building-things-system`. It is the authoritative reference for any agent or operator working solely within `apps/desktop`. This file must be read in conjunction with `SYSTEM_SCOPE.template.md` and `AGENTS.template.md`. It does not repeat system-wide rules — instead, it supplements them with desktop app-specific context, invariants, navigation maps, and forbidden shortcuts.

---

## Role

`apps/desktop` is the desktop workspace shell within the shared system identity of `building-things-system`. Originating from [Building.Things](https://github.com/asherlewis-uk/Building.Things), its architecture is local-first and implemented as an IDE workspace shell built atop Next.js 15 App Router.  

Its core responsibility is to provide a multi-panel, high-density workspace environment for file, session, artifact, deployment, and configuration management, with a locally executing assistant/chat loop.  

`apps/desktop` is one of two equal peer applications, each with distinct architecture and interaction models. This app does **not** serve mobile users, provide a responsive web interface, or act as a backend for `apps/mobile`.

---

## Invariants

The following architectural invariants must always hold following any change to `apps/desktop`:

1. **Workspace Scoping**: All files, sessions, artifacts, deployments, MCP records, and configuration exist in and are accessible only within the context of an explicit workspace. No resource access is permitted without a valid workspace context.

2. **SQLite as Source of Truth**: The file `workspace.db` is the canonical and only authoritative datastore for the desktop app. Data must not be persisted or considered authoritative in any other location unless explicitly agreed via a visible architectural decision.

3. **Local Assistant Loop**: The assistant behavior for desktop is implemented within `lib/ai-stub.ts` and `lib/services/assistant.ts`. The loop must remain local-only. No default connection to an external or remote AI provider is permissible.

4. **Thin Routes**: All API route handlers under `app/api/` are responsible only for validation, workspace scoping, and direct delegation to respective services. Business logic is always implemented within `lib/services/`.

5. **Honest UI**: No UI state may suggest the presence of remote execution, live deployment, or “hosted”/real-time model responses where only local or simulated behavior exists underneath.

6. **Session Mode Persistence**: Both the current chat or write mode is persistently stored on the session record and for each individual message record.

---

## Important Directories and Files

Authoritative navigation map for `apps/desktop` (grouped by concern):

**UI Shell:**

* `components/workspace/shell.tsx`

* `components/workspace/workspace-provider.tsx`

* `components/workspace/sidebar-panel.tsx`

* `components/workspace/center-panel-content.tsx`

* `components/workspace/inspector-panel.tsx`

* `components/workspace/bottom-rail.tsx`

* `components/workspace/settings-modal.tsx`

**API Routes:**

* `app/api/workspaces/`

* `app/api/sessions/`

* `app/api/files/`

* `app/api/config/`

* `app/api/mcp/`

* `app/api/terminal/`

* `app/api/preview/`

* `app/api/chat/`

**Domain Services:**

* `lib/services/workspaces.ts`

* `lib/services/files.ts`

* `lib/services/config.ts`

* `lib/services/mcp.ts`

* `lib/services/artifacts.ts`

* `lib/services/deployments.ts`

* `lib/services/assistant.ts`

**Persistence:**

* `lib/db.ts`

* `lib/db-schema.ts`

* `workspace.db`

**Types and Utilities:**

* `lib/types.ts`

* `lib/utils.ts`

* `lib/virtual-fs.ts`

* `lib/preview.ts`

* `lib/terminal.ts`

* `lib/ai-stub.ts`

**Configuration:**

* `next.config.ts`

* `tsconfig.json`

* `.env.example`

---

## Dangerous Areas

The following areas are the most risk-prone and likely to trigger cascading failures when improperly touched:

1. **lib/db-schema.ts:** Schema migrations. Breakage here can corrupt `workspace.db` or drop critical data. Use only additive migrations and employ `ensureColumn` for safe changes.

2. **components/workspace/workspace-provider.tsx:** The core client-side orchestration layer. Any modification affects all panels dependent on provider state.

3. **lib/services/assistant.ts** + **app/api/sessions/\[id\]/messages/route.ts** + **components/workspace/center-panel-content.tsx:** These files comprise the chat/write session execution loop and must be updated in concert.

4. **lib/types.ts:** The central type contract spanning all services, API routes, and UI. Incomplete propagation can result in silent contract breaks.

5. **app/api/workspaces/active/route.ts:** Responsible for maintaining active workspace persistence. Bugs can cause load and data consistency failures.

---

## Allowed Changes

The following types of change are within the expected scope for `apps/desktop` and **do not** require cross-system review:

* Modifications to workspace, session, file, artifact, deployment, config, or MCP logic—so long as shared contract fields are not altered.

* UI updates/changes within current panels.

* Schema changes that only add new columns (not modifications/removal).

* Service logic modifications that do not affect the generation, formatting, or exposure of `session_id`, `workspace_id`, or `message_id`.

* New API routes exclusively serving desktop-scoped data.

The following changes **require explicit cross-system review and approval** before merging:

* Any update to how `session_id`, `workspace_id`, or `message_id` are generated, formatted, or shared.

* Any modification to authentication or identity including flows or requirements, with any potential impact on `apps/mobile`.

* Any new data field, parameter, or contract not already defined in `SHARED_CONTRACT.template.md`.

---

## Forbidden Shortcuts

**Absolutely forbidden shortcuts:**

1. **No mobile layout simulation**: Never add responsive CSS or breakpoints that reflow the workspace into a mobile-imitating layout.

2. **No mobile-native component importation**: React Native components, Expo SDKs, or touch-first interaction models must not be adopted inside desktop.

3. **No external AI integration**: Never wire up an external AI provider into the assistant loop unless a formal entry exists in `DECISION_LOG.template.md`.

4. **No misleading UI**: Do not show UI states implying successful or correct execution where the underlying operation is unimplemented, incomplete, or simulated.

5. **No incomplete schema changes**: All schema changes must be accompanied by full updates to `lib/types.ts` and all relevant consumers.

6. **No cross-workspace data access hacks**: Do not bypass workspace isolation to deliver features.

7. **No inspector-based equivalence**: The mobile preview pane within the inspector is *not* to be treated as functionally equivalent to the native `apps/mobile` implementation.

---

## Risk & Residual Risk Assessment

**Current Risks:**

* Schema migrations in `lib/db-schema.ts` may corrupt `workspace.db` or cause silent data loss if not purely additive and tested.

* Updating provider logic in `components/workspace/workspace-provider.tsx` risks breaking state consistency across all UI panels.

* Changes spanning `lib/services/assistant.ts`, corresponding API routes, and dependent components may cause message loop or session logic corruption if not coordinated.

* Updates to `lib/types.ts` not propagated system-wide may result in contract failures.

* Active workspace management (`app/api/workspaces/active/route.ts`) exposes risk of undetected state errors or loss.

**Residual Risks:**

* Hidden assumptions around local-only operation or SQLite persistence might be invalidated if desktop ever attempts to sync or delegate to a remote.

* Unverified fallback or error states where resource scoping is not enforced at the boundary.

* Possible untracked state drift in session or message record persistence.

* Fragile UI feedback if business logic or operation status are not validated.

* Presence of orphaned features or config if workspace scoping is relaxed.

* Incomplete circuit break if forbidden shortcuts are embedded for expedience.

* Need for audit of all file and service interactions to guarantee workspace scoping.

**Required Validations and Next Actions:**

* Verify that all schema changes employ only additive, backwards-compatible migrations.

* Confirm propagation and usage consistency for any type contract or session/workspace/message identifier updates.

* Exhaustively test workspace boundary enforcement in API and service layers.

* Review UI panels for any instance of simulated or misleading state exposure.

* Audit all assistant execution logic and API handlers for coordination and safety.

* Perform periodic checks for accidental introduction of forbidden shortcuts or architecture drift.

---

## Scope & Intended Outcome

**Scope:**

* Applies exclusively to `apps/desktop` within the shared system context of `building-things-system`.

* Governs file, service, UI, schema, and API changes, enforcement of invariants, and safe delivery of features and fixes within the desktop application boundary.

* Excludes cross-app or cross-contract changes unless explicitly coordinated with SYSTEM_SCOPE and SHARED_CONTRACT.

**Intended Outcome:**

* Maintain strict architectural discipline, workspace data isolation, and honest local execution guarantees for the desktop shell.

* Ensure that all changes are robust, consistently enforced, and never drift into mobile-centric behaviors or shared contract breakage.

* Deliver safe, maintainable updates and features, validated against known risks and forbidden shortcuts.

**Explicit Constraints:**

* No change may introduce responsive or mobile-mimicking behaviors.

* All business logic must stay within service boundaries.

* SQLite remains the sole source of truth unless a deliberate architectural change is agreed and logged.

* Coordination and review are mandatory for shared fields, identifiers, and contract evolution.