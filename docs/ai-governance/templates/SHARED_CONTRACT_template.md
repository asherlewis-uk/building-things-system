
# SHARED_CONTRACT.template.md

---

## Template Header

This is the **shared contract definition template** for the `building-things-system` monorepo. It defines the protocol boundary between `apps/desktop` (desktop workspace shell) and `apps/mobile` (native app serving as both detachable remote chat surface and personal AI companion). This file is **not an implementation file**. It is the authoritative reference for cross-system identifiers, session, presence, device, message, handoff, and artifact reference semantics. **No values or structures here are live configuration; all are canonical placeholders pending future implementation decisions.**

---

## Contract Status

**Current status:**  

The shared contract is **not yet implemented as a package**. The placeholder future location is `packages/shared-contract` (not yet created, not yet canonical). Until the shared package exists, the definitions below serve as the single specification that both `apps/desktop` and `apps/mobile` must align to. **No cross-system semantic may be implemented independently or unilaterally in either app.** All contract field definitions in use must originate and be maintained here.

---

## Identity Fields

**workspace_id**

* *Type*: `string`

* *Description*: Globally unique identifier, scoped to the workspace context. Mandatory for all cross-surface interactions.

* *Placeholder fields*:

  * `workspace_id: string`

**device_id**

* *Type*: `string`

* *Description*: Identifier for a registered device (desktop or mobile), used to track which surface or device is active, and for device-specific session management.

* *Placeholder fields*:

  * `device_id: string`

*Format, generation strategy, and storage location for* `workspace_id` *and* `device_id` *are **TBD (To Be Determined)**.*

---

## Session and Message Fields

**session_id**

* *Type*: `string`

* *Description*: Immutable string identifier for a conversation or execution thread. If a session is shared across desktop and mobile, its `session_id` must be the same between surfaces.

* *Placeholder fields*:

  * `session_id: string`

**message_id**

* *Type*: `string`

* *Description*: Identifier for a single message within a session. Required for:

  * Timeline ordering

  * Deduplication across surfaces

* *Placeholder fields*:

  * `message_id: string`

*Generation, synchronization, and conflict resolution strategies for these identifiers are **TBD**.*

---

## Surface and Detach State Fields

**detach_state**

* *Type*: `enum` or `object`

* *Description*: Indicates whether a mobile device is currently attached to a desktop session or operating in standalone, personal companion mode.

* *Example Placeholder*:  

  `[ "attached", "detached" ]` or richer state object (exact structure TBD)

**active_surface**

* *Type*: `string`

* *Description*: Indicates which surface—desktop, mobile, or none—retains primary session authority at any time.

* *Placeholder values*:  

  `"desktop" | "mobile" | "none"`

*State machine logic, transition rules, and ownership semantics are **TBD** and will be formalized before implementation.*

---

## Presence State

**presence_state**

* *Description*: Specifies the connection status of any surface (desktop or mobile) for a session.

* *Tracks*:

  * Surfaces currently connected

  * Last seen timestamps

  * Whether the surface is active, idle, or disconnected

*Transport and serialization: **TBD**.*

---

## Handoff Payload

**handoff_payload**

* *Description*: Carries required data when session focus, context, or control transitions between surfaces (e.g., desktop → mobile or vice versa). Payload should allow the receiving surface to resume without loss.

*Deep Link URI Spec*: The `deep_link_uri` must conform to the `aimine://` scheme, as declared in `apps/mobile/app.json` (implementation details **TBD**).\*

---

## Artifact Reference Payload

**artifact_reference_payload**

* *Description*: Used when one surface references an artifact created on another surface (e.g., desktop creates, mobile renders reference).

*Mobile is required to resolve and render artifact references **without relying on desktop file system access**.*

---

## Contract Change Rules

1. **Every field in this file is a cross-system contract.**  

  Any change to field definitions (including placeholder structural changes) is a cross-app change.

2. **Both apps must review all changes.**  

  Changes require review and sign-off by product leads or codeowners from both `apps/desktop` and `apps/mobile` prior to commit.

3. **No single-app implementation before contract change.**  

  It is prohibited for a single app to implement (in code or config) a new contract field unless and until it is added as a placeholder in this template.

4. **Canonical “source of truth.”**  

  This file, until replaced by a true package at the placeholder future location `packages/shared-contract` (not yet created, not yet canonical), is the only source where contract fields may be defined for cross-app use.

5. **Contract update process:**

  * Propose changes via PR against this file.

  * Secure approval from both desktop and mobile reviewers.

  * Implementation may only proceed after merge.

---