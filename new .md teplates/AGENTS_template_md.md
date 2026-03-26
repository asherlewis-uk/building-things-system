
# AGENTS.template.md

This is the AI agent instruction file for the `building-things-system` monorepo. It governs how any AI agent, coding assistant, or automated tool should reason and propose or take action when working in this repository. It applies to all automated and model-assisted surfaces, including (but not limited to) GitHub Copilot, Claude, GPT, Cursor, or any other tool leveraging LLM-based completion or reasoning.  

**All AI-assisted contributions or recommendations in this repo must comply with the principles and rules in this document.**

---

## Orientation — Read This First

**Before any automated or model-driven action:**

* **Identify which app is affected:** Is the proposed change for `apps/desktop`, `apps/mobile`, or both?

* **Confirm scope:** Is the work app-specific, or does it impact cross-system boundaries (affecting identity, sessions, device, presence, handoff, or artifact semantics)?

* **Assess shared contract impact:** Will the shared data contract (as defined in `SHARED_CONTRACT.template.md`) be changed, referenced, or depended upon?

* **If there is uncertainty** about any of the above, the agent must halt and explicitly surface the question for human review instead of proceeding with a guess.

**Context:**  

The `building-things-system` monorepo contains two applications with fully distinct architectures and responsibilities:

* `apps/desktop`: a Next.js-based desktop workspace shell.

* `apps/mobile`: a native Expo app (with dual responsibility: detachable remote chat surface and personal AI companion).

Neither application is a fallback, primary instance, or derived copy of the other. All system-level and cross-app changes must honor this separation of architecture, responsibility, and user interaction model.

---

## How to Reason Across Both Apps

When working in this monorepo, AI agents must reason as follows:

* **Desktop:**

  * Native Next.js 15 workspace (App Router), local-first, stateful, panel-based.

  * Panels, routing, file/session management, shell logic, and UI interactions are strictly desktop-native.


* **Mobile:**

  * Native Expo app (React Native 0.81.5, Expo SDK \~54).

  * Navigation, detached real-time chat, and state management are mobile-native.

  * Mobile has dual responsibility:

    1. Detachable remote chat interface for the shared product/system.

    2. Fully capable, standalone personal AI companion.

**Key Rules:**

* Desktop and mobile architectures are independent.

  * Never apply desktop layout, interaction, or panel metaphors to mobile.

  * Never import or repurpose mobile navigation or interactivity into desktop logic.

* If features must be consistent across both apps, this should be enforced at the shared contract layer—not by copying logic or assumptions from one platform to another.

* If a feature affects both apps, the change must be mediated by an explicit protocol or data contract in the shared layer and not implied through partial equivalents.

---

## When Work Is Cross-System vs App-Specific

**App-specific work**

* Modifies logic, UI, or data accesses only within `apps/desktop` or `apps/mobile`.

* Does not change how both apps view or manage:

  * `workspace_id`

  * `session_id`

  * `message_id`

  * `device_id`

  * `detach_state`

  * `active_surface`

  * `presence_state`

  * `handoff payload`

  * `artifact reference payload`

**Cross-system work**

* Touches any of the above contract fields or semantics.

* Impacts how both apps handle core identity, session, message, device, presence, handoff, or artifact state.

* Must:

  * Be flagged explicitly as cross-system.

  * Be discussed and reviewed in the context of both apps.

  * Never be implemented in only one app without a corresponding contract change and review.

---

## How to Separate Shared, Desktop, and Mobile Changes

All work in this monorepo must be explicitly routed to one of three change scopes:

1. **Shared changes:**

  * Should occur in a placeholder future location such as `packages/shared-contract/` (not yet created, not yet canonical).

  * Define protocol boundaries: data shapes, types, event and payload semantics.

  * Never implement business logic, UI, or storage here.


2. **Desktop changes:**

  * Stay inside `apps/desktop` (Next.js, local SQLite, shell panels, session/file/artifact handling).

  * Scope: workspace, session, files, terminal, Main Control Panel (MCP), config.

  * Do not bleed into mobile navigation, UI, or companion logic.


3. **Mobile changes:**

  * Stay inside `apps/mobile` (Expo, React Native, native navigation).

  * Scope: navigation, detached chat, companion flows, haptics, reconnect logic, native state.

  * Do not import or infer desktop layouts or patterns.

If a change touches more than one of these buckets, it must be explicitly flagged as cross-system and justified with reference to the shared contract and protocol.

---

## What Must Never Be Assumed

The following strict rules apply to all AI agent operations in this monorepo:

* Do not assume mobile is a responsive version of desktop.

* Do not assume desktop panel layout or shell logic applies to mobile.

* Do not upgrade or replace the desktop assistant stub with a live provider unless explicitly instructed.

* Do not assume shared contract semantics are complete; placeholders are not decisions.

* Do not assume a feature can be built in one app and called from the other without a contract change and explicit review.

* Do not assume deployment targets, system environment variables, or provider credentials exist or are named a certain way without explicit confirmation.

* Do not assume a completed task or feature is verified until all gates in `VERIFICATION_COMPLETION_GATE.template.md` are satisfied.

---

## Agent Behavior in Ambiguous Situations

If at any point it is unclear:

* What the correct system boundary is,

* Whether the change is app-specific or cross-system,

* Which contract field or semantic is affected,

* Or whether a gate should apply,

The agent must:

1. Explicitly state the ambiguity in writing.

2. Identify which boundary, contract, or app context is unclear.

3. Propose two or more scoped, concrete options without defaulting to any one.

4. Not proceed with cross-system changes without explicit confirmation from a human owner or reviewer.

5. Surface any relevant gate violations or rules that are at risk, rather than working around them.

---

## File and Scope Navigation

**Monorepo navigation quick map:**