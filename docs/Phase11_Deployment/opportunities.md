# Opportunities — Phase 11 (Deployment)

## Purpose
Capture deployment and IT-friendly opportunities that reduce friction and increase trust.

## Opportunities
- **Config safety posture**: avoid repo-committable configs that contain API keys; encourage per-user local secrets.
- **Enterprise-friendly diagnostics**: a single zip-able “support bundle” (logs, versions, config snapshot) that contains no sensitive code.
- **Resource controls**: provide safe defaults and knobs for batch size/concurrency to avoid hardware/provider edge cases.

## Opportunities (deployment controls)
- **Offline-first packaging posture**:
  - ensure the app can run fully offline (no mandatory internet calls)
  - provide an explicit “offline mode” indicator when network calls are disabled
- **Signed artifact trust UX**:
  - installers published with checksums and signing info
  - in-app “verify install integrity” (optional) that checks bundled versions
- **Upgrade safety UX**:
  - detect index format incompatibility (`format_version` mismatch)
  - surface a single recommended remediation: “Full rebuild”
- **Air-gapped friendly guidance**:
  - document what the app does and does not contact
  - provide a clean path to disable update checks and any telemetry (even if none exists)

## Opportunities (meaningful visualization)
- **Index footprint view**:
  - per-project index size
  - total disk usage
  - “largest projects” list (bounded)
- **Upgrade history timeline**:
  - app versions installed over time
  - index rebuild prompts triggered by upgrades

## Hazards
- **Installer trust failures**: unsigned builds, missing checksums, or poor upgrade stories erode trust immediately.
- **SmartScreen/notarization friction**: OS trust gates can block installs or background processes unless handled properly.
- **Secret handling foot-guns**: “shared configs” that accidentally include API keys become a security incident risk.
- **Air-gapped drift**: features that implicitly require internet (even for “optional” checks) make enterprise evaluation fail.
- **Upgrade-induced corruption**: format changes without a deterministic rebuild path can strand users.

## References
- ChunkHound issue #176 (batch size sensitivity)
- `LICENSING_IMPLEMENTATION.md` (offline posture)
- `docs/Phase11_Deployment/README.md`
- `docs/Phase08_Tauri_MVP/README.md`
- `docs/Phase12_Marketing-Documentation-Website/COPY_DECK.md`
