# Native Role

AI-UI-100 is the native mobile authority in a two-repository product system.

## System split

- Building.Things owns the desktop workspace shell.
- AI-UI-100 owns the native iOS and Android client.
- A shared protocol layer connects them.

## Non-negotiable rule

AI-UI-100 is not a responsive version of the desktop IDE.
It is a separate native product with separate UI architecture.

## This repository owns

- native app UX
- mobile-first chat participation
- deep-link resume and handoff handling
- native navigation and keyboard behavior
- reconnect and phone-first session flows
- personal AI companion behavior
- detached remote UI behavior

## This repository does not own

- desktop panel layout
- terminal UI
- inspector UI
- desktop sidebar assumptions
- desktop shell orchestration
