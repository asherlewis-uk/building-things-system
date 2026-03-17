# ai.mine Reference Authority Map

## Purpose
This document prevents Codex from mixing visual references incorrectly.

The problem it solves is simple:
If multiple image sets exist and their authority is not explicitly defined, Codex may blend them together in ways that look plausible but are wrong.

This document defines:
- which reference group controls which type of decision
- what each group is allowed to influence
- what each group is not allowed to influence
- how conflicts are resolved

---

## Core rule
Not all references have equal authority.

For **ai.mine**, the references are split into two separate authority groups.

### Reference Group A = Layout and Flow References
These references define:
- page layout
- screen structure
- navigation pattern
- content placement
- spatial hierarchy
- flow between visible screens

### Reference Group B = Component and Visual State References
These references define:
- component styling language
- active vs inactive state behavior
- glow behavior
- border treatment
- glass / frost surface treatment
- visual energy model
- component visual hierarchy

---

## Authority rule summary

### Group A controls
- what screens exist in the shown reference set
- rough composition of each screen
- where major UI regions live
- where controls are placed
- page-level spacing intent
- shell structure and visible flow

### Group A does not control
- color palette
- glow logic
- border style language
- active/inactive component treatment
- final component material language
- final glass or bloom behavior
- final state-color semantics

### Group B controls
- visual design language of components
- inactive/default visual state
- active/focused/selected visual state
- glow spread and intensity intent
- border luminosity treatment
- dark-glass material language
- how components feel when idle vs energized

### Group B does not control
- page inventory
- navigation architecture
- screen list
- large-scale screen composition if it contradicts Group A
- invention of extra pages not implied by the screen map

---

## Non-negotiable interpretation rules

### Rule 1: Layout comes from Group A only
If a screen's structure, placement, or flow is in question, Group A is the source of truth.

Codex must not rearrange the UI around the visual styling references from Group B.

### Rule 2: Component styling comes from Group B only
If component shape, glow, border, active/inactive energy, or material language is in question, Group B is the source of truth.

Codex must not derive colors or component state language from Group A.

### Rule 3: Group A cannot override Group B on theme
Even if Group A contains colors or styling in the screenshots, those visuals are ignored for theme and component styling decisions.

Those images are layout references only.

### Rule 4: Group B cannot invent new screens
Even if Group B suggests a rich UI style, it cannot be used to justify extra screens, extra routes, or major navigation changes.

### Rule 5: When in doubt, preserve separation
If a decision seems to belong partly to both groups, Codex must separate the question into:
- structure question -> Group A
- component styling/state question -> Group B

This prevents blended guessing.

---

## Current known reference interpretation

### Group A currently represents
The shown layout/flow references indicate these screen patterns:
- Home / landing entry
- Temporary Chat
- Left-side Drawer / Navigation

These references are currently used to derive:
- page skeletons
- major content zones
- relative placement of controls
- rough flow between main visible screens

### Group B currently represents
The shown component/state references indicate:
- dark luminous glass component family
- teal-core inactive state
- spectral active state
- soft bloom outside component bounds
- luminous border logic
- restrained premium dark technical aesthetic

These references are currently used to derive:
- buttons
- chips
- cards
- inputs
- message bubbles
- nav item active treatment
- toggles and interactive state behavior

---

## Locked state semantics from Group B

These meanings are fixed unless explicitly changed later.

### teal-core
Represents:
- idle
- inactive
- dormant
- unselected
- default state

### spectral
Represents:
- active
- selected
- focused
- engaged
- emphasized state

### Important semantic rule
Spectral state must be meaningful and selective.

It is not a global rainbow theme.
It is a state signal.

That means:
- most of the UI remains subdued
- active emphasis appears only where interaction, selection, or focus is happening

---

## Conflict resolution rules

If Codex encounters a conflict, use this order.

### Conflict type 1: layout vs styling
- layout question -> Group A wins
- styling question -> Group B wins

### Conflict type 2: Group A screenshot visually contains a theme
Ignore it.
Group A is not allowed to define theme, glow, or component styling.

### Conflict type 3: Group B implies a richer component system than shown in Group A
Allowed only at the component level.
Not allowed at the screen architecture level.

### Conflict type 4: missing detail in one group
If a detail is missing:
- infer only within that group's authority
- do not borrow authority from the other group to fill the gap incorrectly
- prefer the simplest grounded interpretation

Example:
- If Group A does not fully show a card style, use Group B.
- If Group B does not show the full screen layout, use Group A.

---

## Examples to make this foolproof

### Example 1: top action button placement
Question: Where should the top action button sit?

Answer:
- placement comes from Group A
- its visual styling comes from Group B

### Example 2: active nav item treatment
Question: How should the selected navigation item look?

Answer:
- the existence and location of the nav item come from Group A
- the glow, border, and active treatment come from Group B

### Example 3: composer structure vs composer styling
Question: What should the input area contain, and how should it look?

Answer:
- structure and placement come from Group A
- material, glow, and active/focused state language come from Group B

### Example 4: screenshot in Group A shows colors
Question: Should those colors influence the final UI theme?

Answer:
No.
Group A is layout-only authority.

### Example 5: Group B suggests a richer card treatment than the layout mockups
Question: Can the final cards look more like Group B?

Answer:
Yes, at the component level.
But this does not justify changing the page map, adding new screens, or rearchitecting flow.

---

## Portable prompt rule
Any prompt sent into Codex must restate this separation explicitly.

No prompt may rely on vague shorthand like:
- “use the first batch for layout”
- “use the second batch for style”

Instead, the prompt must define the authority directly inside itself.

Reason:
Fresh Codex environments do not know prior conversation shorthand unless that meaning is restated.

---

## Locked summary
For **ai.mine**:
- layout and flow references control structure, composition, and page flow
- component/state references control visual language, materials, glow, and activation behavior
- teal-core means idle/inactive/default
- spectral means active/focused/selected
- Group A cannot define theme
- Group B cannot invent screens

---

## Approval checklist
Before sending any visual prompt to Codex, confirm these are all true:

- [ ] Group A is treated as layout/flow authority only
- [ ] Group B is treated as component/state authority only
- [ ] teal-core is the idle/default state
- [ ] spectral is the active/focused/selected state
- [ ] no prompt depends on prior conversation shorthand
- [ ] no prompt allows Group A to override theme
- [ ] no prompt allows Group B to invent screens
