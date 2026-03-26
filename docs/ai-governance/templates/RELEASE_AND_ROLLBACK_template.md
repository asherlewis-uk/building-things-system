# RELEASE_AND_ROLLBACK.template.md

## Template Header

This is the release and rollback process template for `building-things-system`. It establishes placeholder procedures for releasing changes to the shared product's apps/desktop, apps/mobile, and the shared contract layer. This document does not contain any live commands, deployment targets, provider-specific details, or operational configurations. All steps listed herein are placeholders and require explicit operator assessment and confirmation before execution. Any time a release process is defined, altered, or replaced, this template must be reviewed and updated accordingly.

---

## Desktop-Only Release

**Purpose:**  

Guidance for changes affecting only the desktop architecture of the shared product, with no mutation or indirect impact on the shared contract or mobile architecture.

**Placeholder Release Steps:**

1. **Boundary Verification:**  

  Confirm `BOUNDARY_GUARD.desktop.template.md` is free from violations.

2. **Completion Gate:**  

  Ensure `VERIFICATION_COMPLETION_GATE.template.md` checklist is fully satisfied for apps/desktop.

3. **Linting:**  

  Confirm linting passes (e.g., `npm run lint` in `apps/desktop`), but do not specify live command.

4. **Build:**  

  Confirm build passes (e.g., `npm run build` in `apps/desktop`); do not assume build method is fixed.

5. **Manual Verification:**  

  Execute the manual smoke test checklist referenced in the `apps/desktop/README.md`.

6. **Deployment:**  

  Deployment method: **TBD** — no live deployment commands are included.

7. **Post-Release Verification:**  

  Post-release verification: **TBD**.

**Constraint:**  

A desktop-only release must not introduce or alter any shared contract field or cause observable effects in the mobile app’s behavior. This includes implicit or indirect contract changes.

---

## Mobile-Only Release

**Purpose:**  

Guidance for changes affecting only the mobile architecture of the shared product, with no mutation or indirect impact on the shared contract or desktop architecture.

**Placeholder Release Steps:**

1. **Boundary Verification:**  

  Confirm `BOUNDARY_GUARD.mobile.template.md` is free from violations.

2. **Completion Gate:**  

  Ensure `VERIFICATION_COMPLETION_GATE.template.md` checklist is fully satisfied for apps/mobile.

3. **Typecheck:**  

  Confirm static typechecking passes (e.g., `pnpm typecheck` in `apps/mobile`).

4. **Build:**  

  Confirm the native build is not broken (build method: **TBD**).

5. **Device Verification:**  

  Manual smoke test must be executed on a physical device or simulator.

6. **Distribution:**  

  Distribution method: **TBD** (e.g., Expo EAS, TestFlight, Play Store internal — details not included).

7. **Post-Release Verification:**  

  Post-release verification: **TBD**.

**Constraint:**  

A mobile-only release must not introduce or alter any shared contract field or cause observable effects in the desktop app’s behavior.

---

## Shared Contract Release

**Purpose:**  

Placeholder process for changes to the shared contract (fields and structures defined in `SHARED_CONTRACT.template.md`) affecting both architectures. Highest risk; requires coordinated action.

**Placeholder Release Steps:**

1. **Boundary Review:**  

  Confirm both `BOUNDARY_GUARD.desktop.template.md` and `BOUNDARY_GUARD.mobile.template.md` have been reviewed and passed.

2. **App Update Verification:**  

  Confirm that both the desktop and mobile architectures have been updated to reflect the shared contract change.  

  No single-app workaround or partial implementation is permitted.

3. **Completion Gates:**  

  Ensure `VERIFICATION_COMPLETION_GATE.template.md` checklists are satisfied for both architectures.

4. **Implementation Completeness:**  

  Explicitly check for and rule out any workaround, partial, or asymmetric implementation.

5. **Contract Package Location:**  

  Package location for the shared contract is a *placeholder future location*, *not yet created*, *not yet canonical* — release and versioning standards for such a package are **TBD**.

6. **Deployment Order:**  

  Deployment sequence for desktop vs mobile is **TBD**. The implementation owner must define and follow an explicit order per release.

**Constraint:**  

