# Building.Things Integration

This document defines how AI-UI-100 integrates with Building.Things without surrendering native product authority.

## Principle

Building.Things must become compatible with AI-UI-100.
AI-UI-100 must not be reshaped into a desktop-derived shell.

## Building.Things responsibilities

For healthy integration, Building.Things should expose a clean service boundary for:

- identity bootstrap
- workspace lookup
- session lookup
- timeline read
- message send
- detach and attach state
- handoff token generation
- presence read and update

## AI-UI-100 responsibilities

AI-UI-100 should focus on:

- native chat presentation
- session resumption and handoff
- personal companion behavior
- detached remote UI behavior
- mobile-native navigation and ergonomics

## Safe integration sequence

1. Building.Things documents and stabilizes the shared protocol.
2. Building.Things exposes mobile-safe service endpoints.
3. AI-UI-100 consumes those endpoints through native-friendly abstractions.
4. Native-only enhancements remain inside AI-UI-100.

## What not to do

- do not port desktop panel layout into native code
- do not mirror desktop route hierarchy inside the native app
- do not let native product goals be subordinated to desktop shell implementation details
