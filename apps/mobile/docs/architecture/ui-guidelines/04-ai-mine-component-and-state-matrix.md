# ai.mine Component and State Matrix

## Purpose
This document defines the reusable UI component family for **ai.mine** and the state behavior each component must support.

It exists to prevent Codex from:
- inventing one-off components
- mixing incompatible visual styles
- applying spectral activation too broadly
- leaving component states undefined
- making components behave differently across screens without reason

This is the final major lock document before prompts are written.

---

## Core logic
A non-coder-friendly rule:

If Codex does not know **which reusable pieces exist** and **what their states mean**, it will make those decisions on its own.

That usually causes three problems:
1. the UI starts looking inconsistent
2. state meaning becomes muddy
3. later screens quietly fork into different design systems

So we lock:
- which components are core
- what each component is responsible for
- which states each one must support
- when teal-core vs spectral is allowed

---

## Global state semantics
These meanings are fixed unless explicitly changed later.

### teal-core
Represents:
- idle
- inactive
- unselected
- default
- dormant but available

### spectral
Represents:
- active
- selected
- focused
- engaged
- emphasized

### Important global rule
Spectral is not decorative wallpaper.
It is a state signal.

That means:
- most components should live in subdued dark + teal-core most of the time
- spectral appears when a component is meaningfully active
- do not apply spectral to whole screens without a specific reason

---

## Core component family
These are the reusable UI pieces Codex should treat as primary.

1. App Shell
2. Navigation Drawer
3. Screen Header
4. Hero Block
5. Action Chip
6. Composer
7. Icon Button
8. Primary Button
9. Navigation Item
10. Profile Row
11. Glass Card
12. Message Bubble
13. Toggle Row
14. Section Label

This set is intentionally small.
It is enough to keep the UI coherent without turning the system into abstraction theater.

---

## Component matrix

### 1. App Shell
**Purpose:**
Provides the shared page container and spatial frame for the app.

**Used in:**
- Home
- Chats
- Library
- Models
- Settings
- Temporary Chat

**Required behavior:**
- keeps background/foundation consistent
- preserves global spacing rhythm
- hosts top-level content regions
- supports drawer relationship

**States:**
- default only

**Visual rule:**
The shell stays subdued.
It should not enter spectral mode just because a child component is active.

---

### 2. Navigation Drawer
**Purpose:**
Provides access to top-level destinations.

**Used in:**
- navigation/menu layer

**Required behavior:**
- contains profile/header area
- contains navigation items
- clearly shows current selection
- may contain bottom CTA

**States:**
- closed
- open

**Visual rule:**
The drawer itself remains mostly subdued.
Selection emphasis belongs to the active navigation item, not the entire drawer.

---

### 3. Screen Header
**Purpose:**
Provides title and optional supporting control area for a screen.

**Used in:**
- Chats
- Library
- Models
- Settings
- Temporary Chat

**States:**
- default
- emphasized only when a specific screen context requires it

**Visual rule:**
Headers should remain clean and stable.
Do not over-light the entire top area.

---

### 4. Hero Block
**Purpose:**
Provides the landing introduction on Home.

**Used in:**
- Home

**Required behavior:**
- contains greeting/title
- contains supporting line
- anchors the emotional tone of the entry screen

**States:**
- default only

**Visual rule:**
The hero is driven by typography and spacing, not by heavy activation effects.

---

### 5. Action Chip
**Purpose:**
Represents a compact selectable or tappable option.

**Used in:**
- Home
- possibly filters or quick actions elsewhere later

**States:**
- idle
- hovered/focused if platform supports it
- selected
- disabled

**Visual mapping:**
- idle -> teal-core
- selected -> spectral
- disabled -> reduced glow / reduced contrast

**Rule:**
Only selected chips should enter spectral.
Idle chips must still feel alive, but restrained.

---

### 6. Composer
**Purpose:**
Primary text entry and action surface.

**Used in:**
- Home
- Temporary Chat
- future persistent chat views

**Required behavior:**
- supports text entry
- supports send action
- supports utility/action affordances
- remains expandable for future context/model controls

**States:**
- idle
- focused
- ready-to-send
- sending
- disabled

**Visual mapping:**
- idle -> teal-core border/glow
- focused -> stronger emphasis, may begin spectral shift
- ready-to-send -> send control enters spectral
- sending -> active control emphasis, but not chaotic global glow
- disabled -> lowered intensity and clarity that still remains legible

**Rule:**
The composer is one of the main activation surfaces in the app.
It may become more energized than surrounding components, but must remain controlled and readable.

---

### 7. Icon Button
**Purpose:**
Compact utility control for actions like menu, back, add, or voice.

**Used in:**
- Home
- Temporary Chat
- navigation and headers

**States:**
- idle
- focused
- pressed
- active if toggle-like
- disabled

**Visual mapping:**
- idle -> teal-core
- pressed/active -> spectral if the action is meaningfully engaged
- disabled -> dimmed/subdued

**Rule:**
Do not treat every icon button as a primary action.
Only the currently relevant one should carry stronger emphasis.

---

### 8. Primary Button
**Purpose:**
Represents the main call-to-action in a region.

**Used in:**
- drawer CTA
- future action surfaces

**States:**
- idle
- focused
- pressed
- active
- disabled

**Visual mapping:**
- idle -> stronger than a passive control but not full spectral blast
- active/pressed -> spectral emphasis
- disabled -> reduced clarity with readable label

