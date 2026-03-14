# Shopping Cart App Example

This project is a Power Apps Code App example that implements a dessert catalog and shopping cart experience.

It demonstrates:

- Product retrieval through generated Power services
- Local cart state management with Zustand
- Cart totals and order confirmation flow
- React + Vite app structure for Code Apps

## Tech stack

- React 19
- Vite
- @microsoft/power-apps
- Zustand
- Tailwind CSS

## Prerequisites

- Node.js 18+ (Node 20 LTS recommended)
- npm

## Run locally

```bash
npm install
npm run dev
```

By default, Vite prints the local development URL in the terminal.

## Available scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run preview`: Preview production build
- `npm run lint`: Run ESLint

## Project structure

```text
src/
├── components/
│   ├── CardsContainer.jsx
│   ├── Cart.jsx
│   ├── CartButton.jsx
│   ├── CartItem.jsx
│   ├── OrderConfirmed.jsx
│   ├── ProductCard.jsx
│   └── TotalOrder.jsx
├── generated/          # Generated models/services for Power data access
├── store/
│   └── cart.store.js   # Zustand cart state
├── App.jsx
├── PowerProvider.jsx   # Initializes Power Apps SDK
└── main.jsx
```

## Notes

- Product data is loaded using `Siero_productsService` from `src/generated/services/`.
- `PowerProvider` initializes the Power Apps SDK on startup.
- Treat files under `src/generated/` as generated artifacts.

## Troubleshooting

- If products do not appear, verify your generated service configuration and data source connection.
- If the app fails during startup, check console logs for Power SDK initialization errors.
