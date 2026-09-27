# Libreta — Product Requirements Document (PRD v2)

**Tagline:** Your business, in your pocket.  
**Platform:** React Native + Expo  
**Backend:** Supabase  
**Market:** Nigeria  
**Status:** MVP  
**Primary validation group:** 5 real small-business users  

---

## 0. Naming Rationale

**Name:** Libreta (Spanish, "notebook" — pronounced *"lee-BREH-tah"*)

- Directly names the core metaphor of the product: a notebook, not an accounting system. This keeps the mental model honest to the design principle "simple before comprehensive."
- Short, easy to say and text in Nigerian English or Pidgin, no awkward transliteration.
- Loanword-derived rather than deep/obscure — matches existing naming patterns (Pasar, Axis, Trova, Hermeneia): short, meaningful root, not cute or acronym-based.
- Reads as fintech-credible without sounding foreign or intimidating to a market-stall vendor.
- **Why not Carnet (v1 pick):** A web check surfaced two real problems. First, *El Carnet* is a live iOS app in the Business category with an almost identical pitch — "transforms your traditional paper ledger into a smart app," with debt tracking as a headline feature. Small app, but a direct name-and-concept collision. Second, "carnet" has a dominant unrelated meaning in exactly this market: a *Carnet de Passage* is the customs document needed to drive a vehicle across West African borders, and Nigeria specifically shows up constantly in that context. Anyone searching "carnet Nigeria" today hits vehicle-customs forum threads, not a fintech app — a real SEO/discoverability tax for a Nigeria-first product.
- A search pass on Libreta turned up no competing app, product, or dominant unrelated meaning.
- *Caveat:* This was web-search due diligence, not a formal trademark or CAC name-availability search. Run Libreta through Nigeria's CAC name search and a basic TMView/trademark check, and confirm domain (`libreta.ng`) and social handle availability, before committing.

---

## 1. Product Overview

Libreta is a simple digital business book for Nigerian petty traders and small-business owners. It replaces the paper notebook, not the accountant.

It helps a vendor record:
- What they sell
- What customers pay
- What customers still owe
- Business expenses
- Daily business activity

**Core mental model:** `Sale → Payment → Balance`

A customer buys something, pays fully or partially, and settles the remaining balance later.

| Transaction | Amount |
| :--- | :--- |
| Sale | ₦15,000 |
| Paid | ₦10,000 |
| Outstanding | ₦5,000 |
| Later payment | ₦3,000 |
| Remaining balance | ₦2,000 |

---

## 2. Problem Statement

Small businesses currently manage information across paper notebooks, memory, calculators, WhatsApp, POS notifications, bank notifications, receipts, and separate expense notes. This makes it hard to quickly answer: *"What happened in my business today?"*

A vendor opening Libreta should immediately understand: how much they sold, how much customers paid, how much remains outstanding, how much they spent, and which customers owe them.

---

## 3. Product Vision

Move a vendor from:
> *"I think I made money today."*

to:
> *"Here is what I sold. Here is what I collected. Here is what people owe me. Here is what I spent. Here is what happened to my business today."*

---

## 4. Target Users

**Primary user:** Nigerian petty traders and small-business owners who:
- Operate a physical shop, kiosk, stall, market stand, or home business
- May sell through WhatsApp
- Usually operate alone or with 1–2 helpers
- Currently use notebooks, calculators, or memory
- Sometimes sell on credit
- Need simple daily visibility
- May have inconsistent internet access

**Example businesses:** provision shops, mini supermarkets, fashion, shoes, cosmetics, foodstuff, bakeries/snacks, phone/accessories, household goods, electronics, market traders, WhatsApp sellers, home businesses.

**Important segment nuance:** Not every vendor formally records sales — some only want to track who owes them. The product must not force a full sales-recording workflow on this segment. See §8.16, *Debt-Only Mode*.

---

## 5. Jobs To Be Done (JTBD)

