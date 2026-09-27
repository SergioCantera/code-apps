# Verification — How to prove that the work works

> Golden rule: **the agent does not say "it works", it demonstrates it**.
> Every feature ends with executable evidence, not assertions.

## Verification Levels

### Level 1 — Unit Tests & Domain (mandatory)

Every utility function, custom hook, or domain service in `src/` has at least one test in the test suite that:

1. Covers the happy path.
2. Covers at least one error path or boundary case (e.g., empty state, API rejection).

Command:

```bash
pnpm test -- --watch=false
```

### Level 2 — Component & UI Integration Test (mandatory for UI features)

Features that add or modify visual components are verified by simulating user interaction over the real DOM. Instead of mocking everything, render the component using standard wrappers:

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { RecentNotesList } from './RecentNotesList';

test('renders and interactions work without leaking state', async () => {
  // 1. Render the real component with required props or mock data
  render(<RecentNotesList items={mockItems} onSelect={jest.fn()} />);

  // 2. Simulate real user behavior
  const button = screen.getByRole('button', { name: /recent notes/i });
  fireEvent.click(button);

  // 3. Verify the visual result in the DOM
  expect(screen.getAllByRole('listitem')).toHaveLength(5);
});
```

### Level 3 — Type Safety Verification (mandatory before merge)

To guarantee that code shifts do not break the final build of the Code App, the TypeScript compiler must validate all component contracts, types, and props definitions:

```bash
pnpm exec tsc --noEmit
```

### Level 4 — Production Build (mandatory after each feature)

After the feature implementation and test verification are complete, the
reviewer SHALL run the production build from the project root:

```bash
pnpm build
```

The build must pass before the reviewer approves the feature. If it fails,
the reviewer must request changes and the implementation must be corrected
before review can succeed. This is a local Code App validation step; it does
not push anything to Power Platform.

After the reviewer approves the feature, the leader SHALL ask the human
whether to run `pa app push`. The push is optional. If the human declines or
defers it, the feature may continue through closure. Push failures must be
recorded, but do not invalidate the reviewer approval unless deployment was
explicitly required.

### Level 5 — Requirements Traceability (mandatory for features with `"sdd": true`)

Each `R<n>` in `specs/<name>/requirements.md` must be mappable to at least one concrete test case. The reviewer rejects the session if coverage is missing.

The implementer documents the map in `progress/impl_<name>.md`:

```markdown
## Trazabilidad

- R1 → `useRecentNotes.test.ts > should fetch up to 5 notes sorted by date`
- R2 → `RecentNotesList.test.tsx > should render alert when notes are empty`
```

## Anti-patterns (do not)

- ❌ "I implemented the React component, it looks good on screen." → missing executable automated test.
- ❌ Testing only if a component mounts without checking its specific outputs/DOM changes.
- ❌ Over-mocking internal React state or core hooks → test the behavior/output, not the implementation details.
- ❌ Mark the feature as `done` without running and passing `./init.sh`.

## Final Verification Before Closing

```bash
pnpm build             # reviewer gate: mandatory production build
./init.sh           # should end with [OK] Environment ready
```

The optional `pa app push` command may run only after explicit human approval.
Record whether it succeeded, failed, or was skipped.

### Push Failure Recovery

When `pa app push` fails, the leader SHALL stop, preserve the complete error,
and classify the failure before retrying:

- Missing or stale `dist/`: return to the reviewer and rerun `pnpm build`.
- Authentication or expired token: the human can run `pa auth logout` and
  authenticate again.
- Missing or incorrect environment: verify `power.config.json` and its
  `environmentId`, or rerun `pa app init` with the correct environment. The
  harness must not guess or silently change the environment.
- CLI resolution: verify the local CLI and use `npx --no-install pa` when the
  wrapper is needed; the requested deployment operation remains
  `pa app push`.

After any remediation, the leader SHALL ask for explicit approval again before
retrying. Retries must never be silent. A deployment failure does not invalidate
the reviewer approval unless deployment was explicitly required for completion.

If `./init.sh` fails, **do not** mark anything as `done`. Record the blockage
in `progress/current.md` with status `blocked` in `feature_list.json`.
