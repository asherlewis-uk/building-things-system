# UI_CONSTRAINT_GATE.mobile.template.md

\[\[ TEMPLATE META \]\] Name: Residual Risk Assessment  

Description: Use this template to turn a chat request into a PRD-style workflow that forces explicit risk assessment and residual risk assessment before work is considered complete. It should be used for features, fixes, refactors, integrations, deployments, and environment changes where hidden assumptions or incomplete verification can cause failures.  

Instructions: Paste the request and all relevant context into this template. The assistant should define the scope, identify constraints, and describe the intended outcome. It must then surface both risks and residual risks clearly: risks are what could go wrong during or because of the work, while residual risks are what remains unverified, fragile, assumed, incomplete, or still likely to fail after the proposed or completed work. Responses should be concrete, scoped, and action-oriented. Do not pad with summaries of completed work. Always end with the exact validations, tests, or next actions still required.

---

## Template Header

This is the mobile UI constraint gate for `apps/mobile` within `building-things-system`. It must be used whenever UI changes are proposed or implemented in `apps/mobile` (including detachable chat and personal AI companion flows). This gate is *additive* to `BOUNDARY_GUARD.mobile.template.md`. Its purpose is to:

* Enforce that the mobile UI is native-first and touch-native.

* Prevent the introduction of desktop-derived layout assumptions and interaction patterns.

* Preserve the strict functional separation between the detachable chat surface and the standalone personal AI companion.

* Uphold the shared product/system identity while recognizing separate architectures and responsibilities for each surface.

---

## Native-First Interaction Rules

All interaction, navigation, and feedback within `apps/mobile` must be designed as native-first for handheld, touch-driven devices.

**Native-first standards:**

* Every interactive element must be accessible and targetable via touch input.

* Tap target sizes must meet platform accessibility guidelines.

* Gestures implemented (swipe, drag, long-press) must leverage platform conventions (e.g., via libraries like React Native Reanimated and Gesture Handler).

* The keyboard must be surfaced only in contextually appropriate scenarios.

* Haptic feedback must reinforce key user actions—using Expo Haptics where fitting.

* Mouse-driven or hover-state interactions from desktop paradigms are not permitted as primary triggers.

* No new feature may depend on hover; all must be touch-first.

**Checklist:**

---

## Detachable Chat Surface UI Rules

These checks apply *if* the detachable chat surface UI is being changed within `apps/mobile`, the surface that allows mobile to participate as a chat endpoint in an active desktop session.

*N/A if detachable chat UI not changed.*

---

## Personal Companion UI Rules

Apply these if changes are being made to the personal AI companion mode within `apps/mobile`.

*N/A if companion UI not changed.*

---

## No Desktop-Derived Layout Assumptions

To preserve separation of interaction models and prevent architecture drift from desktop to mobile, enforce:

---

## Risk & Residual Risk Assessment

### Current Risks

* Regression: Introduction of desktop interaction metaphors (mouse, hover, multi-column layouts) could break mobile UX accessibility or usability.

* Inconsistent UI behavior between detachable chat and companion, blurring responsibility boundaries.

* Overlooked platform accessibility standards for touch targets or gesture feedback.

* Failure to use native gesture/haptics libraries leading to fragile user experience.

* Improper or inconsistent handling of shared contract fields (e.g., `session_id`, `workspace_id`) across mobile and desktop surfaces.

### Residual Risks

* Assumptions that features tested in emulator/simulator automatically meet physical device accessibility and native-feel requirements.

* Unexplored edge cases where UI state transitions (attach/detach/chat/companion) may not be communicated or handled correctly.

* Unverified consistency in contract data handling, especially for new or evolving shared contract fields.

* Potential gaps in test coverage for gesture interactions, dark splash screen, and enforced portrait lock.

* Missing manual validation of haptic feedback and gesture behaviors on target devices.

* Import of desktop components or interaction metaphors via dependency refactoring or shared code location drift.

**Validations, tests, or next actions required:**

* Explicit device testing (on touch, portrait, screen sizes) of all new or changed UI elements.

* Manual audit against checklist at review time for all relevant UI changes.

* Contract review for any shared field references (against `SHARED_CONTRACT.template.md`).

* Confirm that gestures and haptics work on at least one physical target device per platform.

* Review of imports/dependencies for accidental desktop component usage.

---

## Scope & Intended Outcome

**In Scope:**

* Any proposed or implemented UI changes to `apps/mobile`, including:

  * Screens, components, navigation, gesture handling, or feedback logic

  * Detachable chat surface behaviors or visuals

  * Personal AI companion UI or navigation

  * Any logic referencing shared contract fields within mobile

**Success Looks Like:**

* All mobile UI changes are strictly native-first and fully touch-native.

* No desktop interaction models, layout metaphors, or component imports are present in `apps/mobile`.

* Detachable chat and personal AI companion modes are functionally and architecturally separated and consistently enforced at the UI level.

* All shared contract references are handled per shared contract guidance, with explicit review.

* Compliance with all checklist items above, including device-level accessibility and feedback.

**Out of Scope:**

* Desktop (`apps/desktop`) UI, logic, or components—except as placeholder contract consumers/producers.

* Live commands, deployment configuration, or production rollout steps.

* Canonicalization of any new shared package (`packages/shared-contract`, etc.)—location remains provisional, not yet created, and not yet canonical.

**Hard Constraints:**

* Must not relax or override rules enforced by `BOUNDARY_GUARD.mobile.template.md`.

* No provider-specific code or configurations.

* No change to mobile splash background or orientation without explicit product/system consent.

* No deviation from touch-native, mobile-architecture-first principles.