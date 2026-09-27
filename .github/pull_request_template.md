## 📋 Summary
<!-- What does this PR accomplish? Provide a brief description of the problem solved or feature added. -->

## 🎯 PRD & Issue Link
- Closes #[issue-number]
- PRD Section: <!-- e.g., §8.4 Record Sale, §8.16 Debt-Only Mode -->

## 📱 Type of Change
- [ ] 🚀 New feature (non-breaking change adding functionality)
- [ ] 🐛 Bug fix (non-breaking change fixing an issue)
- [ ] ⚡ Performance optimization
- [ ] 🔒 Security or data isolation update
- [ ] 🗄️ Database migration / Supabase schema update
- [ ] 📦 Dependency update or build tooling

## 🧪 Testing Checklist
### Device & Platform
- [ ] Android Physical Device / Emulator tested
- [ ] iOS Physical Device / Simulator tested (if applicable)

### Offline-First & Sync Validation
- [ ] Operation succeeds when device is completely offline (Airplane mode)
- [ ] Mutation is queued in local SQLite
- [ ] Data syncs to Supabase once connection restores
- [ ] No duplicate records created upon reconnection

### Edge Cases Checked
- [ ] Walk-in cash customer (no customer profile required)
- [ ] Partial payment calculation (`Sale Total - Payments Allocated = Outstanding`)
- [ ] Payment exceeding outstanding balance is rejected
- [ ] Currency display formatted properly (`₦` NGN with thousand separators)

## 📸 Screenshots / Screen Recordings
<!-- Attach video or screenshots showing UI state transitions, especially empty, loading, and error states -->

## ⚠️ Notes for Reviewers
<!-- Any specific architectural decisions, database alterations, or deployment steps? -->
