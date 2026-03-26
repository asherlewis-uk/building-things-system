# DECISION_LOG.template.md

## Template Header

This document is the architectural decision log for **building-things-system**.  

It serves as the permanent, chronological record of decisions that affect the monorepo architecture, the shared contract boundary, app-level structure, or any cross-cutting concern. This log follows an ADR (Architectural Decision Record) format: each entry is permanent—decisions are appended, not deleted, and may only be superseded by newer entries referencing the original. All operators and AI agents must record a new entry here whenever a significant architectural or product decision is made, including explicit decisions to reject an option or approach.

This log underpins system coherence across `apps/desktop`, `apps/mobile`, and all shared-system boundaries. All decisions must reflect the product's shared system identity while accommodating separate architectures, responsibilities, and interaction models for each app.

## Entry Format

Each entry must follow this format. Copy and fill in for each new decision:

---

### ADR-\[###\]: \[Short Title\]

**Date:** \[YYYY-MM-DD\]  

**Status:** \[proposed / accepted / superseded (reference superseding ADR)\]  

**Title:** \[Short noun phrase describing the decision\]

**Decision**  

\[One to three sentences stating exactly what was decided. Be precise and avoid ambiguity.\]

**Why**  

\[Clearly state the constraint, product goal, system requirement, or insight that demanded or justified this decision.\]

**Alternatives Rejected**

* \[Briefly list each alternative considered. For each, include the specific reason it was rejected in this context. If none were formally evaluated, write: "none formally evaluated"\]

**Downstream Consequences**  

\[List the consequences of this decision: what it enables or makes easier, what it constrains or makes harder, what future work must respect, and any new or altered boundaries created.\]

**Apps Affected**

* \[apps/desktop, apps/mobile, both, or monorepo root\]

---

## Log

> **The entries below are EXAMPLES. Replace \[PLACEHOLDER\] values with concrete details for real decisions.**

---

ADR-000: Peer App Structure and Shared System Identity

**Date:** \[PLACEHOLDER: 2024-03-02\]  

**Status:** accepted  

**Title:** Monorepo peer apps with shared product identity

**Decision**  

This monorepo will contain two peer apps—`apps/desktop` and `apps/mobile`—with a shared product/system identity but separate architectures, responsibilities, and interaction models. Neither is a fallback or responsive variant of the other.

**Why**  

The product must support desktop and mobile as distinct native experiences serving the same system intent but with optimized designs for their platforms and use cases. Equating one to a fallback risks undermining their architectural independence and system integrity.

**Alternatives Rejected**

* Merge into a single responsive codebase: Rejected due to requirement for separate architectures and native-first interaction models.

* Dual-boot app with conditional features: Rejected as it risks architectural leakage and loss of clarity at the shared system boundary.

**Downstream Consequences**

* Enforces explicit boundaries between app architectures and code.

* Future features must be designed to respect peer status and not assume coupling or derivation.

* All cross-app features must operate within the defined shared system boundary.

**Apps Affected**

* both

---

ADR-000B: Shared Contract Package (Provisional)

**Date:** \[PLACEHOLDER: 2024-03-03\]  

**Status:** proposed  

**Title:** Provisional shared contract package location

**Decision**  

A future shared contract package (tentatively `packages/shared-contract`) is provisionally reserved as the canonical site for workspace/session/message IDs, device and presence semantics, and app handoff payloads. This is a placeholder; the location is not yet created and is not yet canonical.

**Why**  

Critical contract semantics (identity, session, presence, artifacts, handoff) require a clear, neutral source for both apps to align on shared boundaries. The reservation signals intended structure without preempting architectural confirmation.

**Alternatives Rejected**

* Duplicate contract logic in each app: Rejected as it risks divergence and cross-app ambiguity.

* Embed contract inline in one app: Rejected due to requirement for platform neutrality and strict separation of app responsibilities.

**Downstream Consequences**

* All code must treat this contract location as provisional; usage must be guarded with explicit reference to its placeholder status.

* Future architectural decisions must confirm, relocate, or re-scope the shared contract before it may be treated as canonical.

**Apps Affected**

* monorepo root

---

> Append additional, real ADR entries below this line following the format above. Never delete or rewrite past decisions; instead, supersede by reference if changing direction.

---

\[\[ TEMPLATE META \]\]  

Name: Residual Risk Assessment  

Description: Use this template to turn a chat request into a PRD-style workflow that forces explicit risk assessment and residual risk assessment before work is considered complete. It should be used for features, fixes, refactors, integrations, deployments, and environment changes where hidden assumptions or incomplete verification can cause failures.  

Instructions: Paste the request and all relevant context into this template. The assistant should define the scope, identify constraints, and describe the intended outcome. It must then surface both risks and residual risks clearly: risks are what could go wrong during or because of the work, while residual risks are what remains unverified, fragile, assumed, incomplete, or still likely to fail after the proposed or completed work. Responses should be concrete, scoped, and action-oriented. Do not pad with summaries of completed work. Always end with the exact validations, tests, or next actions still required.

\[\[ TEMPLATE SECTIONS - FOLLOW EXACTLY \]\]

---

## Risk & Residual Risk Assessment

* Enumerate all known risks related to the proposed or completed work.

* Clearly separate residual risks: unverified assumptions, potentially fragile logic, configuration or environment missing pieces, unhandled edge cases, ambiguous boundaries, rollback triggers, or items that are "not yet fully proven."

* List the exact validations, tests, or operational checks still required before the work is considered stable.

---

## Scope & Intended Outcome

* Clearly state what is being changed or decided, with explicit boundaries.

* Define what constitutes success and how it will be verified.

* List what is explicitly in scope (features, files, modules, flows).

* List what is explicitly out of scope.

* Highlight any hard constraints (environments, branches, deployment requirements, hard architectural lines to respect).