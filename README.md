# Power Apps Code Apps Playground

This repository contains practical examples and a reusable template for building **Power Apps Code Apps** with **React** and **Vite**.

It is designed as a starter workspace to explore app patterns, generated Power data services, and modern frontend structure for Code Apps.

## What is inside

- `examples/shopping-cart-app`: Product catalog + cart flow using React components and local cart state.
- `examples/todo-app`: Todo management example with chat-style agent interaction.
- `template`: Reusable TypeScript template with routing, UI primitives, theme handling, and project conventions.
- `template-replit`: Reusable template easily adapted and configured from projects done with Replit.

## Tech stack

- React 19
- Vite
- Power Apps client SDK (`@microsoft/power-apps`)
- Tailwind CSS (used by selected projects)
- Zustand (shopping cart app)
- TypeScript (template project)

## Repository structure

```text
.
├── examples/
│   ├── shopping-cart-app/
│   └── todo-app/
├── template/
├── template-replit/
└── README.md
```

## Prerequisites

- Node.js 18+ (Node 20 LTS recommended)
- npm
- (Optional) Power Platform tools and environment access if you plan to connect real data sources

## Getting started

Each app is independent. Run commands inside the app folder you want to test.

### 1) Shopping Cart App

```bash
cd examples/shopping-cart-app
npm install
npm run dev
```

Available scripts:

- `npm run dev`: Start development server
- `npm run build`: Create production build
- `npm run preview`: Preview production build locally
- `npm run lint`: Run ESLint

### 2) Todo App

```bash
cd examples/todo-app
npm install
npm run dev
```

Available scripts:

- `npm run dev`: Start development server
- `npm run build`: Create production build
- `npm run preview`: Preview production build locally

### 3) TypeScript Template

```bash
cd template
npm install
npm run dev
```

Available scripts:

- `npm run dev`: Start development server
- `npm run build`: Type-check and create production build
- `npm run preview`: Preview production build locally
- `npm run lint`: Run ESLint

## Notes

- Generated files under `src/generated/` are typically produced by Power tooling and should be treated as generated artifacts.
- Keep environment-specific values out of source code and use platform configuration when integrating real services.

## License

Add your preferred license information here (for example: MIT).
