# ai.mine Screen and Structure Lock

## Purpose
This document resolves the highest-risk ambiguities before any Codex prompt is sent.

These are the decisions most likely to cause hallucination if left vague:
- screen list
- navigation structure
- labels
- what each screen is responsible for
- what is top-level vs secondary

---

## The core logic
A non-coder-friendly rule:

If Codex does not know **what screens exist**, **what they are called**, and **what each one is for**, it will fill the gaps itself.

That means the first thing to lock is not colors or buttons.
It is the **map of the app**.

So we want the smallest stable map that:
- fits the reference layouts
- gives every obvious destination a home
- avoids overbuilding
- leaves room for growth

---

## Recommended v1 screen map

### Top-level destinations
These are the main places the app can go.

1. **Home**
2. **Chats**
3. **Library**
4. **Models**
5. **Settings**

### Special route
6. **Temporary Chat**

### Structural container
7. **Drawer / Navigation**

---

## Why this is the lowest-friction screen map

### Home
Needed because the reference clearly shows a landing / entry experience, not just a list page.

### Chats
Needed because conversations must have a persistent home outside temporary chat.

### Library
Needed because reusable context, saved items, or future knowledge objects need somewhere to live.

### Models
Needed because model/provider control is part of the product and should not be buried as a random settings subsection.

### Settings
Needed because every app needs one stable place for preferences and system controls.

### Temporary Chat
Needed because the reference shows it explicitly, and because it has a distinct behavioral meaning: not stored.

### Drawer / Navigation
Needed because the reference shows it explicitly and because the app needs a stable shell structure.

---

## Why we are NOT adding more screens yet

We are not yet locking separate screens for:
- Favorites
- Profile
- Onboarding
- Diagnostics
- Provider detail
- Conversation detail
- Prompt presets
- Search

Reason:
Those may become real later, but they do not need to exist as first-class screens before the shell is built.

Lowest friction means:
- lock only what prevents hallucination now
- defer what can safely become sections, modals, sheets, or future routes later

---

## Final recommended labels
Use these exact labels consistently across UI, docs, and prompts:

- **Home**
- **Chats**
- **Library**
- **Models**
- **Settings**
- **Temporary Chat**
- **Menu** or **Navigation Drawer**

---

## Why these labels are safest

### Home
Plain, universal, impossible to misunderstand.

### Chats
Clearer than “Conversations” for fast scanning in mobile UI.

### Library
Broad enough to hold saved context and future reusable content without overcommitting to one implementation.

### Models
Cleaner and simpler than trying to split “Providers” and “Modes” too early.

### Settings
Standard and low-friction.

### Temporary Chat
Matches the behavioral concept already shown in the reference.

### Menu / Navigation Drawer
Describes structure, not a product destination.

---

## Top-level vs secondary structure

### Top-level
These should appear as primary app destinations:
- Home
- Chats
- Library
- Models
- Settings

### Special but not equal to all top-level destinations
- Temporary Chat

Reason:
Temporary Chat is important, but it is a mode of interaction, not the best foundation for the entire app map.

### Structural only
- Drawer / Navigation

Reason:
It is a container and access pattern, not a content destination.

---

## Screen responsibility map

### 1. Home
**Purpose:**
The starting screen for new interaction.

**Must contain:**
- greeting / hero area
- lightweight action chips or entry options
- primary composer
- access to menu
- access to temporary chat or session action

**Must NOT become:**
- a cluttered dashboard
- a giant settings surface
- a dumping ground for every feature

---

### 2. Chats
**Purpose:**
The home for stored conversation history.

**Must contain:**
- list of saved chats or threads
- access to open / resume a conversation
- clear distinction from temporary chat

**Must NOT become:**
- the same thing as Home
- a place where temporary chats quietly live

---

### 3. Library
**Purpose:**
The home for reusable saved content.

**Must contain eventually:**
- saved context items
- reusable content objects
- user-managed reference material

**Why this matters now:**
Even if it starts simple, it prevents Codex from shoving reusable content into random places later.

---

### 4. Models
**Purpose:**
The home for model and provider selection/control.

**Must contain eventually:**
- available models
- active model selection behavior
- provider-related controls or status

**Why this matters now:**
This avoids hiding core AI configuration inside Settings too early.

---

### 5. Settings
**Purpose:**
The home for app preferences and non-primary controls.

**Must contain eventually:**
- appearance/preferences
- local data controls
- advanced system options

**Must NOT become:**
- the main location for everything technical

---

### 6. Temporary Chat
**Purpose:**
A special conversation mode that is explicitly not stored.

**Must contain:**
- title or mode label
- clear non-persistent explanation
- conversation stream
- composer

**Must remain distinct from Chats because:**
If not, the product promise becomes muddy.

---

### 7. Drawer / Navigation
**Purpose:**
The structural access layer for primary destinations.

**Must contain:**
- profile/header area
- nav items
- selected state
- optional bottom CTA

**Must NOT become:**
- a junk drawer of every possible route

---

## The logic chain proving this structure

### Problem 1: Too few screens
If we only lock the three referenced layouts, Codex may invent where history, models, or saved content should live.

### Problem 2: Too many screens
If we lock every imaginable future page now, we create fake certainty and unnecessary implementation burden.

### Solution
Choose the smallest complete set that covers the obvious product needs and matches the visual references.

That is why the recommended stable v1 set is:
- Home
- Chats
- Library
- Models
- Settings
- Temporary Chat
- Drawer / Navigation

This is the narrowest screen map that still closes the biggest ambiguity holes.

---

## Decision table

| Area | Recommended lock | Why |
|---|---|---|
| Landing screen | Home | Matches reference and gives the app a calm starting point |
| Stored conversation area | Chats | Prevents history from being invented elsewhere |
| Reusable saved content area | Library | Gives context/saved content a future-proof home |
| Model/provider area | Models | Prevents technical controls from hiding in random places |
| App/system preferences | Settings | Standard and low-friction |
| Ephemeral session | Temporary Chat | Explicitly shown and behaviorally distinct |
| Main access pattern | Drawer / Navigation | Explicitly shown in reference |

---

## Approval questions
To lock this category, the following must all be true:

- [ ] We accept Home as the landing destination
- [ ] We accept Chats as the stored conversation destination
- [ ] We accept Library as the saved/reusable content destination
- [ ] We accept Models as the model/provider destination
- [ ] We accept Settings as the preferences destination
- [ ] We accept Temporary Chat as a special non-persistent route
- [ ] We accept Drawer / Navigation as structure, not content
- [ ] We do not need extra first-class screens before repo inspection

---

## If approved
The next document to lock should be:
**Component and State Matrix**

That is the next biggest place Codex could hallucinate if left fuzzy.
