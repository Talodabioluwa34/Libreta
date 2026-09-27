# Contributing to Libreta 📒

Welcome to the **Libreta** development team! This guide establishes our mobile engineering standards, Git workflow, offline-first architectural rules, and pull request review expectations.

---

## 🌳 Git & Branching Strategy

We follow a modified **Mobile Git Flow** tailored for Expo and EAS release trains:

```
  main (production releases / app stores / internal track)
   ▲
   │ [PR after release validation]
   │
  develop (active integration & preview builds)
   ▲
   ├── feature/foundation-auth-setup
   ├── feature/core-transactions
   ├── feature/offline-sync-queue
   └── bugfix/partial-payment-overflow
```

### Branch Roles
1. **`main`**: Production code only. Protected. Direct pushes are disallowed. Commits come only via squash-and-merge PRs from release branches or `develop`.
2. **`develop`**: The primary working trunk for day-to-day integration. Nightly / staging Expo preview builds are triggered from here.
3. **`feature/<name>`**: Feature development branched off `develop`. Keep features scoped to PRD sections (e.g., `feature/debt-only-mode`).
4. **`bugfix/<name>`**: Fixes targeting `develop`.
5. **`hotfix/<name>`**: Critical urgent production fixes branched directly off `main` and merged back into both `main` and `develop`.
6. **`release/vX.Y.Z`**: Release preparation branch cut from `develop` for smoke testing and App Store/Play Store asset finalization.

### Branch Naming Conventions
- `feature/<short-description>` (e.g. `feature/record-sale-flow`)
- `bugfix/<issue-id>-<short-description>` (e.g. `bugfix/12-sync-retry-loop`)
- `chore/<short-description>` (e.g. `chore/upgrade-expo-sdk-51`)
- `docs/<short-description>` (e.g. `docs/update-prd-v2`)

---

## 💬 Commit Message Convention

We strictly enforce [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <short description in imperative present tense>

[optional body explaining motivation and context]

[optional footer(s), e.g. Closes #42]
```

### Approved Types
- `feat`: A new user-facing feature (e.g. `feat(sales): add debt-only mode for quick recording`)
- `fix`: A bug fix (e.g. `fix(payments): prevent payment greater than outstanding debt`)
- `perf`: Code change that improves performance (e.g. `perf(sqlite): add index for customer search`)
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `test`: Adding or correcting tests
- `chore`: Build tasks, config files, package upgrades
- `docs`: Documentation updates only

---

## ⚡ Core Mobile Architectural Principles

Every engineer working on Libreta must uphold these tenets:

1. **Offline-First by Design:**
   - Every mutation (sale, payment, customer, expense) MUST write to local SQLite immediately.
   - The user must never see a blocking network spinner for a primary recording action.
   - Sync to Supabase happens asynchronously via the persistent background queue.
2. **Simple Before Comprehensive:**
   - Avoid over-engineering. Never force a multi-step workflow when a single tap or screen suffices.
   - Walk-in cash sales must NEVER require customer profile creation.
3. **Strict Data Isolation:**
   - Every table references `business_id`.
   - Never bypass Row-Level Security (RLS). All queries must execute under the authenticated user's context.
4. **Large Touch Targets & High Contrast:**
   - Our primary users are Nigerian traders operating in vibrant, brightly lit outdoor markets with one-handed phone usage.
   - Touch targets must be at least 48x48dp.
   - Use high-contrast type and bold monetary figures.

---

## 🔍 Pull Request Process

1. Create a feature branch off `develop`:
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/my-new-feature
   ```
2. Commit changes following conventional commit syntax.
3. Ensure typecheck and linting pass locally:
   ```bash
   npm run lint
   npx tsc --noEmit
   ```
4. Push your branch and open a PR against `develop` using the provided Pull Request Template.
5. Provide a screen recording showing the feature in action, including offline behavior (airplane mode).
6. Obtain at least 1 approving code review before merging.
