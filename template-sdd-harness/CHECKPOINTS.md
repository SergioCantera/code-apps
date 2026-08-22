# CHECKPOINTS — Evaluation of the final state

> In multi-agent systems, the path is not evaluated, the destination is.
> These are the objective checkpoints that a judge (human or AI) can use
> to decide if the project is healthy.

## C1 — The harness is complete

- [ ] The 4 base files exist: `AGENTS.md`, `init.sh`, `feature_list.json`,
      `progress/current.md`.
- [ ] The 3 docs exist: `docs/architecture.md`, `docs/conventions.md`,
      `docs/verification.md`.
- [ ] `./init.sh` exits with code 0.

## C2 — The state is coherent

- [ ] At most one feature is `in_progress` in `feature_list.json`.
- [ ] Every `done` feature has associated tests that pass.
- [ ] `progress/current.md` is empty or describes the active session
      (does not contain leftover data from previous sessions).

## C3 — The code respects the architecture

- [ ] `src/` only contains the modules, components, and layers specified in `docs/architecture.md`.
- [ ] Every new dependency is correctly registered in `package.json` and locked in `pnpm-lock.yaml`. No external script injections exist outside of the pnpm ecosystem.
- [ ] There are no `console.log()` statements left for debugging, nor unresolved `// TODO` comments without linked issue/context.

## C4 — Verification is real

- [ ] `src/` has a healthy test coverage (components, hooks, or domain logic) according to `docs/verification.md`.
- [ ] Frontend tests utilize isolated environments or standard DOM wrappers (like `@testing-library/react`), ensuring no leaked state between test cases.
- [ ] The test runner (`pnpm test` or `pnpm run test:run`) runs successfully with > 0 tests, showing all green, and `pnpm exec tsc --noEmit` returns zero type errors.

## C5 — The session was closed properly

- [ ] No suspicious untracked files (`.DS_Store`, build artifacts like `dist/`, or temporary logs outside of `.gitignore`).
- [ ] `progress/history.md` has an entry for the last session.
- [ ] The last feature worked on is reflected in its correct state.

## C6 — Spec Driven Development

- [ ] Every feature with `"sdd": true` in `spec_ready`, `in_progress`
      or `done` state has its folder `specs/<name>/` with the 3 files:
      `requirements.md`, `design.md`, `tasks.md`.
- [ ] `requirements.md` uses strict EARS (see `docs/specs.md`).
- [ ] Every `done` feature with `"sdd": true` has all its tasks marked
      `[x]` in `tasks.md`.
- [ ] Each requirement/rule in `requirements.md` is covered by at least one test
      in the test suite.

---

**How to use this file:** a reviewer agent (`.github/agents/reviewer.md`)
goes through each checkbox, marks `[x]` or `[ ]`, and rejects the session
closure if there are empty boxes in C1-C6.