- **Primary JTBD:** When I finish selling for the day, I want to quickly know what I sold, what I collected, what people owe me, and what I spent, so I know what happened to my business.
- **Supporting JTBD 1:** When a customer buys on credit, I want to record the unpaid amount so I don't forget.
- **Supporting JTBD 2:** When a customer pays later, I want to record the payment against what they owe.
- **Supporting JTBD 3:** When I need to check a customer's debt, I want to see their balance and transaction history immediately.
- **Supporting JTBD 4:** When I spend money on the business, I want to record it so I can understand my daily business activity.
- **Supporting JTBD 5:** When I only care about who owes me — and don't want to log every sale — I want a lighter way to just track debts.

---

## 6. Product Goals

### MVP Goals
1. Replace basic sales/debt notebooks for early users.
2. Make recording a sale extremely fast.
3. Make outstanding customer balances obvious.
4. Separate sales from cash actually collected.
5. Give users a simple daily business summary.
6. Work reliably despite poor connectivity.
7. Validate the product with five real vendors.

### Non-Goals (Out of Scope)
Libreta will not initially attempt to become: full accounting software, an ERP, a POS system, a banking platform, a payment processor, a lending platform, a marketplace, a full inventory system, a payroll system, a tax platform, or an AI business advisor.

---

## 7. Product Principles

| Principle | Meaning |
| :--- | :--- |
| **Simple before comprehensive** | Every feature must justify its complexity. |
| **Record in seconds** | Recording a transaction should be faster than writing it in a notebook. |
| **Money must be immediately understandable** | The user should never have to interpret accounting terminology. |
| **Use familiar language** | Prefer *Sales*, *Paid*, *Owes*, *Expenses*, *Customers*. Avoid unnecessary accounting terms. |
| **Mobile first** | Designed around one-handed mobile usage. |
| **Offline-friendly** | A vendor never loses the ability to record a transaction because the network disappears. |
| **Don't overbuild** | The five-user test decides what comes next. |

---

## 8. MVP Feature Requirements (P0 — Must Have)

- **8.1 Authentication:** Phone number auth, OTP verification, persistent session, logout. Built on Supabase Auth.
- **8.2 Business Setup:** Owner name, business name, business type, phone number, currency (defaults to ₦ NGN). Option to choose Default vs. Debt-Only Mode.
- **8.3 Home Dashboard:** Answers "What happened today?"
  - Today's sales
  - Amount collected
  - Outstanding
  - Expenses
  - Net movement
  - Number of customers owing
  - Quick actions: Record Sale, Record Payment, Record Expense
  - Recent activity feed (latest transactions)
- **8.4 Record Sale (Core Interaction):**
  - Flow: `Customer (optional) → Item → Quantity → Price → Payment → Save`
  - Fields: customer (optional), item/product, quantity, unit price, total, amount paid, payment method, note (optional).
  - Derived states: *Paid* (Amount Paid = Sale Total), *Part-paid* (0 < Amount Paid < Sale Total), *Unpaid* (Amount Paid = 0).
  - *A walk-in cash customer must never require creating a customer profile.*
- **8.5 Customers:** Name, phone, notes. Profile shows total purchases, total paid, outstanding balance, and full sales/payment history.
- **8.6 Owes:** Dedicated view answering "Who owes me money?" — list of customers with outstanding balances and a running total. Selecting a customer shows full purchase/payment detail with dates and notes.
- **8.7 Record Payment:**
  - Flow: `Owes → Select Customer → Record Payment → Enter Amount → Select Method → Save`
  - Fields: amount, payment method (Cash, Transfer, POS, Other), date, note.
  - Business rule: Payment cannot exceed customer's outstanding balance.
