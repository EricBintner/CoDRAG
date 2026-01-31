# Windows Distribution

## Purpose
Document Windows distribution options and constraints for a Tauri app that bundles a Python sidecar.

## Two distribution tracks

### Track A: Direct distribution (MSI/EXE)
Use this for:
- MVP distribution
- enterprise pilots

#### Code signing and SmartScreen
Tauri highlights key UX differences between EV and OV code signing:
- EV certificate:
  - immediate SmartScreen reputation
- OV certificate:
  - warnings may still show until reputation is built

Reference:
- https://v2.tauri.app/distribute/sign/windows/

Tauri prerequisite note:
- You must use a Windows code signing certificate (SSL certificates do not work).

Reference:
- https://v2.tauri.app/distribute/sign/windows/

#### CI signing options
Tauri documents signing via:
- custom sign commands
- Azure Key Vault
- Azure Trusted Signing

Reference:
- https://v2.tauri.app/distribute/sign/windows/

### Track B: Microsoft Store distribution
Use this for:
- a public Store release

Tauri notes:
- You must enroll as a developer.
- Register the product as an EXE or MSI app.

Reference:
- https://v2.tauri.app/distribute/microsoft-store/

Important constraint:
- Tauri currently generates EXE and MSI installers.
- For Microsoft Store, you create a Store application that links to the unpacked app.
- The linked installer must be offline, handle auto-updates, and be code signed.

Reference:
- https://v2.tauri.app/distribute/microsoft-store/

## Python sidecar constraints on Windows

### Bundling the sidecar
Tauri supports bundling external binaries via `externalBin`.

Reference:
- https://v2.tauri.app/develop/sidecar/

### Defender/AV and false positives
Bundled Python executables and new binaries can trigger false positives.
Mitigation usually depends on:
- code signing
- reputation building
- clean release process

(Also noted as a Phase 08 risk: Windows AV false positives.)

## Suggested MVP path
- Start with direct distribution (signed installers).
- Treat Microsoft Store distribution as a follow-on, because it introduces additional packaging and update constraints.
