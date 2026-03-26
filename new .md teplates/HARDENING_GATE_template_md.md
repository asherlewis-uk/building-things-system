# HARDENING_GATE.template.md

\[\[ TEMPLATE META \]\]  

**Name:** Residual Risk Assessment  

**Description:**  

Use this template to turn a chat request into a PRD-style workflow that forces explicit risk assessment and residual risk assessment before work is considered complete. It should be used for features, fixes, refactors, integrations, deployments, and environment changes where hidden assumptions or incomplete verification can cause failures.  

**Instructions:**  

Paste the request and all relevant context into this template. The assistant should define the scope, identify constraints, and describe the intended outcome. It must then surface both risks and residual risks clearly: risks are what could go wrong during or because of the work, while residual risks are what remains unverified, fragile, assumed, incomplete, or still likely to fail after the proposed or completed work. Responses should be concrete, scoped, and action-oriented. Do not pad with summaries of completed work. Always end with the exact validations, tests, or next actions still required.

---

## Template Header

This is the hardening gate template for building-things-system.  

It applies whenever a tranche involves stability work, resilience improvements, error handling, schema migrations, state machine changes, or any work where the primary risk is silent degradation rather than obvious breakage.  

This gate is *additive* to `VERIFICATION_COMPLETION_GATE.template.md` — both gates must be satisfied when hardening work is in scope.  

Operators must first declare which surface the hardening applies to before evaluating any checklist item.

---

## Scope Declaration

*This row must be completed before evaluating any checklist item below.*

---

## Desktop Shell Hardening

*Complete this checklist if any changes apply to* `apps/desktop`*. Mark N/A if not in scope.*

---

## Native Mobile Hardening

*Complete this checklist if any changes apply to* `apps/mobile`*. Mark N/A if not in scope.*

---

## Shared Contract Hardening

*Complete this checklist if changes touch the shared contract layer. Mark N/A if not in scope.*

---

## Architecture Drift Check

*Apply this checklist for every hardening tranche, regardless of surface.*

---

## Risk & Residual Risk Assessment

**Current Risks:**

* (List concrete risks identified during preparation and review, e.g., silent degradation surfaces, race conditions, incomplete error handling, environment config mismatches.)

* (Include all risks that could be introduced as a result of the tranche covered.)

**Residual Risks Remaining:**

* (List all verifications, configs, or system concerns that are not yet fully validated.)

* (Include areas where assumptions have been made, dependencies are fragile, verification is incomplete, files/configs remain missing, or rollbacks are not fully tested.)

* (State explicitly if any required validation is skipped or pending.)

---

## Scope & Intended Outcome

* **In Scope:**

  * (State precisely what is being modified under this tranche, e.g., file paths, modules, macrosystems, state machines, error handoff logic.)

  * (Bound concretely to the surface: desktop shell, native mobile, shared contract, or monorepo root.)

* **Success Criteria:**

  * (Define specific outcomes that would represent robust, visible, and testable hardening, including error surfaces, migration evidence, environment stability.)

* **Out of Scope:**

  * (State what is intentionally left unchanged or untouched by this tranche.)

* **Constraints:**

  * (State any requirement for environment, tooling, hosting, branch, deployment, domain, or shared responsibility. Include any explicit dependencies or integration points.)

---

**End of HARDENING_GATE.template.md**