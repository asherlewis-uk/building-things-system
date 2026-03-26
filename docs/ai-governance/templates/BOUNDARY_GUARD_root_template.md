# BOUNDARY_GUARD.root.template.md

This is the root boundary guard for `building-things-system`. It applies to all work in the monorepo, regardless of which surface or architecture is being changed. This file establishes non-negotiable system-wide boundary rules that neither app may violate. App-specific boundary guards (`BOUNDARY_GUARD.desktop.template.md` and `BOUNDARY_GUARD.mobile.template.md`) are strictly additive to this file — they do not replace it.  

**This file must be consulted before any commit that:**

* touches more than one app,

* updates governance or root-level files,

* modifies or references shared contract fields.

---

## What Belongs in Shared Scope

The shared contract layer defines only what is required for unified behavior and state between the separate app architectures. Shared scope is restricted to:

* `workspace_id`

* `session_id`

* `message_id`

* `device_id`

* `detach_state`

* `active_surface`

* `presence_state`

* *Handoff* payload structure

* *Artifact reference* payload structure

**Any logic, type definition, or configuration governing how both apps interpret these fields belongs in the shared contract.**  

This is a placeholder for a future shared contract location (e.g., `packages/shared-contract`): this does **not** presently exist and is not yet canonical.  

**It is a boundary violation for either app to define these fields, their types, or their interpretation in an app-local manner.**

---

## What Belongs Only in apps/desktop

Desktop-only scope includes any code, logic, or asset **exclusive** to the workspace shell and its interaction model. The following must not appear in `apps/mobile` or in shared contract files:

* Workspace management (create, rename, delete, select, active workspace persistence)

* Session CRUD and session mode (chat/write) logic

* File CRUD and virtual filesystem handling

* SQLite schema and migrations (`lib/db.ts`, `lib/db-schema.ts`)

* API route handlers under `app/api/`

* Panel UI components under `components/workspace/`

* Terminal virtual shell (`lib/terminal.ts`)

* Preview generation logic (`lib/preview.ts`)

* MCP server configuration and validation (`lib/services/mcp.ts`)

* Local assistant stub logic (`lib/ai-stub.ts`, `lib/services/assistant.ts`)

* Artifact and deployment record management

**The inclusion of any of these elements in** `apps/mobile` **is a root boundary violation.**

---

## What Belongs Only in apps/mobile

Mobile-only scope encompasses logic, patterns, and primitives **exclusive** to the native mobile architecture. The following must not appear in `apps/desktop` or in shared contract files:

* Native navigation stack and Expo Router configuration

* React Native component primitives (e.g., `View`, `Text`, `Pressable`, etc.)

* Reanimated and Gesture Handler based animations or gesture logic

* Expo SDK integrations (haptics, image picker, location, etc.)

* TanStack Query data fetching and cache management for mobile

* Detachable chat session participation logic (mobile-side only)

* Standalone personal AI companion flows and state management

* Device-local state and usage of `AsyncStorage`

* Mobile push notification and reconnect logic

**Inclusion of any of these elements in** `apps/desktop` **is a root boundary violation.**

---

## Changes That Require Both Sides Reviewed

The following categories of change require **mandatory review** by stakeholders of both `apps/desktop` and `apps/mobile` before commit or merge.  

These reviews are not optional, and must precede any pull request approval.

Changes requiring dual review:

* Any addition or modification of a shared contract field:  

  `workspace_id`, `session_id`, `message_id`, `device_id`, `detach_state`, `active_surface`, `presence_state`, handoff payload, artifact reference payload.

* Any change to the identification or lookup of sessions across architectures.

* Any change to authentication or identity bootstrap mechanisms impacting both apps.

* Any modification of the `aimine://` deep link scheme or handoff URI format.

* Any update to artifact reference handling affecting connections between mobile and desktop.

* Any change to presence state semantics or propagation.

**Changes in these areas require parallel review and documented agreement in both** `BOUNDARY_GUARD.desktop.template.md` **and** `BOUNDARY_GUARD.mobile.template.md`**.**

---

## Root Boundary Violation Checklist

Run this checklist before submitting or merging any cross-surface, shared, or root-level change.  

All boxes must be checked before completing a change.

---

\[\[ TEMPLATE META \]\]  

**Name:** Residual Risk Assessment  

**Description:** Use this template to enforce explicit risk and residual risk assessment in any work that crosses boundaries or impacts root or shared code in the monorepo. It ensures hidden or incomplete work is surfaced and tracked before completion.  

**Instructions:** Always paste the full context and change request into this template. Define concrete risks and residual risks before marking any cross-app, shared contract, or governance work as done.

---

## Risk & Residual Risk Assessment

**Risks (what could go wrong during or because of the work):**

* Inadvertent leakage of desktop-specific logic into mobile or vice versa

* Redefinition or drift of shared contract fields within a single app

* Uncoordinated changes to presence or session logic breaking cross-architecture flows

* Incomplete review of handoff or artifact reference mechanisms

* Commits bypassing root-level boundary checks

* Governance or template changes creating side effects in only one app

**Residual Risks (what could remain unverified, fragile, or incomplete after this work):**

* Undocumented interpretation of shared fields persisting in app-local modules

* Overlooked environment/config dependencies (e.g., SQLite or AsyncStorage) leading to silent runtime failures

* Missed identity or session bootstrapping discrepancies across architectures

* Future root-level refactors not re-running checklist validation

* Lack of dual review for deep link or presence semantics impacting one app only

**Exact tests, validations, or actions still required:**

---

## Scope & Intended Outcome

**Scope:**  

Any change, feature, or refactor that impacts more than one app, any root-level or governance code, or any shared contract definition.

**In Scope:**

* Root files and templates

* Shared contract type, schema, and contract governance (placeholder future location)

* Any change affecting both `apps/desktop` and `apps/mobile` architectures or flows

**Out of Scope:**

* Purely app-local features or refactors with no impact on shared contract, root structure, or unified interaction model

**Hard Constraints:**

* Preserve separate app architectures under a shared product/system identity

* No assumption that either app is primary/secondary or derived from the other

* Do not promote any responsive, PWA, or fallback web strategy for mobile

* No config, state, or logic for shared contract fields may exist outside their canonical shared definition or agreed placeholder location (currently not yet created/finalized)

* Cannot proceed with release or deployment if any root boundary violation has been found

---