A shared contract release must not be deployed to only one architecture. Both desktop and mobile must reflect and fully support the contract revision before any go-live event.

---

## Rollback Triggers

**This section lists placeholder triggers to signal a rollback.**  

Operators are required to expand this list based on tranche-specific criteria and product context.

* Post-release verification fails for any critical user flow in either architecture.

* Shared contract change disrupts session continuity or active surface experience across both architectures.

* Production build failure in apps/desktop post-release.

* Measurable native crash on launch in apps/mobile following deployment.

* Shared contract field or structure produces data that is not parsable by either architecture.

* Security issue detected involving any environment variable, authentication, or authorization pathway.

*All triggers are placeholders. Operators must define severity thresholds and assign decision-making responsibility prior to any production release.*

---

## Rollback Ownership

**Ownership for rollback execution must be defined for every surface and shared contract:**

* **Desktop rollback owner:** **TBD** (responsible for initiating, executing, and verifying rollback for desktop architecture)

* **Mobile rollback owner:** **TBD** (responsible for initiating, executing, and verifying rollback for mobile architecture)

* **Shared contract rollback owner:** **TBD**  

  (requires both architecture owners to coordinate, execute, and verify rollbacks)

**Rollback Methods:**  

Rollback method per surface is **TBD**.  

No git commands, deployment platform steps, or provider-specific instructions are present in this template.  

*This section must be completed and validated prior to any release process becoming operational.*

---

## Risk & Residual Risk Assessment

**Current Risks:**

* Incomplete or ambiguous delineation between desktop, mobile, and shared contract scope may lead to accidental cross-architecture impacts.

* Placeholder processes risk omission of necessary verification steps if operator oversight occurs.

* Delay in defining the canonical shared contract package location can result in release inconsistency or ambiguity.

* Lack of decision on deployment order in shared contract releases increases the likelihood of asymmetric rollouts.

* Omission of specific rollback ownership can result in confusion or slow response in the event of a required reversal.

**Residual Risks:**

* Unverified assumptions regarding build methods, release distribution, and post-release validation persist until methods are concretely established.

* Configuration or environment drift may occur if release processes are updated without corresponding changes to this template.

* Fragile areas include interpretation of completion gates, smoke test coverage, and symmetry of contract support between architectures.

* The placeholder nature of triggers and ownership means some rollback scenarios may not be adequately anticipated.

* Absent explicit post-release verification standards leave critical surface regressions under-detected.

**Validations, Tests, or Next Actions Still Required:**

* Establish concrete linting, build, distribution, and post-release verification methods for both architectures.

* Define and communicate canonical shared contract packaging, location, and versioning standards.

* Enumerate operational severity thresholds and trigger conditions specific to the shared product context.

* Assign, publish, and train rollback ownership for all product surfaces.

* Update this template with finalized process steps and operational details before permitting live deployment.

---

## Scope & Intended Outcome

**Scope:**  

This template governs the procedural, risk, and coordination requirements for releases to the shared product’s desktop architecture, mobile architecture, and shared contract layer within the `building-things-system` monorepo. It applies to all prospective, planned, and executed releases, as well as any rollback incidents across these surfaces.

**Intended Outcome:**

* All changes are released in accordance with clearly established, shared product boundaries.

* No contract or cross-architecture change is released without full bi-architecture verification and operator sign-off.

* Rollbacks are clearly delineated in terms of triggers, ownership, and process—never ad hoc.

* Release and rollback steps are maintained as placeholders until operationalized in a provider- or environment-specific manner.

* Success is defined as a release or rollback that occurs without violation of product invariants, unexpected cross-architecture impact, or introduction of fragile/undefined system states.

**Explicitly In Scope:**

* All process, risk, and verification documentation for releases and rollbacks of desktop, mobile, and shared contract changes.

* Provisional process definition, pending operational filling.

**Explicitly Out of Scope:**

* All live commands, environment values, provider-specific configuration, and final package structures.

* App-specific, team-specific, or environment-specific instructions not part of the generic placeholder process.

* Assumptions of sequential development or operational precedence not explicitly defined herein.

**Hard Constraints:**

* No surface is permitted to release or rollback in isolation where shared contract fields are affected.

* The placeholder status of all operational parts is preserved until ratified by system governance and architecture owners.