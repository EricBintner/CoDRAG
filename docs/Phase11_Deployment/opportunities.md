# Opportunities — Phase 11 (Deployment)

## Purpose
Capture deployment and IT-friendly opportunities that reduce friction and increase trust.

## Opportunities
- **Config safety posture**: avoid repo-committable configs that contain API keys; encourage per-user local secrets.
- **Enterprise-friendly diagnostics**: a single zip-able “support bundle” (logs, versions, config snapshot) that contains no sensitive code.
- **Resource controls**: provide safe defaults and knobs for batch size/concurrency to avoid hardware/provider edge cases.

## References
- ChunkHound issue #176 (batch size sensitivity)
- `LICENSING_IMPLEMENTATION.md` (offline posture)
