# Code Conventions

> Extreme homogeneity. The AI predicts better when the repository looks
> like itself everywhere.

## TypeScript & React Style

- **Version:** TypeScript 5.x+ (strict mode enabled) and React 18+.
- **Format:** ESLint + Prettier rules. Lines max 100 characters.
- **Imports:** React and third-party first, then local domain layers, then components. One line per module group.
- **Strings:** double quotes `"..."` for JSX attributes. Single quotes `'...'` or double quotes `"..."` for standard code strings (must be consistent, preferred double quotes).
- **Template Literals:** Use backticks `` `...` `` for string interpolation. No concatenation with `+`.

## Names

| Type                  | Convention    | Example                   |
| --------------------- | ------------- | ------------------------- |
| Components            | `PascalCase`  | `RecentNotesList.tsx`     |
| Custom Hooks          | `camelCase`   | `useRecentNotes.ts`       |
| Functions / variables | `camelCase`   | `loadNotes`               |
| Interfaces / Types    | `PascalCase`  | `Note` or `NoteProps`     |
| Constants             | `UPPER_SNAKE` | `DEFAULT_NOTES_LIMIT`     |
| Privates / Internal   | prefix `_`    | `_calculateInternalState` |

## File Structure

Each TypeScript component file starts with a single-line comment describing its purpose, followed by grouped imports and explicit props definition:

```typescript
// Component to render the list of recent user notes sorted by modification date.
import React, { useState } from "react";

// Domain and State imports
import { Note } from "../domain/types";
import { useRecentNotes } from "../state/useRecentNotes";

// Component Props interface
export interface RecentNotesListProps {
  limit?: number;
}

export const RecentNotesList: React.FC<RecentNotesListProps> = ({
  limit = 5,
}) => {
  // Component implementation...
};
```

## Tests

- One test file per module/component: `src/components/__tests__/<Component>.test.tsx` or alongside the file `<Component>.test.tsx`.
- One root `describe('<ComponentOrHook>', () => { ... })` block per logical unit.
- Each test case uses isolated rendering wrapper via `@testing-library/react` and cleans up automatically after each execution.
- Descriptive test names using BDD style: `it('should return empty list when no notes exist', () => { ... })`.

## Error Handling

Domain errors defined as strongly-typed custom Error classes or custom types under `src/domain/errors.ts`:

```typescript
export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DomainError";
  }
}

export class NoteNotFoundError extends DomainError {
  constructor(noteId: string) {
    super(`Note with ID ${noteId} was not found.`);
    this.name = "NoteNotFoundError";
  }
}
```

UI components catch domain exceptions using centralized Error Boundaries or try/catch blocks, then render an appropriate fallback UI component. Never expose raw stack traces or internal API error objects directly to the screen.

## Comments

By default, **do not** write them. They are only allowed when explaining an _obvious why_
(e.g., specific browser compatibility workaround, Code Apps API limitation). Clear naming conventions should do the rest.
