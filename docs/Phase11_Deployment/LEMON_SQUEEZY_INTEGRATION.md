# Lemon Squeezy Integration Strategy

## Goal
Use Lemon Squeezy (LS) as the Merchant of Record (MoR) and subscription manager, while maintaining CoDRAG's **offline-first** architecture.

## The Problem
- **Lemon Squeezy Native Keys:** Require online API calls to validate (`POST /v1/licenses/activate`). This breaks the "air-gapped/offline" promise if used directly for every launch.
- **Offline Requirement:** CoDRAG needs a mathematically verifiable license file (Ed25519 signature) that works without internet.

## The Solution: "Activation Exchange"

We use Lemon Squeezy keys as **Exchange Tokens** to acquire the **Offline License**.

### Workflow

1.  **Purchase (Lemon Squeezy)**
    - User buys "Pro License" or "Starter Pass".
    - Lemon Squeezy sends an email with a License Key (e.g., `AAAA-BBBB-CCCC-DDDD`).

2.  **Activation (Online, One-time)**
    - User opens CoDRAG > Settings > License.
    - Pastes the LS Key and clicks **"Activate"**.
    - **Request:** `POST https://api.codrag.io/v1/license/activate`
      ```json
      { "key": "AAAA-BBBB-CCCC-DDDD", "machine_id": "hw-12345" }
      ```
    - **Server-Side Logic:**
      1.  Call LS API `v1/licenses/activate`.
      2.  If valid, map LS product tiers to CoDRAG capabilities (e.g., "Pro" = unlimited repos).
      3.  Generate the **Signed Offline Payload** (Ed25519).
      4.  Return the payload.

3.  **Storage & Usage (Offline)**
    - CoDRAG saves the payload to `~/.local/share/codrag/license.sig`.
    - **Startup Check:** Daemon verifies the Ed25519 signature locally. No network request.
    - **Repo Limits:** Enforced locally based on the signed payload's tier.

4.  **Renewal / Expiry (Hybrid)**
    - **Starter Pass:** The signed offline license has a hard `expires_at` timestamp.
    - **Pro Updates:** The signed license has an `updates_until` timestamp.
    - **Refreshes:** If a user renews a subscription, they click **"Refresh License"** in the UI. This triggers the Activation Exchange again to fetch a new signed blob with updated dates.

## Implementation Details

### Lemon Squeezy Configuration
- **Products:**
  - **Starter Pass:** Type "Subscription" (cancels after 1 period? or non-renewing? TBD). Enable "License Keys".
  - **Pro License:** Type "One-time" (or Subscription with 1-year billing for updates). Enable "License Keys".
- **Webhooks:**
  - `subscription_created`, `subscription_updated`, `order_created`.
  - Used to track stats, but strictly speaking, the *Client-initiated Activation* (Step 2) is sufficient for the MVP.

### Serverless Function (`api.codrag.io`)
- Stack: Cloudflare Worker or Vercel Function (Python/JS).
- Secrets:
  - `LEMONSQUEEZY_API_KEY`
  - `CODRAG_PRIVATE_KEY` (Ed25519) - **Critical Security Asset**.

### Client Changes
- **UI:** "Activate License" modal input field.
- **Daemon:**
  - `verify_offline_license(path)` function.
  - `fetch_license(key)` function (proxies the activation request).

## Why this is better than Stripe
- **Tax Compliance:** LS handles VAT/Sales Tax globally.
- **Invoicing:** LS sends compliant invoices.
- **Simplicity:** We don't need a database of users/passwords. The "Key" is the identity.