- **8.8 Sales History:** List with date, customer/item, total, amount paid, outstanding, status. Filters: Today, Yesterday, This Week, This Month, Custom. Search by customer, product, or amount.
- **8.9 Expenses:**
  - Split into two categories:
    - **Stock / Restocking spend:** Money that becomes inventory (cost of goods).
    - **Running costs:** Transport, rent, electricity, data, packaging, staff wages, repairs, delivery, market fees, miscellaneous.
  - Fields: amount, category, spend_type (`stock` | `running_cost`), date, payment method, note.
- **8.10 Daily Summary:**
  - Distinguishes Sales from Money Collected:
    - Sales: ₦85,000
    - Collected: ₦70,000
    - New Credit: ₦15,000
    - Expenses: ₦12,000
    - Net Movement: ₦58,000
  - `Net Movement = Collected − Expenses` (presented as money movement, never as accounting profit).
- **8.11 Transaction Details:** Detail screen per sale: date/time, customer, items, quantity, total, amount paid, outstanding, payment history, notes. Actions: record payment, edit, delete (requires confirmation).
- **8.12 Search:** Lightweight global search across customers, sales, and expenses.
- **8.13 Offline Support:** Local SQLite queue synced to Supabase when connectivity returns.
- **8.14 Security:** Supabase Auth, Row Level Security (RLS), business-level data isolation.
- **8.15 Analytics:** Core telemetry events: `account_created`, `business_created`, `sale_created`, `credit_sale_created`, `payment_created`, `customer_created`, `expense_created`, `dashboard_viewed`, `owes_viewed`, `customer_viewed`, `sale_edited`, `sale_deleted`.
- **8.16 Debt-Only Mode:** Lightweight workflow for vendors who only want to track debt. Bypasses full itemized sale flow for a simple "Add Debt" interaction that populates the same Sale/Customer data model.

---

## 9. Navigation

**Primary Tabs:** `Home` · `Sales` · `Owes` · `Customers` · `More`  
*More* contains: Expenses, Products, Reports, Settings, Business Profile, Help.

---

## 10. Data Model

- **users:** `id`, `name`, `phone`, `created_at`
- **businesses:** `id`, `owner_id`, `name`, `business_type`, `currency`, `mode` (`full` | `debt_only`), `created_at`
- **customers:** `id`, `business_id`, `name`, `phone`, `notes`, `created_at`
- **sales:** `id`, `business_id`, `customer_id`, `total_amount`, `amount_paid`, `status` (`paid` | `part_paid` | `unpaid`), `date`, `note`, `created_at`
- **sale_items:** `id`, `sale_id`, `product_id`, `product_name_snapshot`, `quantity`, `unit_price`, `cost_price_snapshot`, `total`
- **payments:** `id`, `business_id`, `customer_id`, `sale_id`, `amount`, `method` (`cash` | `transfer` | `pos` | `other`), `date`, `note`, `created_at`
- **expenses:** `id`, `business_id`, `category`, `spend_type` (`stock` | `running_cost`), `amount`, `method`, `date`, `note`, `created_at`

---

## 11. Business Rules

1. `Sale Outstanding = Sale Total − Payments Allocated to Sale`
2. `Customer Balance = Outstanding Sales − Payments Received`
3. `Sale Status = Paid | Part-paid | Unpaid`
4. `Payment Validation: Payment ≤ Outstanding Balance`
5. `Sales ≠ Cash Collected`: Credit sales increase sales volume but do not represent cash in hand.

---

## 12. Five-User Validation Hypotheses

- **H1:** Small vendors want a digital replacement for basic business notebooks.
- **H2:** Outstanding customer balances are a meaningful problem.
- **H3:** Simple business visibility is more useful than formal accounting.
- **H4:** The strongest core workflow is Sales + Payments + Outstanding + Expenses.
- **H5:** Offline capability matters because connectivity cannot be assumed.
- **H6:** WhatsApp-based reminders and sharing could improve retention.
- **H7:** A meaningful share of vendors will activate through Debt-Only Mode rather than full sales recording.
