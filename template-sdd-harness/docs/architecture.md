# Architecture — What it means to "do a good job"

> This document defines the quality standard. Reviewing agents
> evaluate code against this file. If it's not here, it's not a requirement.

## Principles

1. **Clear layers.** The project has three layers and only three:
   - **Components & UI (`/src/components`)** — React views, layouts, and user interactions.
   - **Domain & Services (`/src/domain`)** — Pure business logic, TypeScript interfaces, and Microsoft-guided domain services (no React dependencies here).
   - **State & Storage (`/src/state` or `/src/services/api`)** — Persistence layer, local storage, or Core Code Apps API connectors.
     Do not introduce additional layers (external state managers, complex routers) until there is a concrete reason documented in `feature_list.json`.

2. **No arbitrary dependencies.** Only use `react`, `vite`, `typescript`, and the specific Code Apps ecosystem libraries approved in `package.json`. If a feature requires a new external npm package, it must be discussed first (status `blocked`).

3. **Explicit errors.** Async functions and domain services that can fail (e.g., entity not found, API rejection) throw strongly-typed errors or return explicit Error objects, they do not silently fail or return undefined.

4. **Immutable by default.** All domain state is immutable. Use TypeScript `readonly` modifiers for interfaces where appropriate. To modify state, always create new instances or use React's immutable setter patterns (e.g., spread operators `[...prev]`, `{...prev}`).

5. **Atomic state updates.** Frontend state updates must be atomic. Never trigger half-baked UI states. If an operation fails mid-way, rollback the local state to match the last verified backend/storage checkpoint.

## Data Flow

```
user  ─→  React Component (UI)
│
├─ triggers domain action via Domain Service / Hook
│
└─→  State / Core Code Apps API
│
└─→  Persistent Storage / Backend
```

## What NOT to do

- Do not inject side-effects or API calls directly inside UI components. Use Domain Services or Custom Hooks.
- Do not use global `any` types. Every piece of data passing through the domain must have a strict TypeScript definition.
- Do not read/write from local storage or trigger APIs inside intensive rendering loops. Load at startup/mount, manage in-memory state, and sync on specific user events or lifecycle checkpoints.
- Do not add direct `console.log()` statements for error tracking in production code. Use a centralized error-handling boundary or dedicated logger.
