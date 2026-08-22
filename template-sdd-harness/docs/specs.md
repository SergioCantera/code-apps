# Spec Driven Development (SDD)

> This project follows a Kiro-style flow: requirements → design → tasks → code.
> The code is not written until the spec is approved by a human.

## Structure

Each new feature (`"sdd": true` in `feature_list.json`) has a dedicated folder
as soon as it leaves `pending`:

```
specs/<feature-name>/
├── requirements.md   # WHAT is needed (EARS notation)
├── design.md         # HOW it will be built (technical decisions)
└── tasks.md          # CONCRETE STEPS to implement
```

The `feature-name` matches the `name` field in `feature_list.json`.

## Feature States

| State         | Meaning                                                    |
| ------------- | ---------------------------------------------------------- |
| `pending`     | No spec. The `spec_author` is the first to act.            |
| `spec_ready`  | Spec drafted. Waiting for human approval. NO code changes. |
| `in_progress` | Spec approved. `implementer` working.                      |
| `done`        | Green code, `reviewer` approved, session closed.           |
| `blocked`     | Stuck. Reason in `progress/current.md`.                    |

## Human Approval Gate

The automatic flow stops **once**: when the `spec_author` finishes
their three files, marks the feature as `spec_ready` and stops. The human
reads `specs/<feature>/` and says "approved" (or requests changes).

Only then does the `leader` transition `spec_ready → in_progress` and launch
the `implementer`.

```
pending → [spec_author] → spec_ready → ⏸ HUMANO → in_progress → [implementer → reviewer] → done
```

## requirements.md — strict EARS

Requirements are written in **EARS** (Easy Approach to Requirements
Syntax). Each requirement is a numbered paragraph following one of these five
patterns:

| Pattern        | Template                                               |
| -------------- | ------------------------------------------------------ |
| **Ubiquitous** | `The system SHALL <action>.`                           |
| **Event**      | `WHEN <trigger>, the system SHALL <action>.`           |
| **State**      | `WHILE <state>, the system SHALL <action>.`            |
| **Optional**   | `WHERE <optional feature>, the system SHALL <action>.` |
| **Unwanted**   | `IF <unwanted event> THEN the system SHALL <action>.`  |

Hard rules:

- Each requirement has a stable id: `R1`, `R2`, ...
- Each requirement SHALL be verifiable by at least one concrete test (UI, Hook, or Domain logic).
- Do not mix multiple `SHALL` in the same requirement. If there is more than one, split.
- Do not use weak verbs ("could", "may", "supports"). Only `SHALL` / `SHALL NOT`.

Example:

```markdown
## R1

WHEN the user clicks the "Recent Notes" button, the system SHALL
render up to 5 list items ordered by `createdAt` descending.

## R2

IF the total notes count is 0 THEN the system SHALL
render an alert component with the text "No notes found".
```

## design.md — technical decisions

Capture **before** touching code:

- Which React components, custom hooks, or domain services are created/modified.
- What new TypeScript interfaces, types, or component props appear.
- How data flows (state management updates, API/Domain layer interaction).
- Which alternative approach was discarded and why (at least one).

It is NOT first-principles engineering — rely on
`docs/architecture.md` and `docs/conventions.md`. The `design.md` documents the
points where your feature touches the boundary of those rules.

## tasks.md — executable checklist

Discrete steps in order, each with a checkbox. Each task references at least one `R<n>` it covers.

Example:

```markdown
- [ ] T1 — Create UI component `RecentNotesList.tsx` under `src/components`. Covers: R1, R2.
- [ ] T2 — Implement hook `useRecentNotes` to fetch and sort domain data. Covers: R1.
- [ ] T3 — Add integration test `RecentNotesList.test.tsx` verifying the 5 items limit. Covers: R1.
- [ ] T4 — Add test case covering the empty state scenario. Covers: R2.
```

The `implementer` marks `[x]` each task upon completion. The `reviewer`
rejects if any `[ ]` remains without documented justification.

## Traceability (hard rule)

- Each test in the test suite must be mappable to an `R<n>` in its spec.
- Each `R<n>` must have at least one concrete test.
- The `reviewer` explicitly checks this correspondence and rejects if missing.

The `implementer` documents the map in `progress/impl_<name>.md`:

```markdown
## Traceability

- R1 → `useRecentNotes.test.ts > should fetch up to 5 notes sorted by date`
- R2 → `RecentNotesList.test.tsx > should render alert when notes are empty`
```

## When SDD does NOT apply

Features with `"sdd": false` or without the `sdd` field (legacy 1–6) do NOT
have a spec. SDD only applies going forward.
