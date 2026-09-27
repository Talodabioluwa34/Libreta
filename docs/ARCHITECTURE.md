# Libreta — Technical Architecture & Engineering Blueprint

## 1. High-Level Architecture Overview

Libreta is architected as an **Offline-First Mobile System** tailored for developing markets where network connectivity is intermittent, slow, or expensive.

```
┌─────────────────────────────────────────────────────────────┐
│                 React Native (Expo + TypeScript)            │
│  ┌──────────────────────┐        ┌────────────────────────┐ │
│  │    UI Screens &      │        │  State & Store Layer   │ │
│  │    Expo Router       │◀──────▶│  (Zustand / TanStack)  │ │
│  └──────────┬───────────┘        └───────────┬────────────┘ │
└─────────────┼────────────────────────────────┼──────────────┘
              │ Direct Read/Write              │
              ▼                                ▼
┌─────────────────────────────────────────────────────────────┐
│                   Local Persistence Layer                   │
│  ┌──────────────────────┐        ┌────────────────────────┐ │
│  │   Expo SQLite DB     │◀───────┤   Pending Sync Queue   │ │
│  │   (Instant Local UI) │        │   (Persistent Queue)   │ │
│  └──────────────────────┘        └───────────┬────────────┘ │
└──────────────────────────────────────────────┼──────────────┘
                                               │
                                      Network Available?
                                        Yes    │    No
                                               │    (Keep queued)
                                               ▼
┌─────────────────────────────────────────────────────────────┐
│                      Cloud Backend                          │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                Supabase / PostgreSQL                   │ │
│  │  • Supabase Auth (Phone OTP + Sessions)                │ │
│  │  • Row-Level Security (RLS) Multi-Tenant Isolation     │ │
│  │  • PostgreSQL Realtime (Optional Future Sync)          │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Offline-First Sync Engine Specification

### The "Never Block the Vendor" Invariant
A vendor in an open market cannot wait for a network timeout while a customer is standing in front of them with cash or waiting to leave.
- **Rule 1:** Every user mutation (Sale, Payment, Expense, Customer creation) executes synchronously against the local SQLite database.
- **Rule 2:** The mutation payload is simultaneously written to `sync_queue` table in SQLite with `status = 'pending'`.
- **Rule 3:** The UI updates optimistically with immediate visual confirmation (haptic feedback + success badge).

### Sync Queue Table Schema (Local SQLite)
```sql
CREATE TABLE IF NOT EXISTS local_sync_queue (
  id TEXT PRIMARY KEY,
  table_name TEXT NOT NULL,         -- 'sales', 'payments', 'expenses', etc.
  operation TEXT NOT NULL,          -- 'INSERT', 'UPDATE', 'DELETE'
  payload TEXT NOT NULL,            -- JSON stringified row data
  created_at INTEGER NOT NULL,      -- Unix timestamp
  retry_count INTEGER DEFAULT 0,
  last_error TEXT,
  status TEXT DEFAULT 'pending'     -- 'pending', 'processing', 'failed'
);
```

### Sync Dispatcher Lifecycle
1. **Network Listener:** `NetInfo.addEventListener` detects connection restoration.
2. **Batch Processing:** Reads FIFO uncompleted mutations from `local_sync_queue`.
3. **Idempotent Upserts:** Mutations carry client-generated UUIDs (`id`). When uploaded to Supabase, they use `UPSERT` semantics to prevent duplicate records if a network drops mid-request.
4. **Queue Purge:** Upon successful HTTP 200 response from Supabase, the item is removed or marked `completed` in `local_sync_queue`.

---

## 3. Data Model & Transaction Logic

### Business Rules Implementation
1. **Sales Calculation:**
   $$\text{Sale Outstanding} = \text{Total Amount} - \sum \text{Allocated Payments}$$
2. **Customer Balance Calculation:**
   $$\text{Customer Balance} = \sum \text{Outstanding Sales} - \sum \text{Unallocated Payments}$$
3. **Daily Money Movement (Dashboard):**
   $$\text{Net Movement} = \text{Cash Collected} - \text{Total Expenses}$$
   *(Note: Never labelled as "Profit" to prevent confusing unpaid credit sales with liquid cash).*

### Spend Type Partitioning
Expenses include a required `spend_type` field:
- `stock`: Restocking inventory (Cost of Goods Sold).
- `running_cost`: Operational overhead (Shop rent, transport, market levy, data).
This unlocks P1 gross-margin reporting ($$\text{Sales} - \text{Stock Spend}$$) with zero future database migrations.

---

## 4. Multi-Tenant Security Model (Supabase RLS)

- Every record belongs to a `business_id`.
- The database enforces RLS at the PostgreSQL kernel level:
```sql
CREATE POLICY "Business owners manage sales" ON public.sales
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.businesses b
      WHERE b.id = sales.business_id AND b.owner_id = auth.uid()
    )
  );
```
- No client-side query can leak or tamper with another vendor's transaction ledger.

---

## 5. UI Component & Design Tokens

Designed around **market realities**:
- **Typography:** High legibility, distinct numerical tabular fonts for amounts.
- **Monetary Inputs:** Dedicated large numerical keypad with automatic thousand formatting (`₦15,000`).
- **Touch Targets:** Minimum 48x48dp interactive bounding boxes.
- **Color System:** High-contrast neutral backgrounds with vivid status indicators (Green: Paid, Orange: Part-paid, Red: Unpaid/Owed).
