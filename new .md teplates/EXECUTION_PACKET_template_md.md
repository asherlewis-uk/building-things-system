
# EXECUTION_PACKET.template.md

## Template Header

This is the model-facing execution packet template for **building-things-system**. It provides a structured input for any automated or AI-assisted work in the monorepo. Every section must be fully completed before execution is authorized. Non-applicable sections must state `'none'` or `'n/a'`; no section should be left blank. If the execution involves multiple areas, each boundary and impact must be clearly separated and detailed.

---

## Objective

\[State exactly and concretely what this execution must accomplish.\]  

Example: "Add a new field, `message_id`, to the session message payload in `apps/desktop/app/api/sessions/[id]/messages/route.ts` and synchronize the definition in the placeholder future shared contract location."

---

## Repo Scope

\[Specify which part(s) of the `building-things-system` monorepo are involved. Choose from:

* monorepo root

* apps/desktop

* apps/mobile

* both apps

* shared contract (placeholder future location, not yet canonical)\]

\[If both apps or the shared contract are affected, state that all boundary requirements from `BOUNDARY_GUARD.root.template.md` and current boundary rules must be addressed.\]

---

## App Scope

\[If execution affects one or both apps, state explicitly which architectural areas or responsibilities are in-scope for each.  

For desktop: UI, API routes, services, schema, config, etc.  

For mobile: screens, components, context, library, navigation, etc.  

If both apps, detail both. Make all cross-app impacts explicit.  

Do not conflate UI, contract, and service layers.\]

---

## Files in Scope

\[List the exact files the operator is authorized to read and/or modify for this execution.  

Files outside this list are out of scope.  

If additional files are found to be required, the operator must halt and escalate for scope approval.\]

---

## Gates to Apply

\[List all governance gates, boundaries, and checks that apply to this execution.  

Select from:

* `BOUNDARY_GUARD.root.template.md` (always applies)

* `BOUNDARY_GUARD.desktop.template.md` (if desktop surface is affected)

* `BOUNDARY_GUARD.mobile.template.md` (if mobile surface is affected)

* `UI_CONSTRAINT_GATE.desktop.template.md` (desktop UI changes)

* `UI_CONSTRAINT_GATE.mobile.template.md` (mobile UI changes)

* `HARDENING_GATE.template.md` (specify surface as desktop, mobile, shared contract)

* `VERIFICATION_COMPLETION_GATE.template.md` (completion requirements)\]

\[Precisely match checks to the affected parts of the system. Do not list gates generically.\]

---

## Acceptance Criteria

\[List the specific, testable criteria that must all be met for this work to be considered complete.  

Each condition must be verifiable. Do not use vague statements.\]

Examples:

* '`npm run lint` produces zero errors'

* '`npm run build` completes successfully in both apps'

* '`message_id` is present in the serialized payload and covered by tests'

* 'No breakage in mobile context provider tests'

* 'No unintended changes to current shared contract (placeholder future location) types except as described'

---

## Out of Scope

\[Enumerate specifically what is NOT to be changed, touched, or altered during this execution.  

State hard constraint boundaries.\]

Examples:

* Do not change shared contract (placeholder future location) types unless specifically authorized.

* Do not alter database schemas outside the named migration.

* Do not modify application navigation logic.

* Do not change any files in `apps/mobile` if only desktop is in scope (and vice versa).

* Do not alter authentication workflows.

---

## Expected Output Format

\[Describe the required format and contents of the deliverable.\]  

\[Choose from or combine:

* Code changes only (no summary or commentary)

* Unified or split diff (specify type)

* Inline code comments (if required)

* Completed `VERIFICATION_COMPLETION_GATE.template.md` checklist

* Entry format for `BUILD_HISTORY.template.md`

* Any combination of the above\]

\[The model must not produce output in any other format than specified here. Non-matching output will be rejected.\]