# Todo App Example (with Agent Chat)

This project is a Power Apps Code App example that combines todo management with an AI-style chat assistant.

It demonstrates:

- Todo CRUD operations through generated Power services
- State management with React Context API
- Agent conversation UI using `agent-state-bridge`
- Markdown rendering for assistant responses

## Tech stack

- React 19
- Vite
- @microsoft/power-apps
- agent-state-bridge
- react-markdown

## Prerequisites

- Node.js 18+ (Node 20 LTS recommended)
- npm
- A running chat backend at `http://localhost:8000/chat` (or update the endpoint in `src/hooks/useAgentChat.jsx`)

## Run locally

```bash
npm install
npm run dev
```

## Available scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run preview`: Preview production build

## Project structure

```text
src/
├── components/
│   ├── AgentChat.jsx
│   └── TodoList.jsx
├── context/
│   └── TodoContext.jsx      # Todo state + CRUD actions
├── hooks/
│   └── useAgentChat.jsx     # Agent bridge integration
├── generated/               # Generated models/services for Power data access
├── App.jsx
├── PowerProvider.tsx        # Initializes Power Apps SDK
└── main.jsx
```

## How the agent integration works

- `useAgentChat` sends user messages to the backend endpoint.
- Current todo state is passed as context (`todos` + summary stats).
- Agent actions can trigger local todo operations (create, toggle, delete).

## Notes

- Todo data is loaded through `Siero_todosService` in `src/generated/services/`.
- Files under `src/generated/` should be treated as generated artifacts.
- If chat does not respond, verify that your backend is running and reachable.

## Troubleshooting

- If todos do not load, validate your generated service and data source setup.
- If assistant actions are not applied, inspect the action payload shape returned by your backend.
