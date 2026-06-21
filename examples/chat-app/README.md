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
- pnpm

## Run locally

```bash
pnpm install
pnpm dev
```

## Local mock API for chat

This project includes a local mock endpoint for chat requests during development:

- Endpoint: `POST /api/agent/chat`
- Enabled by default when running `pnpm dev`
- Toggle with env var: `VITE_MOCK_AGENT_API`

Examples:

```bash
# Enabled (default)
VITE_MOCK_AGENT_API=true pnpm dev

# Disabled (to use a real backend)
VITE_MOCK_AGENT_API=false pnpm dev
```

When you are ready to connect your real agent backend, keep `VITE_MOCK_AGENT_API=false` and set `VITE_AGENT_API_URL` to your API URL.

## MCP App support

This app now supports hybrid mode:

- Standalone web app (current behavior)
- MCP App rendered inline by MCP hosts

### Build MCP UI bundle

```bash
pnpm build:mcp
```

This creates a single-file MCP resource at `dist-mcp/mcp-app.html`.

### Run MCP server (stdio)

```bash
pnpm mcp:serve
```

The server registers:

- Tool: `open-chat-app`
- Resource: `ui://chat-app/mcp-app.html`

Optional tool arguments:

- `initialPrompt`: prefill prompt text in the chat input
- `conversationId`: set initial conversation id
- `agentApiUrl`: override `VITE_AGENT_API_URL` for this MCP session

### CSP domains for MCP host

The server builds `connectDomains` from:

- `VITE_AGENT_API_URL` (if absolute URL)
- `VITE_MCP_SERVERS` (comma-separated URLs)

## Available scripts

- `pnpm dev`: Start development server
- `pnpm build`: Type-check and create production build
- `pnpm build:mcp`: Build MCP single-file UI resource (`dist-mcp/mcp-app.html`)
- `pnpm preview`: Preview production build
- `pnpm lint`: Run ESLint
- `pnpm mcp:serve`: Run MCP stdio server (`server.ts`)

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
