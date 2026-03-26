# BUILD_HISTORY.template.md

## Template Header

This document serves as the authoritative, monorepo-aware build and change ledger for the `building-things-system`. Each entry here records a tranche or significant change event affecting any part of the monorepo, capturing decision-level context, explicit risks, and verification status—each of which are not covered by git commit logs. Entries are appended in reverse chronological order: the newest entries appear first. This ledger is required for all operators and AI agents. Every significant change or completed tranche must be logged following the prescribed format. This document forms part of the shared product/system identity: all architectural and product changes affecting `apps/desktop`, `apps/mobile`, their shared system boundary, or future shared contract must be recorded here.

---

## Entry Format

**Every build history entry MUST use the following markdown template.**Complete every field—no omissions.

### Build History Entry Template

Markdown Template Block (copy and fill for each entry):

```
### \[Date\] – Build Tranche: \[Tranche Name or Number\]

```

`Apps Touched: [apps/desktop | apps/mobile | both | monorepo root]`  

`Contract Touched: [Yes/No — if Yes, specify which fields, e.g., workspace_id, session_id, etc.]`  

`Summary: [One-two sentence description of what changed and why.]`

**Risks Introduced:**

* `[Bullet: Explicit risk #1]`

* `[Bullet: Explicit risk #2]`

* `...`

**Verification Done:**

* `[List of checks: lint, build, typecheck, smoke, contract semver, guardrails, etc.]`

* `...`

**Open Items:**

* `[Bullet: Incomplete work or issues yet to be resolved]`

* `...`  

---

## Ledger

Below is the build/change history ledger. New entries go at the top.

---

### Example Entry (DO NOT REMOVE — use as a standard for all real entries)

### 2024-06-19 – Build Tranche: \[EXAMPLE INITIAL MIGRATION\]

**Apps Touched:** both  

**Contract Touched:** Yes — workspace_id, device_id (placeholder future shared-contract)  

**Summary:** Initial migration of `apps/desktop` (from Building.Things) and `apps/mobile` (from AI-UI-100) into unified monorepo with shared product/system identity. Placeholder for canonical shared contract structure defined.

**Risks Introduced:**

* Incomplete verification of cross-app session and device assumption alignment

* Provisional structure for shared contract not yet agreed or created

* Possible dependency mismatches between desktop and mobile

* Unverified handling of presence state across architectures

* Documentation onboarding for new monorepo operators incomplete

**Verification Done:**

* Lint and build run on both desktop and mobile

* Typecheck run on desktop; pending on mobile

* Initial shared contract schema placeholder reviewed

* No functional smoke tests completed yet

* No verification of model endpoint flows

* Boundary guards for contract and architecture in review

**Open Items:**

* Session_id and presence_state semantics still require reconciliation

* No CI/CD matrix or environment coverage established yet

* Shared contract location and ownership to be formalized

* Additional test coverage for artifact reference payloads needed

* Operator handoff documentation not yet written

---

**\[Append all subsequent real build/change history entries below this section, using the exact template above. Do not remove, revise, or reorder previous entries.\]**