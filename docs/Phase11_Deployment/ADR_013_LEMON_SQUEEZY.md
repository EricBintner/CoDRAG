
## ADR-013: Lemon Squeezy as Merchant of Record & License Issuer

**Date:** 2026-02-02
**Status:** Accepted

### Context
We need a payment processing and license management solution for CoDRAG.
Requirements:
1.  **Global Tax Compliance:** Handling VAT/Sales Tax in 100+ countries is complex and high-liability for a small team.
2.  **License Key Generation:** Need to issue keys upon purchase.
3.  **Offline-First Architecture:** CoDRAG operates locally. We cannot require an internet connection for every app launch to validate the license.

### Decision
Use **Lemon Squeezy** as the Merchant of Record (MoR) and primary license issuer, integrated via an **Activation Exchange** pattern.

### Rationale
- **MoR Model:** Lemon Squeezy acts as the reseller, handling all tax calculation, collection, and remittance globally. This eliminates a massive operational burden compared to Stripe (where we are the merchant).
- **Built-in Licensing:** LS generates license keys automatically.
- **Activation Exchange:**
    - We use the LS key as a "proof of purchase" token.
    - The user exchanges this token once (online) for a CoDRAG-signed **offline license file** (Ed25519).
    - This bridges the gap between Lemon Squeezy's online-only validation and our offline-first requirement.

### Trade-offs
- **Higher Fee:** LS charges ~5% + 50¢ per transaction (vs Stripe's ~2.9% + 30¢). This is acceptable given the tax compliance value.
- **Payout Schedule:** Slower payouts than Stripe (usually bi-monthly).
- **Custom Activation Logic:** We must build a serverless function (`api.codrag.io`) to handle the exchange and signing, as we cannot embed our private signing key in the client app.

### Consequences
- **Finance:** We need a Lemon Squeezy account instead of Stripe.
- **Infrastructure:** Need a small serverless function for the exchange (Cloudflare Worker or Vercel).
- **Client:** The Tauri app needs a UI to input the LS key and store the returned signed payload.
