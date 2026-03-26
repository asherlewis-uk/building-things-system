
# SYSTEM_SCOPE.template.md

This document is a root-level governance template for the [building-things-system](https://github.com/asherlewis-uk/building-things-system) monorepo.

This template governs the system as a whole. It does not describe, configure, or authorize changes for any single app in isolation.

---

## Monorepo Purpose

The `building-things-system` monorepo is a dual-surface system comprising two applications with a shared product/system identity:

* A **desktop workspace shell** designed for local, project- and artifact-focused work.

* A **native mobile app** fulfilling both a detachable remote chat surface for the desktop system and an independent AI companion.

Both applications are governed as primary facets of the system, constrained by a deliberate, protocol-based contract surface—not by implementation inheritance or secondary status. Each possesses a separate architecture, responsibilities, and interaction model. Neither is a fallback or functional subset of the other. All shared identity, presence, session continuity, and handoff occur only at the protocol boundary—never via the coercion, reshaping, or downgrading of one architecture into the other.

---

## apps/desktop — Role and Boundaries

* **Repo location:** `apps/desktop`

* **Origin:** [Building.Things](https://github.com/asherlewis-uk/Building.Things)

* **Technology:** Next.js 15 App Router, local-first architecture

**Responsibilities:**

* Workspace management and artifact lifecycle

* Session, file, artifact, deployment, and configuration objects

* Multi-Context Protocol negotiation, integrated terminal, and preview flows

* Persistence through SQLite-backed data stores (`workspace.db`)

* A deliberately local, stubbed assistant loop (no hosted LLM integration)

**Boundaries:**

* No support, fallback, or emulation of mobile layouts, navigation, or platform experiences

* Does not unilaterally implement or control the cross-device contract

* AI capability is strictly local; no calls to hosted AI services except via governed, explicitly reviewed contract changes

* No references to or inheritance from mobile navigation or device behavior

---

## apps/mobile — Role and Boundaries

* **Repo location:** `apps/mobile`

* **Origin:** [AI-UI-100](https://github.com/asherlewis-uk/AI-UI-100)

* **Stack:** Expo/React Native (slug: `ai.mine`, scheme: `aimine`), iOS and Android native applications

**Equal Responsibilities:**

1. **Detachable Remote Chat Surface:** Participates in the active context of the desktop workspace shell session, supporting context handoff, detach, and reconnect as defined by the protocol.

2. **Standalone Personal AI Companion:** Operates independently of any desktop session, with native-first navigation, haptics, and a mobile UX not derived from desktop concepts.

**Boundaries:**

* Not a responsive or stripped-down fallback for desktop shell

* No inheritance of desktop panel metaphors or navigation paradigms

* Responsible exclusively for native navigation, device integration, and mobile-centered experience

---

## Shared Contract — Role

The shared contract defines all protocol-level semantics and synchronization between desktop and mobile applications.

* **Placeholder future location:** `packages/shared-contract` (not yet created, not yet canonical)

* **Governs:**

  * Identity and authentication (`workspace_id`, `session_id`, `device_id`)

  * Session continuity and presence (`presence_state`, `active_surface`, `detach_state`)

  * Message lifecycles (`message_id`, message sync and replay)

  * Device registration and trusted presence

  * Surface handoff and deep-link payloads (`handoff payload`)

  * Artifact reference structure and semantics (`artifact reference payload`)

**Contractual Requirements:**

* No application may unilaterally implement or modify the contract surface logic.

* Protocol semantics (including object shapes and event structures) must be reviewed and validated as serving both applications with equal authority and compatibility.

* The shared contract (when implemented) is the exclusive zone for cross-surface protocol semantics.

---

## Explicit Non-Goals

The `building-things-system` monorepo must not introduce the following without explicit, reviewed, and governed product decisions:

* No PWA or mobile web fallback. Mobile is not a responsive or web-wrapped version of desktop. No responsive or auto-derived UI for mobile from desktop.

* No leaks of desktop panel logic or paradigms into mobile. Desktop structure and interaction models must not contaminate mobile UX architecture.

* No silent upgrades to hosted AI services. The desktop assistant loop is strictly local and stubbed. No escalation or replacement without explicit architecture and product review.

* No reduced, “lite,” or stripped-down mobile shells. Both applications deliver full and independent value within their system responsibilities.

* No unilateral contract implementation. Shared contract semantics must not be implemented exclusively or provisionally in only one application.

* No “fake sync”, fake realtime, or silent no-op implementations. All claims about session, sync, state, or messaging must be enforceable and overt; incomplete features must fail overtly.

* No persistent state or deployment upgrades beyond pseudo-records, unless managed through deliberate governance and multi-surface verification.

---

## Governance Notes for AI Agents

* Always review this document before altering code, configuration, or product logic anywhere in the repository.

* If unclear whether proposed work is cross-system or app-specific, default to app-local scope, flag the uncertainty, and submit for review.

* Never cross-contaminate logic, UI, or data structures between desktop and mobile. Treat each as a primary facet of a shared product/system identity, with separate architectures and responsibilities.

* Changes to the shared contract (including those tentatively intended for `packages/shared-contract`, placeholder future location) must undergo protocol review considering both application architectures before acceptance.

* No code, logic, or semantic should be assumed to belong in one app unless this document explicitly grants that right.

* Unclear, incomplete, or fragile contract surfaces must be called out for review and must never be patched by silent failovers or temporary stopgaps.