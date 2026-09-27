# AGENTS.md — Navigation Map for AI Agents

> This file is the **entry point** for any agent working in this
> repository. It is NOT a rulebook: it is a **map**. Read only what
> you need when you need it (progressive disclosure).

---

## 1. Before Starting (Mandatory)

1. Run `./init.sh` and ensure it finishes without errors. If it fails, **stop**
   and resolve the environment (Node.js, pnpm, or harness types) before touching any code.
2. Read `progress/current.md` to understand the state of the last session.
3. Read `feature_list.json`. Any new feature (`"sdd": true`) goes through
   **Spec Driven Development** — see `docs/specs.md` and §4 of this file.
4. Read `docs/specs.md` before touching any spec or `"sdd": true` feature.

## 2. Repository Map

| File / Folder                          | Contents                                                                                    | When to Read                                       |
| -------------------------------------- | ------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| `feature_list.json`                    | List of tasks with status (`pending` / `spec_ready` / `in_progress` / `done` / `blocked`)   | Always, at the start                               |
| `progress/current.md`                  | Current session state                                                                       | Always, at the start                               |
| `progress/history.md`                  | Append-only log of previous sessions                                                        | If you need historical context                     |
| `specs/<feature>/`                     | `requirements.md` + `design.md` + `tasks.md` (Kiro-style)                                   | Before implementing any feature with `"sdd": true` |
| `docs/architecture.md`                 | What it means to "do a good job" in this project (layers, separation of UI/Domain)          | Before implementing                                |
| `docs/conventions.md`                  | Style rules, naming (camelCase/PascalCase), TypeScript architecture                         | Before writing code                                |
| `docs/specs.md`                        | SDD process: EARS notation, the 3 files, human approval gate                                | Before drafting or reading a spec                  |
| `docs/verification.md`                 | How to verify that your work works (Vitest/Jest, tsc --noEmit, traceability)                | Before marking a task as `done`                    |
| `CHECKPOINTS.md`                       | Objective criteria for "correct final state"                                                | For self-evaluation                                |
| `.github/agents/` or `.claude/agents/` | Sub-agent definitions (`leader`, `spec_author`, `implementer`, `reviewer`)                  | If orchestrating work                              |
| `src/`                                 | Application code, React components, hooks, domain layer, and automated tests (`.test.tsx?`) | For implementation and test review                 |

## 3. Hard Rules (Non-Negotiable)

- **Only one feature at a time.** Do not mix changes from multiple tasks in the same session.
- **Do not mark a task as `done` without passing tests.** Run `./init.sh` and ensure both TypeScript compilation and test blocks pass 100%.
- **Do not skip the spec phase.** Any feature with `"sdd": true` must go through `spec_author` and obtain human approval before touching code.
- **Do not skip the human approval gate.** The leader stops the flow at `spec_ready` and waits.
- **Document what you do** in `progress/current.md` while working, not at the end.
- **Leave the repository clean** before closing the session (see §5).
- **If you don't know something, check `docs/`** before making assumptions.

## 4. Workflow (SDD)

`pending → [spec_author] → spec_ready → ⏸ HUMAN → in_progress → [implementer → reviewer] → done`

1. The leader detects the first `pending` feature with `"sdd": true`.
2. The leader launches `spec_author`, which creates
   `specs/<name>/{requirements,design,tasks}.md` and marks the status as
   `spec_ready`.
3. **Pause.** The human reads the spec in `specs/<name>/` and approves (or requests changes).
4. Once approved, the leader changes the status to `in_progress` and launches `implementer`.
5. The implementer executes `tasks.md` one by one, marking them `[x]`.
6. The reviewer verifies TypeScript compilation, traceability `R<n>` ↔ test, and completed tasks; approves or rejects.
7. The reviewer runs the required `pnpm build` and approves only when the complete feature is correct.
8. After reviewer approval, the leader asks the human whether to run `pa app push`.
   The push is optional; record an approval, skip, deferral, or failure and continue closure unless deployment was explicitly required.
9. If approved, the implementer marks `done` in `feature_list.json` and moves the summary to `progress/history.md`.

## 5. Session Closure (lifecycle)

Before ending:

1. Run `./init.sh` — all green.
2. Confirm the reviewer passed `pnpm build` — the production build must pass after feature implementation.
3. Record the human's optional `pa app push` decision and outcome, if attempted.
4. If the task is finished: mark `status: "done"` in `feature_list.json`.
5. Move the summary from `progress/current.md` to the end of `progress/history.md`.
6. Empty `progress/current.md` leaving only the template.
7. Do not leave temporary files, `console.log()` debug statements, or TODOs without context.

## 6. If you get stuck

- Reread the relevant section of `docs/`.
- If the tools or test runners do not behave as expected, **do not invent a workaround**: document the blockage in `progress/current.md`, update status to `blocked` in `feature_list.json`, and end the session.
