# BOUNDARY_GUARD.desktop.template.md

\[\[ TEMPLATE META \]\] Name: Residual Risk Assessment  

Description: Use this template to turn a chat request into a PRD-style workflow that forces explicit risk assessment and residual risk assessment before work is considered complete. It should be used for features, fixes, refactors, integrations, deployments, and environment changes where hidden assumptions or incomplete verification can cause failures.  

Instructions: Paste the request and all relevant context into this template. The assistant should define the scope, identify constraints, and describe the intended outcome. It must then surface both risks and residual risks clearly: risks are what could go wrong during or because of the work, while residual risks are what remains unverified, fragile, assumed, incomplete, or still likely to fail after the proposed or completed work. Responses should be concrete, scoped, and action-oriented. Do not pad with summaries of completed work. Always end with the exact validations, tests, or next actions still required.

---

## Template Header

This file is the desktop boundary guard for `apps/desktop` within `building-things-system`. It applies to all changes targeted at `apps/desktop`. It is additive to `BOUNDARY_GUARD.root.template.md`—the root guard must also be satisfied. This template protects the desktop shell from architecture drift, scope contamination, and violations of its local-first, workspace-scoped design contract.

---

## Desktop Architecture Contract

The following architectural properties of `apps/desktop` are non-negotiable and must remain true after any change:

* **Local-first:** SQLite is the authoritative persistence layer; no remote database is the primary source of truth.

* **Workspace-scoped:** All resources (files, sessions, artifacts, deployments, MCP, config) are always associated with a specific workspace. Cross-workspace resource leakage is not permitted.

* **Panel-based UI:** The user interface is composed of sidebar, center, inspector, and bottom rail panels. These are desktop interaction surfaces, not mobile screens or abstractions.

* **Route-thin:** API routes must only validate and delegate; all business logic is strictly implemented within `lib/services/`.

* **Assistant-local:** The assistant loop is architected to be stubbed and operate entirely local-by-default. No external AI provider is connected without explicit decision logging in `DECISION_LOG.template.md`.

Any change that attempts to weaken or bypass any of these properties must be accompanied by an explicit decision in `DECISION_LOG.template.md`.

---

## Workspace and Session Scope Protection

---

## Local-First and Schema Integrity Protection

---

## No Mobile-Driven Contamination

---

## Truthfulness and Honesty Checks

---

## Risk & Residual Risk Assessment

**Risks:**

* Introduction of architecture drift due to changes that bypass SQLite or introduce remote state.

* Scope contamination by leaking resource data across workspace boundaries.

* Local/remote ambiguity if UI or logic claims remote execution or real-time state that is actually stubbed or simulated.

* Accidental schema inconsistencies, especially with new app-state keys or altered type signatures not reflected across all required files.

* Contamination of the desktop shell with mobile-first or mobile-native artifacts, patterns, or navigation concepts.

**Residual Risks:**

* Unverified assumptions regarding active workspace isolation in endpoints or utility functions.

* Fragility if newly added schema changes are absent from migration logic or types, especially during rapid prototyping.

* Unnoticed local/remote divergence if UI state or backend hints fudge the line between simulation and production intent.

* Existence of edge-case leaks (e.g., referencing a resource with a stale or missing `workspace_id`).

* Risks remain if checklist items above remain unchecked, or if any required test or validation has not been performed.

**Validations/Tests/Next Actions Still Required:**

* Exhaustive testing of all endpoints handling resource lists for proper workspace scoping

* Audit of all app-state and schema changes for full consistency and absence of silent drops

* Explicit verification that all UI and assistant behaviors remain local-first and do not misrepresent back-end status or capability

* Migration and rollback dry runs where schema or persistence semantics have been touched

* Final review ensuring no mobile or responsive patterns appear in any diff targeting apps/desktop

---

## Scope & Intended Outcome

**Scope:**

* All modifications affecting `apps/desktop` within the `building-things-system` monorepo.

* Includes: core persistence, schema, UI panel structure, workspace/session/file/artifact/deployment/MCP/config logic, assistant loop, and all API route logic associated with `apps/desktop`.

**Intended Outcome:**

* Desktop shell remains local-first, workspace-scoped, panel-based, route-thin, and assistant-local.

* No architecture drift, scope contamination, or mobile-pattern leakage is permitted.

* Success is all checklist sections above being fully verified as true and each residual risk either resolved or explicitly documented.

* All decisions weakening these constraints are logged in `DECISION_LOG.template.md`.

**Explicitly Out of Scope:**

* Changes targeting only mobile architectures or interaction models.

* Migration to a remote or cloud-first database model.

* Cross-app UI unification or pattern reuse not explicitly approved at the DECISION_LOG layer.

**Hard Constraints:**

* Must comply with both this desktop-specific guard and `BOUNDARY_GUARD.root.template.md`.

* No assumption of mobile as fallback, derivative, or prototype context for desktop.

* Tooling, hosting, or deployment changes require prior review under the same architectural contract as above.