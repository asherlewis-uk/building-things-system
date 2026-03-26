# UI_CONSTRAINT_GATE.desktop.template.md

\[\[ TEMPLATE META \]\]  

Name: Residual Risk Assessment  

Description: Use this template to turn a chat request into a PRD-style workflow that forces explicit risk assessment and residual risk assessment before work is considered complete. It should be used for features, fixes, refactors, integrations, deployments, and environment changes where hidden assumptions or incomplete verification can cause failures.  

Instructions: Paste the request and all relevant context into this template. The assistant should define the scope, identify constraints, and describe the intended outcome. It must then surface both risks and residual risks clearly: risks are what could go wrong during or because of the work, while residual risks are what remains unverified, fragile, assumed, incomplete, or still likely to fail after the proposed or completed work. Responses should be concrete, scoped, and action-oriented. Do not pad with summaries of completed work. Always end with the exact validations, tests, or next actions still required.

---

## Template Header

This is the desktop UI constraint gate for `apps/desktop` within the `building-things-system` monorepo.  

It applies **whenever UI changes are being made to the desktop shell**.  

This gate is *additive* to `BOUNDARY_GUARD.desktop.template.md` and is required for all desktop shell UI work.

**Purpose:**  

To enforce that the desktop UI remains truthful, panel-structured, and interaction-dense with a desktop-first idiom. The desktop UI must never attempt to substitute genuine mobile support with fake-mobile UIs or responsive-web patterns.

---

## Panel Structure Rules

The desktop shell UI of `apps/desktop` is composed of four explicit interaction surfaces:

* **Sidebar panel (left):** workspace/session/file navigation

* **Center panel:** main conversation area and primary execution workspace

* **Inspector panel (right):** code editor, preview, artifacts, deployment operations

* **Bottom rail:** terminal surface

These four panels define the interaction model for the desktop app.  

No changes should add, remove, or fundamentally alter these surfaces without explicit governance.

*Rules:*

* No new primary navigation surface may be added outside the four-panel structure without an explicit architecture decision.

* No panel may be removed or hidden by default except by explicit architecture decision.

* No panel may be collapsed into a mobile-style drawer, sheet, or similar pattern as its primary state.

*Panel Structure Checklist:*

---

## Desktop Interaction Density Rules

Desktop interaction density means the following:

* Hover states are permitted and expected for interactive controls.

* Keyboard shortcuts are designed and documented.

* Multi-column layouts are the norm, not exception.

* Dense information presentation is allowed and expected due to large display surfaces.

*Do not:*

* Assume touch-first or thumb-reach interactions.

* Add excessive vertical padding or large tap targets that mimic mobile UI.

* Stack content into a single vertical column unless explicitly justified.

*Desktop Density Checklist:*

---

## Shell Truthfulness Rules

The desktop shell UI must always communicate UI truthfully. No part of the interface should overstate, misrepresent, or obscure the actual status of user actions or system state.

*Truthfulness Checklist:*

---

## No Fake Mobile Responsiveness Rule

The desktop shell must not introduce fake-responsive or mobile-first practices as a substitute for real mobile support.

*No-Fake-Mobile Checklist:*

---

## Risk & Residual Risk Assessment

**Current Risks:**

* Introduction of UI changes that bypass the four-panel desktop structure and create new, unapproved navigation or workspace surfaces.

* Addition of single-column layouts, excessive vertical padding, or oversized click targets leading to degraded desktop experience.

* Misapplication of mobile idioms (drawers, bottom sheets, floating action bars) within desktop shell.

* Truthfulness violations such as misrepresenting local vs. network actions, or surfacing misleading loading or confirmation patterns.

* Testing gaps that fail to surface CSS media query drift or accidental viewport meta tag inclusion.

* Lack of governance on unreviewed UI “refactors” intended to simplify code but compromise interaction or structure fidelity.

* Feature parity pressure leading to fake-responsive quick fixes in lieu of the required native mobile app work.

**Residual Risks:**

* Edge cases where refactored or third-party components introduce hidden responsive behaviors or mobile-first defaults.

* Fragile dependency on CSS/JS libraries that may update to introduce unwanted responsive or mobile effects over time.

* Incomplete review coverage, especially in sub-panel or nested UI subsystems.

* Unverified assumptions about deployment or display environments (e.g., browser-vs.-desktop-app inconsistencies).

* Inconsistent labeling or truth-in-UI for edge-case file previews, pseudo-deploys, or assistant responses.

* Emerging workarounds or shortcuts slipping in before this gate is universally enforced.

**Exact Tests / Validations / Next Actions Required:**

1. Verification that all UI remains within one of the four panel surfaces, unless explicitly reviewed and approved.

2. Audit CSS and component tree for prohibited responsive breakpoints or mobile-specific constructs.

3. Validate that all interactive elements provide hover and keyboard affordances on actual desktop hardware.

4. Spot-check preview/deploy/assistant UI for naming and labeling discipline as specified in Truthfulness Checklist.

5. Confirm that no new navigation surfaces or behavioral patterns are present outside the approved panel model.

6. Ensure checklist completion and sign-off before merge or release.

---

## Scope & Intended Outcome

**Scope:**

* Applies to all UI changes, refactors, or feature additions in `apps/desktop` that affect presentation, interaction, or shell structure.

* Covers code, stylesheets, and documentation affecting desktop user experience.

* Governs the interface model and interaction density for the desktop shell only; does not apply to mobile or shared contract packages.

**Intended Outcome:**

* Desktop UI strictly adheres to the panel structure and high-density desktop paradigm.

* No responsive, single-column, or mobile-mimicking functionality is present.

* UI remains consistently truthful in communicating local vs. network and draft vs. real actions.

* No desktop change forces or assumes changes in mobile or shared contracts without explicit governance.

**Explicitly In Scope:**

* Desktop shell UI, all four panels, and their contents.

* Desktop-specific layouts, styling, and interactivity logic.

**Explicitly Out of Scope:**

* Mobile UI and native app architecture (`apps/mobile`).

* Any logic, styles, or layouts not consumed by the desktop shell.

* Configuration of shared boundary/contract logic (handled elsewhere).

**Hard Constraints:**

* No deviation from four-panel model without explicit review.

* No CSS or JS libraries allowed to introduce responsive/mobile surfacing.

* Always additive to BOUNDARY_GUARD.desktop.template.md; does not supersede or relax root boundary guard requirements.

* No live configuration, commands, or provider/IP-specific information is permitted within this template.