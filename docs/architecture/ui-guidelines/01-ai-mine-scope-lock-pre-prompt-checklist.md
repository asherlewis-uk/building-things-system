# ai.mine Scope Lock Pre-Prompt Checklist

## Goal
Eliminate ambiguous decisions before sending any implementation prompt into Codex.

This document is designed for low-friction review by a non-coder. Every item exists because if it stays vague, Codex may invent structure, labels, or behavior.

---

## Friction rule
We should lock only the decisions that change:
- app structure
- navigation
- naming
- reusable component behavior
- repo setup behavior
- prompt portability

We should **not** lock details that can safely evolve later, like exact spacing tokens, final copy polish, or animation tuning.

---

## Scope areas that must be resolved before prompting Codex

### 1. Final screen inventory
**Why this must be locked:**
If the final screen list is unclear, Codex may add, merge, or rename screens on its own.

**What needs to be decided:**
- which screens definitely exist in v1
- which are top-level destinations
- which are modal / secondary / deferred

**Least-friction recommendation:**
Lock only the smallest stable v1 set:
- Home
- Temporary Chat
- Drawer / Navigation
- Chats / History
- Models / Modes
- Settings
- Library / Saved Context

**Why this is the lowest-friction choice:**
- it respects the layout references already shown
- it gives every obvious destination a home
- it prevents Codex from inventing missing pages later
- it is broad enough to grow without forcing deep architecture decisions yet

**What can stay unlocked for now:**
- Favorites as separate page vs section
- Profile as dedicated page vs drawer header action
- onboarding flow

---

### 2. Exact information architecture labels
**Why this must be locked:**
If names drift, the UI feels inconsistent and Codex may use different words in different screens.

**What needs to be decided:**
The final nouns used across the app.

**Least-friction recommendation:**
Use these labels consistently:
- Home
- Chats
- Library
- Models
- Settings
- Temporary Chat

**Why this is the lowest-friction choice:**
- simple plain-language labels
- no fancy branding terms to maintain
- easy to map across drawer, headers, routes, and future docs

**What can stay unlocked for now:**
- whether “Models” becomes “Modes” later
- whether “Library” becomes “Context” later

---

### 3. Exact component inventory
**Why this must be locked:**
If the reusable component list is fuzzy, Codex may build inconsistent one-off UI pieces.

**What needs to be decided:**
Which component families must exist before screen work starts.

**Least-friction recommendation:**
Lock only the core reusable set:
- App Shell
- Drawer
- Top Action Button
- Hero Block
- Action Chip
- Composer
- Icon Button
- Primary Button
- Nav Item
- Profile Row
- Glass Card
- Message Bubble
- Screen Header
- Section Label
- Toggle Row

**Why this is the lowest-friction choice:**
- enough structure to keep UI coherent
- small enough to avoid overengineering
- maps directly to the references you already shared

**What can stay unlocked for now:**
- charts
- advanced context cards
- diagnostics panels
- attachment components

---

### 4. Exact token naming scheme
**Why this must be locked:**
If token names are undefined, Codex may invent chaotic style constants or inline values.

**What needs to be decided:**
How the styling system refers to colors, states, glow types, surfaces, and text roles.

**Least-friction recommendation:**
Use a small semantic token family:
- `surface.base`
- `surface.glass`
- `surface.elevated`
- `border.idle`
- `border.active`
- `glow.teal`
- `glow.spectral`
- `text.primary`
- `text.secondary`
- `state.idle`
- `state.active`
- `state.focused`
- `state.disabled`

Optional naming if the repo prefers flat names:
- `surfaceBase`
- `surfaceGlass`
- `borderIdle`
- `glowSpectral`

**Why this is the lowest-friction choice:**
- semantic names survive redesigns better than literal color names
- aligns with your teal-core vs spectral rule
- prevents random hardcoded style sprawl

**What can stay unlocked for now:**
- exact blur values
- exact shadow spread values
- exact spacing scale labels

---

### 5. Exact manual setup script
**Why this is not lockable yet:**
This depends on the actual repo contents.

**What needs to happen first:**
Codex must inspect:
- `package.json`
- lockfile
- workspace config
- framework config
- README

