# Libreta 📒🇳🇬

> **Your business, in your pocket.**  
> *A simple digital business book for Nigerian petty traders and small-business owners.*

---

## 🌟 Overview

**Libreta** (Spanish for *"notebook"*, pronounced *lee-BREH-tah*) replaces the paper notebook, not the accountant.

Small businesses in Nigeria typically juggle records across physical paper ledgers, calculators, WhatsApp chats, memory, POS notifications, and separate expense notes. Libreta provides a friction-free, mobile-first experience answering the single daily question:

> *"What happened in my business today?"*

```
Sale  ──▶  Payment  ──▶  Balance
```

---

## 💡 Key Features (MVP)

- **⚡ Record in Seconds:** Record cash or credit sales in seconds with zero friction. Walk-in cash customers never require creating a customer profile.
- **💰 Sales vs. Cash Collected:** Clear distinction between sales made and actual cash collected.
- **🤝 "Owes" Debt Tracking:** Dedicated view answering *"Who owes me money?"* with running balance and payment history.
- **🏷️ Debt-Only Mode:** Lightweight mode for vendors who don't log itemized sales and only want to track debtors.
- **📊 Real Spend Tracking:** Expenses separated into **Stock/Restocking spend** (cost of goods) vs. **Running costs** (fuel, transport, shop rent, data).
- **📶 Offline-First Engine:** Local SQLite storage with background queue that automatically syncs to Supabase when internet is available.
- **🔒 Enterprise-Grade Isolation:** Powered by Supabase PostgreSQL and Row-Level Security (RLS) guaranteeing total multi-tenant data isolation.

---

## 📱 Tech Stack

- **Frontend:** React Native, Expo, TypeScript, Expo Router
- **Backend / Auth / Database:** [Supabase](https://supabase.com) (PostgreSQL, Supabase Auth, Row-Level Security)
- **Offline Storage:** SQLite + Sync Queue
- **Design System:** Custom high-contrast, large touch-target design system built for one-handed mobile market usage

---

## 🏗️ Repository Structure

```tree
VendorBook/
├── docs/
│   └── PRD.md              # Product Requirements Document (PRD v2)
├── supabase/
│   └── schema.sql          # PostgreSQL schema, indexes & RLS policies
├── .gitignore              # Environment and build ignores
└── README.md               # Project documentation
```

---

## 🚀 Getting Started

### 1. Database Setup (Supabase)
1. Create a project on [Supabase](https://supabase.com).
2. Navigate to the **SQL Editor** in your Supabase dashboard.
3. Run the schema script located at [supabase/schema.sql](file:///c:/Users/HP/Documents/Talodabi/VendorBook/supabase/schema.sql).

### 2. Environment Configuration
Create a `.env` file in the root directory:
```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

---

## 📄 Documentation

For the full product requirements, user personas, validation hypotheses, and build phases, refer to:
- [Product Requirements Document (PRD v2)](file:///c:/Users/HP/Documents/Talodabi/VendorBook/docs/PRD.md)
