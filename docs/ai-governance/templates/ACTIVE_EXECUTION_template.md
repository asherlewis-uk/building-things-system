
# ACTIVE_EXECUTION.template.md

This is the active execution status template for the `building-things-system` monorepo.  

This document defines the current tranche of work across the entire shared product/system—including both app architectures (`apps/desktop`, `apps/mobile`) and the shared contract boundary (placeholder: `packages/shared-contract` or equivalent, not yet created or canonical).  

It must be completed at the start of every working tranche and updated with any change in working scope, constraints, or enforcement gates.  

No section should be omitted. All entries must remain as placeholders until work is planned.

---

## Template Header

**Monorepo:** `building-things-system`  

**This Document's Purpose:** Define, update, and track the active tranche of product and technical work.  

**Applies To:**

* All surface areas (`apps/desktop`, `apps/mobile`, shared contract boundary, monorepo root and governance)

* Product identity is unified; responsibilities and interaction models are architecture-specific

---

## Current Tranche

* **Tranche Name/Number:**  

  `[FILL IN: e.g., "2024.Q3.SessionBoundaryUpdate"]`

* **Start Date:**  

  `[FILL IN: e.g., "2024-07-15"]`

* **Objective:**  

  `[FILL IN: Concise statement of intended outcome, e.g., "Revise artifact handoff in shared contract to support parallel presence in desktop and mobile."]`

* **Scope (tick all applicable):**

  * apps/desktop

  * apps/mobile

  * shared contract (placeholder future location, e.g., packages/shared-contract)

  * monorepo root (docs/governance/CI)

  * `[Add specifics if multiple surface areas affected, e.g., "desktop and shared contract", "all", or specify directory depth if relevant]`

---

## Current Affected Surfaces

> For each ticked area, provide a clear one-sentence summary describing the focused surface or component, e.g., affected flows, modules, boundaries, or features.

* **apps/desktop** —  

  `[FILL IN: E.g., "Workspace routing and session artifact links."]`

* **apps/mobile** —  

  `[FILL IN: E.g., "Chat detachment lifecycle logic and AI companion onboarding."]`

* **shared contract** —  

  `[FILL IN: E.g., "Session, workspace, and handoff payload structure."]`

* **monorepo root** —  

  `[FILL IN: E.g., "CI step for shared contract schema verification."]`

---

## Current Constraints

> List any tranche-specific constraints, in addition to shared architectural rules: (Such as: “no CI/CD deploys this tranche”, or “do not touch device_id verification logic.”)

* `[List explicit in-force constraints relevant to this tranche; may include areas or files where changes are strictly prohibited.]`

* `[E.g., Local environments only; cannot alter authentication logic; exclude Appwrite config.]`

---

## Gates in Force

> Tick each active gate for this tranche.  
>
> All entries must reference the gate template for compliance; add others as needed per monorepo governance.

* BOUNDARY_GUARD.root.template.md (always in force for system boundary enforcement)

* BOUNDARY_GUARD.desktop.template.md (if desktop shell code, workspace, or local-first logic in scope)

* BOUNDARY_GUARD.mobile.template.md (if mobile architecture, detachable chat, or AI companion surface in scope)

* UI_CONSTRAINT_GATE.desktop.template.md (if desktop UI/interaction is being changed)

* UI_CONSTRAINT_GATE.mobile.template.md (if mobile UI/interaction is being changed)

* HARDENING_GATE.template.md (if work involves resilience, stabilization, or contract hardening)

* VERIFICATION_COMPLETION_GATE.template.md (always in force—must be completed before tranche is closed)

---

## Known Risks This Tranche

> For each identified risk, fill in all columns. Do not skip this section even if no risks are known yet.

---

## What Done Looks Like

> Specify precisely what will be delivered and how results are validated. List as testable criteria (checklist).

* `[Acceptance criterion 1, e.g., "Session and artifact handoff verified for both desktop and mobile surfaces."]`

* `[Acceptance criterion 2, e.g., "Shared contract (placeholder: packages/shared-contract) automated tests pass for workspace_id, session_id, device_id, and handoff formats."]`

* `[Acceptance criterion 3, e.g., "No regressions in current onboarding/identity flows for either interaction model."]`

* `[Acceptance criterion 4, e.g., "Updated docs and governance to match contract changes."]`

* `[Any other validation or verification steps required for closure.]`

---

**End of ACTIVE_EXECUTION.template.md**