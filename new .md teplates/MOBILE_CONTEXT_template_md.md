# MOBILE_CONTEXT.template.md

\[\[ TEMPLATE META \]\] Name: Residual Risk Assessment  

Description: Use this template to turn a chat request into a PRD-style workflow that forces explicit risk assessment and residual risk assessment before work is considered complete. It should be used for features, fixes, refactors, integrations, deployments, and environment changes where hidden assumptions or incomplete verification can cause failures.  

Instructions: Paste the request and all relevant context into this template. The assistant should define the scope, identify constraints, and describe the intended outcome. It must then surface both risks and residual risks clearly: risks are what could go wrong during or because of the work, while residual risks are what remains unverified, fragile, assumed, incomplete, or still likely to fail after the proposed or completed work. Responses should be concrete, scoped, and action-oriented. Do not pad with summaries of completed work. Always end with the exact validations, tests, or next actions still required.

---

## Template Header

This file is the authoritative app-specific context reference for `apps/mobile` within `building-things-system`. It must be read alongside `SYSTEM_SCOPE.template.md` and `AGENTS.template.md`. It does not repeat system-wide rules; instead, it specifies mobile-native context, invariants, navigation, dual-responsibility definitions, and forbidden architecture drift patterns. It is mandatory for all agents and operators working on or within `apps/mobile`.

---

## Role

`apps/mobile` is the native mobile application within the unified product/system identity of `building-things-system`. It originated from AI-UI-100 (github.com/asherlewis-uk/AI-UI-100) and is implemented using Expo \~54 and React Native 0.81.5 for both iOS and Android.  

It is responsible for two equally weighted roles:

1. **Detachable Remote Chat Surface:**

  * Serves as a mobile entry point into an active desktop session.

  * Allows users to participate in session conversations when attached and to operate independently when detached.

2. **Standalone Personal AI Companion:**

  * Operates as a fully self-contained, personal AI interaction product.

  * Does not require an active desktop session.

Neither responsibility is primary or secondary. Both must be preserved equally under all circumstances. The application architecture is distinct and does not derive from `apps/desktop`; their responsibilities and interaction models are separate but participate in the shared product/system identity.

---

## Native-First Constraints

* The app is a dedicated native iOS and Android application; it is neither a web app nor a PWA and must never present as one.

* All UI must be built using React Native primitives or Expo SDK wrappers; direct web element usage is forbidden.

* Routing and navigation are managed via Expo Router—no web routing technologies or metaphors are allowed.

* Interactive elements such as animations or gestures must employ Reanimated and Gesture Handler, not DOM-based solutions.

* The Expo (new architecture) flag (`newArchEnabled: true` in `app.json`) is always enabled. Changes must be compatible with this architecture.

* Tablet support is explicitly disabled (`supportsTablet: false` in config); design and verify for phone-only, in portrait orientation.

* The splash background uses the color `#0A0A0A` (dark theme).

* Dependency management is handled by pnpm, and is enforced by a preinstall hook. No npm or yarn workflows.

* These constraints are established and require explicit review for amendment.

---

## Detachable Chat Responsibility

* In detachable chat mode, `apps/mobile` connects to an existing desktop session via shared contract fields: `session_id`, `workspace_id`, `device_id`.

* The mobile app surface sends and receives messages as a participant in session state.

* The "Detach" action transitions the app to standalone mode or idle.

* Detach status is governed by the `detach_state` field as defined in `SHARED_CONTRACT.template.md`.

* Session resumption or handoff leverages the `aimine://` deep link scheme, using a structured payload.

* The UI for this role is a mobile-native chat interface, not a scaled-down copy of the desktop center panel.

* **Constraint:** All references to shared contract fields in this mode must comply with field definitions in the provisional/future shared contract (see `SHARED_CONTRACT.template.md`), and any changes require formal contract review.

---

## Personal Companion Responsibility

* In personal companion mode, `apps/mobile` is a standalone AI interaction product.

* This mode maintains its own navigation stack, conversation context, and interaction model.

* There is no dependency on desktop session state, workspace status, or desktop presence.

* The AI endpoint for this mode is **TBD**; no provider, environment variable, or API endpoint may be hardcoded or assumed final.

* The UI and interaction design must be natively mobile—with touch as the primary modality.

* This mode must not expose desktop-centric workspace features (workspace switching, file browsing, MCP config, terminals, etc.) as if they are inherent to the companion experience.

