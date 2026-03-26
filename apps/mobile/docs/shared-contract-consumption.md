# Shared Contract Consumption

This document explains how AI-UI-100 should consume the shared system contract without inheriting desktop shell architecture.

## Core rule

AI-UI-100 consumes a shared protocol.
It does not consume desktop UI assumptions.

## Shared identifiers

AI-UI-100 should expect these concepts to remain stable:

- `workspace_id`
- `session_id`
- `message_id`
- `device_id`
- `active_surface`
- `detach_state`
- `presence_state`
- `handoff_token`
- `deep_link_path`
- `artifact_reference`

## Expected enum values

- `active_surface`: `desktop` | `ios` | `android`
- `detach_state`: `attached` | `detached_to_mobile` | `multi_surface`
- `presence_state`: `offline` | `idle` | `active`

## What AI-UI-100 should consume

- current identity bootstrap
- current workspace when needed
- session list or active session
- message timeline payloads
- send-message payloads
- detach and attach intent
- handoff token and deep-link payloads
- artifact references that are safe for mobile rendering

## What AI-UI-100 should not consume

- desktop panel composition state
- inspector selection state
- terminal rail state
- desktop-only layout metadata

## Contract discipline

When the shared protocol changes:

1. Building.Things documentation should be updated first.
2. AI-UI-100 should only adopt the documented contract.
3. Native UX may adapt locally, but shared identifiers and payload meanings must remain aligned.
