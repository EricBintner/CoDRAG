# Opportunities — Phase 08 (Tauri MVP)

## Purpose
Capture packaging + desktop UX opportunities that improve reliability and trust.

## Opportunities
- **First-class log/diagnostics surfacing**: expose per-project build logs and a “Copy diagnostics” action in-app.
- **Safe background behavior**: make it explicit when the daemon is running in the background; provide a “Quit backend” action.
- **Crash recovery polish**: if the sidecar dies mid-index, the UI should keep the last good snapshot usable and offer a one-click restart.
- **Port conflict and process ownership**: robust single-instance behavior and clear attribution when a port is occupied (CoDRAG vs other).
- **Offline-friendly UX**: ensure the app behaves predictably when no internet is available (BYOK provider checks must be non-blocking).

## References
- `docs/Phase07_Polish_Testing/README.md`
- `docs/Phase11_Deployment/README.md`