**Least-friction recommendation:**
Do **not** invent a setup script before inspection.

**Why this is the lowest-friction choice:**
Any guessed script could be wrong and create fake confidence.

**What can be locked now instead:**
The rule for how setup will be chosen:
1. inspect package manager
2. inspect scripts
3. inspect framework
4. choose the smallest working setup path
5. only then write the manual script if needed

---

### 6. Exact implementation sequence inside the repo
**Why this must be mostly locked:**
If the order is vague, Codex may start drawing screens before stabilizing shared primitives.

**Least-friction recommendation:**
Use this implementation order:
1. inspect repo structure
2. identify framework, routing, styling, and state patterns
3. confirm package manager and run setup
4. identify existing reusable UI primitives
5. create or adapt token system
6. create shared component family
7. implement shell + drawer
8. implement Home screen
9. implement Temporary Chat screen
10. implement remaining top-level screens
11. validate build / lint / typecheck
12. polish state consistency

**Why this is the lowest-friction choice:**
- prevents one-off screen styling
- keeps the app coherent early
- reduces rework
- matches how high-fidelity UI should actually be built

**What can stay unlocked for now:**
- exact order between Library, Models, and Settings
- whether Chats page comes before shell or after existing routes inspection

---

### 7. Whether any env vars are required after inspection
**Why this is not lockable yet:**
This is repo-dependent.

**Least-friction recommendation:**
Lock the policy, not the values:
- do not add env vars before inspection
- inspect `.env.example`, README, framework config, and code references
- only add env vars if build or startup actually requires them
- prefer harmless public development defaults first
- do not add secrets unless truly required

**Why this is the lowest-friction choice:**
- avoids fake setup complexity
- avoids breaking local-first assumptions
- keeps the environment clean

---

## What should now be locked before any Codex prompt

### Lock now
- final v1 screen inventory
- final nav labels
- reusable core component inventory
- semantic token naming approach
- implementation order
- setup/env decision policy
- reference authority rules

### Do not lock yet
- exact package-manager commands before repo inspection
- exact env vars before repo inspection
- final microcopy
- animation details
- spacing scale details
- low-level design token values

---

## Recommended locked decisions

### Reference authority
- Layout references define only pages, layout, structure, and flow.
- Component references define styling, glow, glass, border, and active/inactive visual behavior.
- Layout references do not control theme.
- Component references do not invent extra screens.

### State semantics
- teal-core = idle / inactive / unselected
- spectral = active / focused / selected / engaged

### V1 screens
- Home
- Temporary Chat
- Chats
- Library
- Models
- Settings
- Drawer / Navigation

### Final labels
- Home
- Chats
- Library
- Models
- Settings
- Temporary Chat

### Core reusable components
- App Shell
- Drawer
- Screen Header
- Hero Block
- Action Chip
- Composer
- Icon Button
- Primary Button
- Nav Item
- Profile Row
- Glass Card
- Message Bubble
- Toggle Row
- Section Label

### Token approach
Use semantic tokens, not literal color names.

### Setup policy
- inspect first
- choose script second
- only add env vars if proven necessary

### Build order
- inspect repo
- confirm toolchain
- set up tokens
- build shared components
- build shell
- build screens
- validate

---

## Recommended tool for visual context tracking
Use **Canvas** for this scope-lock document and future UI decision logs.

Why:
- it keeps one living document visible beside the chat
- easier to update than re-pasting long prompt text
- good for tracking locked vs unlocked decisions
- reduces conversational drift
- gives you a stable review surface before anything is sent to Codex

Recommended companion documents later:
- `ai.mine reference authority map`
- `ai.mine screen inventory`
- `ai.mine component/state matrix`
- `ai.mine Codex prompt pack`

---

## Approval checklist
Before sending any prompt to Codex, confirm these are all true:

- [ ] The screen list is final enough for v1
- [ ] The nav labels are final enough for v1
- [ ] The reusable component list is final enough for v1
- [ ] The visual state semantics are final
- [ ] The reference authority rules are final
- [ ] The implementation order is accepted
- [ ] The setup/env policy is accepted
- [ ] No prompt still depends on hidden conversation context
