# VERIFICATION_COMPLETION_GATE.template.md

\[\[ TEMPLATE META \]\] **Name:** Residual Risk Assessment  

**Description:** Use this template to turn a chat request into a PRD-style workflow that forces explicit risk assessment and residual risk assessment before work is considered complete. It should be used for features, fixes, refactors, integrations, deployments, and environment changes where hidden assumptions or incomplete verification can cause failures. **Instructions:** Paste the request and all relevant context into this template. The assistant should define the scope, identify constraints, and describe the intended outcome. It must then surface both risks and residual risks clearly: risks are what could go wrong during or because of the work, while residual risks are what remains unverified, fragile, assumed, incomplete, or still likely to fail after the proposed or completed work. Responses should be concrete, scoped, and action-oriented. Do not pad with summaries of completed work. Always end with the exact validations, tests, or next actions still required.

---

## Template Header

This is the verification and completion gate template for **building-things-system**.  

No tranche, feature, fix, refactor, or integration may be declared complete until every applicable item in this checklist has been satisfied.  

The gate applies to all work in the monorepo regardless of which product surface or architectural component was touched.  

Operators must fill in the **Scope Declaration** row below before running the checklist.  

AI agents must not declare work done solely by asserting completion — they must enumerate and fill the gate checklist for human verification.

---

## Scope Declaration

**Operator must fill this row before proceeding to the checks below.**

---

## Universal Checks — All Work

* Scope was confirmed against SYSTEM_SCOPE.template.md before work began.

* BOUNDARY_GUARD.root.template.md was consulted and no root-level violations are present.

* No cross-system field was changed in one app only.

* No desktop panel assumptions were introduced into apps/mobile.

* No mobile-native assumptions were introduced into apps/desktop.

* No fake success states, fake sync, or silent no-ops were introduced.

* No speculative architecture was implemented as if already decided.

* All placeholders in governance templates remain as placeholders unless a specific decision was made and logged in DECISION_LOG.template.md.

---

## apps/desktop Checks

*(Complete this section only if apps/desktop was touched; otherwise, mark section N/A.)*

* npm run lint passes with no new errors.

* npm run build passes cleanly.

* Workspace scoping is intact — no resource leaks across workspaces.

* Session mode (chat/write) is persisted correctly on session and message records.

* If schema was changed: lib/db-schema.ts, lib/types.ts, affected services, and affected routes are all updated.

* If assistant behavior was changed: local-only constraint is preserved; lib/ai-stub.ts and lib/services/assistant.ts remain the source of truth.

* If preview was changed: preview renders saved content honestly — no fake live-execution claims.

* If terminal was changed: terminal remains virtual and workspace-file-backed.

* Route handlers remain thin — business logic stays in lib/services/.

* UI states (empty, error, preview, deploy, assistant) describe what actually happened.

---

## apps/mobile Checks

*(Complete this section only if apps/mobile was touched; otherwise, mark section N/A.)*

* pnpm typecheck passes with no new errors.

* Native build is not broken (method: TBD per environment — confirm against ENVIRONMENT_MATRIX.template.md).

* No desktop panel metaphors were introduced into mobile navigation or layout.

* Mobile is not being treated as a responsive web fallback — no web-responsive layout logic introduced.

* Detachable chat surface responsibility is preserved — no change conflates it with the standalone companion mode.

* Standalone personal AI companion responsibility is preserved — no change conflates it with the detachable chat surface.

* Deep link scheme aimine:// is intact if routing or deep-link behavior was changed.

* If any cross-app session field was touched, the shared contract was consulted and SHARED_CONTRACT.template.md was updated.

* Manual smoke on physical device or simulator was performed (or explicitly deferred with documented reason).

---

## Cross-App and Shared Contract Checks

*(Complete this section only if both apps were touched or any shared contract field was modified; otherwise, mark section N/A.)*

* All changed contract fields are reflected in SHARED_CONTRACT.template.md.

* Both apps/desktop and apps/mobile have been updated consistently — no partial implementation.

* BOUNDARY_GUARD.root.template.md has been reviewed and no violations remain.

* A DECISION_LOG.template.md entry has been created for any new architectural decision introduced by this work.

* RELEASE_AND_ROLLBACK.template.md has been consulted if this change is being released.

---

## Completion Declaration

**To be filled when all applicable checks are complete.**

*All applicable gate checks for \[TRANCHE NAME\] are satisfied as of \[DATE\]. Remaining open items: \[list or none\]. Signed off by: \[OPERATOR or AGENT NAME\].*

*Note: Work is not considered complete until this declaration is filled and a human has reviewed the checklist. AI agents must produce this declaration for human review — they may not self-certify completion without human confirmation.*

---

## Risk & Residual Risk Assessment

### Risks

* \[List any current or potential risks associated with the change or tranche, including possible failures, architectural drift, violation of cross-app boundaries, environment or dependency mismatches, or other measurable concerns.\]

### Residual Risks

* \[List any residual risk, fragile areas, or unverified assumptions that remain after completion of all required checks. Explicitly call out incomplete verifications, missing files/configs, environmental gaps, or process edges not tested. Specify any area likely to fail, roll back, or require additional action in response to edge cases or future cross-app changes.\]

---

## Scope & Intended Outcome

**Explicitly state:**

* What is being changed

* What success looks like

* What is in scope

* What is out of scope

* Any hard constraints such as required environments, tooling, hosting, branches, domains, or deployment triggers.

---