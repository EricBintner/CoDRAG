# Finance and Legal Structure: Magnetic Anomaly LLC

## Purpose
This document outlines the operational financial structure for **Magnetic Anomaly LLC**, the umbrella entity for CoDRAG and future applications.

## 1. Corporate Structure
- **Entity Name:** Magnetic Anomaly LLC
- **Role:** Umbrella holding company.
- **Function:** Holds IP, manages banking, and receives all revenue.
- **Apps:**
  - CoDRAG (Developer Tool)
  - [Future Apps]

## 2. Banking Strategy
**Constraint:** Keep overhead low with a single centralized repository for funds.

- **Primary Account:** Single Business Checking Account (e.g., Mercury, Brex, or traditional bank).
- **Flow:** All revenue sources payout to this single IBAN/Account Number.
- **Accounting:** Use tags/labels in accounting software (e.g., Xero/Quickbooks) to attribute revenue to specific apps if needed, rather than separate bank accounts.

## 3. Revenue Channels & Implementation

### Channel A: Direct Sales (Web Licensing)
*Primary channel for CoDRAG Starter Passes and Pro Licenses.*

- **Platform:** **Lemon Squeezy** (Merchant of Record).
- **Setup:**
  - **Account:** One Lemon Squeezy store for "Magnetic Anomaly LLC".
  - **Tax:** Lemon Squeezy handles global VAT/Sales Tax collection and remittance automatically (Merchant of Record).
  - **Domain:** `payments.codrag.io` (or similar subdomain).
- **Checkout Flow:**
  1. User clicks "Buy Starter Pass" or "Buy Pro License" on landing page.
  2. Redirects to Lemon Squeezy Checkout (hosted).
  3. **Fulfillment:** Lemon Squeezy emails a License Key to the user.
  4. **Activation:** User enters key in CoDRAG App -> App calls `api.codrag.io` to exchange for signed offline license.

### Channel B: App Stores (Distribution)
*Secondary channel for discovery or specific platform compliance.*

- **Apple App Store (macOS):**
  - **Entity:** Magnetic Anomaly LLC (DUNS number required).
  - **Payout:** Monthly wire to Business Checking.
  - **Commission:** 15% (Small Business Program) or 30%.
- **Microsoft Store (Windows):**
  - **Entity:** Magnetic Anomaly LLC.
  - **Payout:** Monthly wire.

## 4. Operational Stack

| Function | Tool Recommendation | Notes |
| :--- | :--- | :--- |
| **Banking** | Mercury / Chase / SVB | Needs good API access for accounting. |
| **Payments** | Lemon Squeezy | Merchant of Record handles global tax liability. |
| **Accounting** | Xero / QuickBooks Online | Syncs with Stripe & Bank. |
| **Registered Agent** | [Provider Name] | Required for LLC compliance. |

## 5. Next Steps for Setup
1.  **Form LLC:** File Articles of Organization.
2.  **EIN:** Obtain from IRS.
3.  **Bank Account:** Open using EIN + Articles.
4.  **Lemon Squeezy Account:** Activate using Bank Account + EIN.
5.  **Apple Developer:** Enroll as Organization (requires DUNS number).
