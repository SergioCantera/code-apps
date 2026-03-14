# Power Apps React Template (TypeScript)

This template provides a production-ready starting point for building Power Apps Code Apps with React, TypeScript, and Vite.

It includes:

- React Router setup with Power Apps-friendly basename handling
- Theme support (light/dark)
- Shared UI components
- React Query provider wiring
- Toast notifications with Sonner
- Tailwind CSS v4 integration

## Tech stack

- React 19 + TypeScript
- Vite
- @microsoft/power-apps + @microsoft/power-apps-vite
- React Router
- TanStack React Query
- Tailwind CSS + utility helpers

## Prerequisites

- Node.js 18+ (Node 20 LTS recommended)
- npm

## Run locally

```bash
npm install
npm run dev
```

## Available scripts

- `npm run dev`: Start development server
- `npm run build`: Type-check and create production build
- `npm run preview`: Preview production build
- `npm run lint`: Run ESLint

## Project structure

```text
src/
├── components/
│   ├── theme-toggle.tsx
│   └── ui/
├── hooks/
├── lib/
├── pages/
│   ├── _layout.tsx
│   ├── home.tsx
│   └── not-found.tsx
├── providers/
│   ├── query-provider.tsx
│   ├── sonner-provider.tsx
│   └── theme-provider.tsx
├── App.tsx
├── main.tsx
└── router.tsx
```

## Routing note for Power Apps hosting

The router computes a dynamic basename and normalizes `index.html` paths so client-side routes work correctly when hosted in Power Apps containers.

## Customization tips

- Add new pages in `src/pages/` and register routes in `src/router.tsx`.
- Place shared visual components in `src/components/ui/`.
- Add API/data access and cache logic through `src/providers/query-provider.tsx` and related hooks.

## Recommended next step

Use this template as your baseline and copy only the features you need into a new app to keep scope small and maintainable.
