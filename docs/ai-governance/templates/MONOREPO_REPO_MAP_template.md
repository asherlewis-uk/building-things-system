# MONOREPO_REPO_MAP.template.md

## Template Header

This is the canonical repository map for the `building-things-system` monorepo ([github.com/asherlewis-uk/building-things-system](https://github.com/asherlewis-uk/building-things-system)). This file defines:

* The verified folder structure of the monorepo

* The intended location of governance files and templates

* The designated home for app-local agent instructions

* Where future shared packages are provisionally planned

* How agents, AI developers, and maintainers should navigate, verify, and extend the repository

This map reflects the current validated repository state and explicitly marks future or provisional directory locations that are *not yet created* and *not yet canonical*. When repository structure decisions diverge from this map, changes must be recorded.

---

## Root Structure

The root of the monorepo currently consists of:

**Root-level governance files** either live directly in the root or in a future `governance/` or `.github/instructions/` directory (exact location is TBD). The presence of each subdirectory is to be explicitly confirmed before use.

---

## apps/desktop Structure

The confirmed directory structure inside `apps/desktop` is as follows:

* `app/`: Next.js App Router pages and API routes (primary Next.js interface)

* `components/`: React component library.

  * Key subdirectory: `workspace/` (desktop workspace context)

* `hooks/`: Custom React hooks for desktop workspace logic

* `lib/`: Domain services, utilities, persistence

  * Key subdirectory: `services/` (core logic and cross-cutting concerns)

* `docs/`: App-local documentation only

* `.serena/`: Agent/tooling configuration. *Do not modify unless you understand the agent integration and its system responsibilities.*

**Key files at** `apps/desktop` **root:**

* `README.md`

* `REPORT.md`

* `START-HERE-NATIVE-SCOPE.md`

* `package.json` (name: `ai-studio-applet`, managed with `npm`)

* `next.config.ts`, `tsconfig.json`

* `.env.example`

* `workspace.db` (SQLite; never commit with live user or production data)

* `.eslintrc.json` (lint configuration)

**Package Management:**  

`npm` is the authoritative package manager for this app.

---

## apps/mobile Structure

The confirmed directory structure inside `apps/mobile` is as follows:

* `app/`: Expo Router screen files, layout definitions (native mobile navigation structure)

* `components/`: Shared UI component library for mobile

* `context/`: React context providers for mobile state

* `lib/`: Utility functions and service clients

* `src/`: Additional source files (*confirm before adding—do not add implementation files here without reason*)

* `assets/`: Images, icons, splash screens (static resources)

* `output/`: Build output; *do not edit by hand or use as implementation source*

**Key files at** `apps/mobile` **root:**

* `app.json` (Expo configuration—`slug: ai.mine`, `scheme: aimine`)

* `package.json` (name: `ai.mine`, `pnpm` enforced)

* `babel.config.js`, `metro.config.js`

* `tsconfig.json`

* `.npmrc`

* `.replit` (historical; *do not assume Replit is a canonical environment for current or future work*)

* `.vscode/` (editor/project settings)

**Package Management:**  

`pnpm` is the authoritative and enforced package manager (via preinstall hook).

---

## Where Governance Files Live

Governance and template files produced as part of system governance, architectural, and agent-instruction work belong in the following intended locations (all *not yet canonical*—final commit location may change):

* **Monorepo root level (system-wide):**

  * `SYSTEM_SCOPE.template.md`

  * `AGENTS.template.md`

  * `SHARED_CONTRACT.template.md`

  * `ACTIVE_EXECUTION.template.md`

  * `EXECUTION_PACKET.template.md`

  * `ENVIRONMENT_MATRIX.template.md`

  * `RELEASE_AND_ROLLBACK.template.md`

  * `BUILD_HISTORY.template.md`

  * `DECISION_LOG.template.md`

  * `BOUNDARY_GUARD.root.template.md`

  * `VERIFICATION_COMPLETION_GATE.template.md`

  * `HARDENING_GATE.template.md`

* **apps/desktop:**

  * `BOUNDARY_GUARD.desktop.template.md`

  * `UI_CONSTRAINT_GATE.desktop.template.md`

  * `DESKTOP_CONTEXT.template.md`

* **apps/mobile:**

  * `BOUNDARY_GUARD.mobile.template.md`

  * `UI_CONSTRAINT_GATE.mobile.template.md`

  * `MOBILE_CONTEXT.template.md`

**Provisional home for governance files:**

* Monorepo: Root, `governance/`, or `.github/instructions/`

* App-local: `.github/instructions/` for each app, or a future equivalent  

  Final committed location is subject to explicit decision and review.

---

## Where Future Shared Packages Go

The *provisional*, *not yet canonical* location for all future shared packages is:

* `packages/` at the root of the monorepo

**Key notes:**

* `packages/` does not exist at this time and must NOT be created without explicit approval

* The first expected package is for the shared contract (name undecided), which will formalize the interfaces and semantics described in `SHARED_CONTRACT.template.md`

* No decisions have been made on package structure, naming, TypeScript configuration, or module resolution

* Any creation or addition to `packages/` must be preceded by an explicit architectural decision logged in `DECISION_LOG.template.md`

---

## Where App-Local Instructions Live

**apps/desktop:**

* App-agent or Copilot instructions should be placed in either:

  * `apps/desktop/.github/instructions/` (*provisionally intended — create after confirming Copilot/agent needs*)

  * `apps/desktop/.serena/` (**already present**; understand existing usage before adding)

* App-local governance files:

  * `DESKTOP_CONTEXT.template.md`

  * `BOUNDARY_GUARD.desktop.template.md`

  * `UI_CONSTRAINT_GATE.desktop.template.md`

**apps/mobile:**

* App-agent or Copilot instructions should be placed in either:

  * `apps/mobile/.vscode/` (**already present**) or

  * a future `apps/mobile/.github/instructions/` directory (TBD)

* App-local governance files:

  * `MOBILE_CONTEXT.template.md`

  * `BOUNDARY_GUARD.mobile.template.md`

  * `UI_CONSTRAINT_GATE.mobile.template.md`

**Important:**

* The *exact* canonical location for app-local instructions remains *undecided*.

* No governance files are to be committed to any app directory until their location is decided and validated.

---

## Navigation Rules for Agents

All AI agents, developers (human or machine), and Copilot extensions must adhere to these navigation constraints:

1. **Start with system intent:** Always read `SYSTEM_SCOPE.template.md` before modifying, creating, or moving any system-level, contract, or governance file.

2. **Always identify your app:** Clarify whether your context is `apps/desktop`, `apps/mobile`, or both, before reading or changing any file.

3. **For** `apps/desktop` **work:** Read `DESKTOP_CONTEXT.template.md` and `BOUNDARY_GUARD.desktop.template.md` before making app-specific changes.

4. **For** `apps/mobile` **work:** Read `MOBILE_CONTEXT.template.md` and `BOUNDARY_GUARD.mobile.template.md` before making app-specific changes.

5. **For shared scope or cross-app changes:** Always consult `BOUNDARY_GUARD.root.template.md` and `SHARED_CONTRACT.template.md`.

6. **Never use output or ephemeral files as source:** Do NOT look at `output/`, the live contents of `workspace.db`, or `.replit-artifact/` for implementation reference — these are runtime artifacts only.

7. **Ask rather than assume:** If the correct location for a new directory, file, or configuration is unclear, use this repo map, consult core templates, and surface the question for explicit decision. Do not add files speculatively.

---