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

### Level 4 — Requirements Traceability (mandatory for features with `"sdd": true`)

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
./init.sh           # should end with [OK] Environment ready
```

If `./init.sh` fails, **do not** mark anything as `done`. Record the blockage
in `progress/current.md` with status `blocked` in `feature_list.json`.
