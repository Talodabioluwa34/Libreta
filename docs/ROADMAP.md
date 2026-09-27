# Libreta — Engineering Roadmap & Milestones

This roadmap operationalizes the **Build Plan (§18)** and **Validation Plan (§19)** from the Libreta PRD v2.

---

## 🏁 Phase 0: Project Setup & Git Strategy (Completed ✅)
- [x] Initialized Git repository on `main` and remote origin on GitHub.
- [x] Standardized `.gitignore`, `README.md`, `docs/PRD.md`, and `docs/ARCHITECTURE.md`.
- [x] PostgreSQL database schema with Row-Level Security (`supabase/schema.sql`).
- [x] GitHub Actions CI workflows for linting, typechecking, and schema validation.
- [x] Mobile PR & Issue templates with offline reproducibility checklists.
- [x] Git Flow branch setup (`main`, `develop`, sprint feature branches).

---

## 🔨 Phase 1: Foundation Sprint (`feature/foundation-auth-setup`)
*Target: Establish clean Expo project structure, navigation, Supabase client, and onboarding.*
- [ ] Initialize Expo SDK with TypeScript and Expo Router.
- [ ] Setup Supabase client wrapper with secure token storage (`expo-secure-store`).
- [ ] Implement phone number authentication + OTP verification screen (§8.1).
- [ ] Build Business Setup screen (§8.2) — Business name, owner name, currency (₦ default).
- [ ] Mode selector toggle: **Default Flow** vs. **Debt-Only Mode** (§8.16).
- [ ] Implement foundational UI design tokens (typography, colors, large touch buttons, amount input).

---

## ⚡ Phase 2: Core Transaction Loop (`feature/core-transaction-engine`)
*Target: Deliver the primary recording interactions in seconds.*
- [ ] Implement `Record Sale` modal (§8.4):
  - Optional Customer selection (or fast walk-in skip).
  - Item name, quantity, unit price, auto-calculated total.
  - Amount paid & automatic status derivation (`Paid`, `Part-paid`, `Unpaid`).
- [ ] Build **Debt-Only Mode** entry flow (§8.16):
  - Streamlined "Add Debt" shortcut directly writing to unpaid ledger.
- [ ] Build **Owes View** (§8.6):
  - List of all customers with active debts & running total.
  - Customer Debt Detail screen with full transaction history.
- [ ] Implement `Record Payment` flow (§8.7):
  - Input amount, payment method (Cash, Transfer, POS, Other), notes.
  - Enforce business rule: Payment cannot exceed outstanding balance.
- [ ] Build Customer directory (§8.5) with search and balance cards.

---

## 📊 Phase 3: Business Visibility (`feature/business-visibility`)
*Target: Give the vendor immediate daily clarity.*
- [ ] Implement **Home Dashboard** (§8.3):
  - Today's Sales, Amount Collected, Outstanding, Expenses, Net Movement.
  - Count of customers owing money.
  - Quick action buttons: *Record Sale*, *Record Payment*, *Record Expense*.
  - Recent activity feed.
- [ ] Implement **Expenses Module** (§8.9):
  - Categorization with required `spend_type` (`stock` vs. `running_cost`).
- [ ] Daily Summary screen (§8.10) highlighting cash movement vs. credit.
- [ ] Sales History screen (§8.8) with date filters (Today, Yesterday, This Week, Month, Custom).
- [ ] Global search across sales, customers, and expenses (§8.12).

---

## 🛡️ Phase 4: Reliability & Offline Sync Engine (`feature/offline-sync-queue`)
*Target: Bulletproof operation in zero-connectivity environments.*
- [ ] Set up local SQLite database (`expo-sqlite`).
- [ ] Build local repository layer executing writes synchronously to SQLite.
- [ ] Implement background `sync_queue` table and dispatcher.
- [ ] Network detection via `@react-native-community/netinfo` with auto-sync retry.
- [ ] Visual sync status indicator (e.g., subtle cloud icon with pending item badge).
- [ ] Destructive action confirmations (sale deletion, customer removal).

---

## 👥 Phase 5: Pilot & Five-User Validation (`release/v1.0.0-pilot`)
*Target: Put working build into the hands of 5 real Nigerian petty traders.*
- [ ] Build standalone Android APK via EAS Internal Distribution.
- [ ] Instrument lightweight telemetry events (§8.15):
  - `sale_created`, `credit_sale_created`, `payment_created`, `expense_created`, `owes_viewed`.
- [ ] Conduct in-person field onboarding with 5 target vendors:
  - 1 provision shop
  - 1 fashion/shoes vendor
  - 1 foodstuff / market trader
  - 1 WhatsApp social seller
  - 1 pure debt-tracker vendor (testing Hypothesis H7)
- [ ] Capture qualitative feedback and Day 3 / Day 7 retention data.