**Rule:**
A primary button can carry more visual energy than standard controls, but should still belong to the same glass-luminous system.

---

### 9. Navigation Item
**Purpose:**
Represents one route choice in the drawer.

**Used in:**
- Navigation Drawer

**States:**
- idle
- selected
- pressed

**Visual mapping:**
- idle -> subdued/teal-core
- selected -> clear spectral or elevated active treatment
- pressed -> temporary stronger emphasis

**Rule:**
This is one of the clearest uses of spectral state.
The selected navigation item should be unmistakable without making all other items look dead.

---

### 10. Profile Row
**Purpose:**
Displays the user/account header row inside the drawer.

**Used in:**
- Navigation Drawer

**States:**
- default
- pressed if interactive

**Visual rule:**
Should remain mostly stable and subdued.
This is informational structure, not a major activation target.

---

### 11. Glass Card
**Purpose:**
Reusable framed surface for grouped information.

**Used in:**
- Library
- Models
- Settings
- future grouped content areas

**States:**
- idle
- selected if tappable/selectable
- disabled if needed

**Visual mapping:**
- idle -> teal-core edge treatment with restrained bloom
- selected -> spectral/elevated active treatment
- disabled -> softened contrast and glow

**Rule:**
Cards should feel like the same family as chips, buttons, and composer, not like a separate design language.

---

### 12. Message Bubble
**Purpose:**
Displays conversation messages.

**Used in:**
- Temporary Chat
- future chat views

**Variants:**
- inbound
- outbound

**States:**
- default
- selected only if message interaction later requires it
- failed if message send state needs to be surfaced

**Visual mapping:**
- inbound -> darker, more restrained
- outbound -> slightly more energized, but still within the same glass system
- failed -> should communicate issue without breaking the design language

**Rule:**
Message bubbles should not become generic messaging-app blobs.
They must remain part of the ai.mine component family.

---

### 13. Toggle Row
**Purpose:**
Represents a labeled setting with an on/off control.

**Used in:**
- Settings
- possibly Models later

**States:**
- off
- on
- disabled

**Visual mapping:**
- off -> teal-core / subdued
- on -> spectral or clearly active emphasis
- disabled -> dimmed/subdued

**Rule:**
The toggle must feel native to the same luminous/glass system, not borrowed from a generic OS settings screen.

---

### 14. Section Label
**Purpose:**
Separates or titles grouped content regions.

**Used in:**
- all structured screens as needed

**States:**
- default only

**Visual rule:**
Section labels are structural and typographic.
They should not compete with active controls.

---

## State usage rules by importance

### Strongest allowed spectral use
Use spectral most clearly on:
- selected Navigation Item
- selected Action Chip
- active send control in Composer
- active Primary Button
- focused/engaged Composer state

### Moderate spectral use
Use spectral more carefully on:
- selected Glass Card
- active Toggle Row
- outbound message emphasis if appropriate

### Minimal or no spectral use
Keep mostly subdued:
- App Shell
- Navigation Drawer background
- Hero Block
- Section Label
- Profile Row
- most Screen Headers

---

## Cross-screen consistency rules

### Rule 1: one component family
All components must feel like they belong to one visual system.

### Rule 2: same state meaning everywhere
If spectral means selected for a Navigation Item, it should not mean “warning” or “random decoration” somewhere else.

### Rule 3: no isolated one-off styling
Do not create special styling for one screen unless the component behavior truly differs.

### Rule 4: active emphasis stays local
A single active control should not force its whole surrounding screen into spectral mode.

---

## What this prevents
This matrix prevents Codex from doing things like:
- making the Home chips one style and the Settings cards another style
- making the drawer selected item look unrelated to the rest of the app
- turning every active thing into full rainbow glow
- leaving disabled/focused/sending states undefined
- inventing extra primitives because no core list existed

---

## Decision table

| Component | Core purpose | Key states | Spectral allowed? |
|---|---|---|---|
| App Shell | Shared page frame | default | No |
| Navigation Drawer | Route access layer | open / closed | Minimal |
| Screen Header | Screen title area | default | Minimal |
| Hero Block | Home introduction | default | No |
| Action Chip | Compact option | idle / selected / disabled | Yes |
| Composer | Input/action surface | idle / focused / ready / sending / disabled | Yes |
| Icon Button | Utility action | idle / pressed / active / disabled | Yes, selectively |
| Primary Button | Main CTA | idle / active / disabled | Yes |
| Navigation Item | Route selector | idle / selected / pressed | Yes |
| Profile Row | Drawer user row | default / pressed | Minimal |
| Glass Card | Grouped content surface | idle / selected / disabled | Yes, selectively |
| Message Bubble | Conversation unit | inbound / outbound / failed | Limited |
| Toggle Row | On/off control row | off / on / disabled | Yes |
| Section Label | Structural labeling | default | No |

---

## Approval checklist
Before prompts are written, confirm these are all true:

- [ ] The core component family is final enough for v1
- [ ] The state meanings are final enough for v1
- [ ] teal-core is always idle/default/inactive
- [ ] spectral is always active/focused/selected
- [ ] spectral will be used selectively, not globally
- [ ] the composer is treated as a major activation surface
- [ ] selected nav items clearly receive active emphasis
- [ ] shells, headers, and structure surfaces remain mostly subdued
- [ ] no extra component families are required before repo inspection