---

## Forbidden Architecture Drift

The following patterns are explicitly forbidden in `apps/mobile`:

1. Importing or referencing any component from `apps/desktop/components/`.

2. Replicating desktop workspace patterns including SQLite usage, virtual filesystems, or any `workspace.db` logic.

3. Transposing desktop layout (sidebar, center, inspector, rails) into mobile screen/component structure.

4. Treating the mobile app as a responsive fallback for desktop; mobile-first CSS, breakpoints, or web meta tags are disallowed.

5. Adopting Next.js or desktop-specific routing/API/server conventions (App Router, API routes, SSR, etc.).

6. Hardcoding any AI provider endpoint, API key, or environment-specific integration for the companion.

7. Implementing or modifying shared contract fields (`session_id`, `workspace_id`, `message_id`, `device_id`, `detach_state`, `active_surface`, `presence_state`) unilaterally; all changes must first be defined in `SHARED_CONTRACT.template.md`.

8. Assuming runtime, hosting, or environment is shared with `apps/desktop`—always treat processes as architecturally and operationally separate.

---

## Important Directories

**Key Config Files:**

* `app.json`: Expo configuration (`slug: ai.mine`, `scheme: aimine`, bundle identifiers)

* `babel.config.js`, `metro.config.js`, `tsconfig.json`

* `package.json` (name: `ai.mine`, pnpm is enforced)

**Historical Environment Reference:**

* `.replit` and `.replit-artifact` directories reflect past Replit usage only. Do not assume that Replit is a canonical or preferred development environment.

---

## Risk & Residual Risk Assessment

### Current Risks

* Inconsistent interpretation or use of shared contract fields (`session_id`, `detach_state`, etc.) may result in session or message routing failures.

* Architecture drift (such as importing desktop logic, layouts, or components) could break the mobile-native interaction model.

* Changes to Expo, React Native, or their configuration flags (e.g., `newArchEnabled`) could disrupt existing functionality if not fully evaluated.

* Feature work that assumes a shared runtime or environment with desktop may fail under real-world deployment.

* Adding device-specific features without verification on both iOS and Android could introduce platform fragmentation.

### Residual Risks

* Any shared contract field change that is not reviewed in `SHARED_CONTRACT.template.md` remains a potential point of fragility.

* The AI endpoint for personal companion mode is undefined; interim or stub implementations risk being embedded as de facto standards.

* Unvetted integration of navigation, animations, or gesture libraries may cause platform- or version-specific bugs.

* Reliance on Expo/React Native ecosystem packages may introduce untracked upstream dependency vulnerabilities or behavior changes.

* The absence of a canonical shared contract package means local drift is still possible until formalized (placeholder location only).

**Validations/Tests/Next Actions Required:**

* Review any new or changed use of contract fields for fidelity against shared contract definitions.

* Test all newly introduced features/changes independently on both iOS and Android (including edge input and navigation flows).

* Assess directory/file changes against the critical directory map above.

* Audit all Expo and React Native config changes for alignment with established constraints.

* Document any provisional API endpoints, providers, or contract field extensions as non-final until system-wide review.

* Confirm that no implementation decisions assume a shared runtime with desktop unless explicitly designed and documented.

---

## Scope & Intended Outcome

**In Scope:**

* Any work within `apps/mobile` involving interface, navigation, chat, or companion responsibilities, so long as it preserves strict separation from desktop architectures.

* Efforts that improve or maintain compliance with the native-first, dual-role mandate.

* Provisional work or refactorings that do not preempt canonical decisions on AI providers or shared contract location.

**Out of Scope:**

* Work that extends or modifies desktop application concerns or artifacts.

* Introduction of desktop workspace behavior, layouts, or patterns into mobile surfaces.

* Local, unilateral definition of contract fields whose meaning or structure are not captured in `SHARED_CONTRACT.template.md`.

* Implementation of features that assume desktop and mobile operate in a single process or hosting environment.

**Hard Constraints:**

* Native-first architecture and user interaction.

* Single source of truth for contract fields in `SHARED_CONTRACT.template.md` (provisional shared package/location, not yet canonical).

* Strict separation of runtime assumptions between architectures.

* No web, PWA, or desktop-adapted layouts/patterns.

* Adherence to specified Expo and React Native versions/configurations (no silent upgrades or migrations).

* Tablet support and landscape orientation remain out of scope unless separately approved.