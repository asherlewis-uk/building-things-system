# BOUNDARY_GUARD.mobile.template.md

## Template Header

This is the mobile boundary guard for `apps/mobile` within the `building-things-system` monorepo. It applies whenever changes are made to `apps/mobile`. This guard is additive to `BOUNDARY_GUARD.root.template.md` — the root guard must also be satisfied. This file protects the native mobile app from architecture drift, desktop contamination, and the misclassification of `apps/mobile` as a secondary, derived, or responsive surface.

## Mobile Architecture Contract

The following architectural properties of `apps/mobile` are non-negotiable and must remain true after any change:

* `apps/mobile` is a **native app**, built on Expo (approx version 54) and React Native 0.81.5, targeting iOS and Android. It is **not** a web app, PWA, or responsive site.

* `apps/mobile` has **dual, equal responsibilities:** (1) as a detachable remote chat surface for desktop sessions, and (2) as a standalone personal AI companion. Neither responsibility is primary; both are essential and must be preserved.

* **Navigation is native:** all routing in `apps/mobile` is governed by Expo Router. No desktop panel or web routing metaphors apply.

* **Independently valuable**: The app must deliver full standalone companion functionality regardless of the status of any desktop session.

* The mobile surface is **additive** within the shared product/system identity: when acting in a detachable chat role, it expands the system’s interaction model; it does not replace or merely mirror the desktop.

* Any change that weakens these properties must have an explicit decision, rationale, and impact logged in `DECISION_LOG.template.md`.

## Native Authority Protection

## No Desktop Panel Metaphors

## Dual Responsibility Integrity

## Forbidden Architecture Drift Checks

---

\[\[ TEMPLATE META \]\]

**Name:** Residual Risk Assessment  

**Description:** Use this template to turn a chat request into a PRD-style workflow that forces explicit risk assessment and residual risk assessment before work is considered complete. It should be used for features, fixes, refactors, integrations, deployments, and environment changes where hidden assumptions or incomplete verification can cause failures.  

**Instructions:** Paste the request and all relevant context into this template. The assistant should define the scope, identify constraints, and describe the intended outcome. It must then surface both risks and residual risks clearly: risks are what could go wrong during or because of the work, while residual risks are what remains unverified, fragile, assumed, incomplete, or still likely to fail after the proposed or completed work. Responses should be concrete, scoped, and action-oriented. Do not pad with summaries of completed work. Always end with the exact validations, tests, or next actions still required.

---

## Risk & Residual Risk Assessment

**Risks:**

* Introduction of any web or desktop-based interaction pattern diluting native authority and user experience.

* Navigation, gesture, or animation implementations drifting toward web or desktop standards rather than mobile-native.

* Inadvertent reliance on desktop session state or logic that breaks standalone companion mode.

* Implementation of multi-mode features without isolating their effects on both detachable chat and companion modes.

* Inclusion of persistent storage or configuration patterns (SQLite, MCP, desktop-targeted code) incompatible with React Native.

* Programmer or reviewer incorrectly perceiving `apps/mobile` as a secondary or fallback UI leading to architecture drift.

**Residual Risks:**

* Unverified or legacy imports that may not conform to React Native’s native requirements.

* Untested code paths where mobile behavior indirectly depends on desktop session presence or callbacks.

* Shared contract changes lacking clear, provisional structure or not codified in a future shared location.

* Ambiguity in handling new feature toggles that may silently couple detachable chat logic with companion mode.

* Unreviewed or insufficiently documented exceptions approved via `DECISION_LOG.template.md`.

**Required Validations, Tests, or Next Actions:**

* Explicit architecture review against the checklists above on all relevant PRs and changesets.

* Verification of navigation tree, component imports, and persistence method.

* Manual and automated testing of both detachable chat and standalone companion mode: each must work independently.

* Audit of configuration, storage, and third-party dependencies for web/desktop pollution.

* Confirm all exceptions or deviations are entered and justified in `DECISION_LOG.template.md`.

* Final approval requires cross-reference with `BOUNDARY_GUARD.root.template.md` for shared boundary integrity.

---

## Scope & Intended Outcome

**Scope:**

* All changes, features, fixes, integrations, and architectural evolutions to `apps/mobile` within `building-things-system`.

**Intended Outcome:**

* Preservation of the native-first, dual-responsibility, independently valuable mobile experience.

* Prevention of architectural drift, desktop contamination, and misclassification of the mobile surface within the shared product/system identity.

* Maintenance of clear, contextual separation between the interaction models, architectures, and responsibilities of mobile and desktop surfaces, while honoring the shared contract.

* Documented, reviewable record of all changes that touch the architecture or native authority constraints of `apps/mobile`.

**Explicitly In Scope:**

* All source, configuration, and UX changes within `apps/mobile`.

* Any changes to shared contracts, payloads, or navigation that touch `apps/mobile`.

* Documentation, risk assessment, and checklist completion.

**Explicitly Out of Scope:**

* Migration or re-architecture of desktop app (`apps/desktop`) without parallel review.

* Introducing responsive web, PWA, or hybrid fallback structures into mobile.

* Unreviewed reuse of packages or components from desktop contexts without explicit exception logged.

* Finalization of future shared packages or contracts until explicitly decided.

**Constraints:**

* Must remain compatible with Expo (\~v54) and React Native 0.81.5.

* All source-of-truth for architectural properties and boundaries is this guard and the associated root guard.

* No live operational, deployment, or environment changes specified here.