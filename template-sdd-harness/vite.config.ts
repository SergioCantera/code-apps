/// <reference types="vitest" />
import path from 'path'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { powerApps } from '@microsoft/power-apps-vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    powerApps(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    }
  },
  test: {
    globals: true,               // Inyecta describe/it/expect automáticamente
    environment: 'jsdom',        // Simula el entorno del navegador para componentes
    include: ['src/**/*.{test,spec}.{ts,tsx}'], // Patrón estricto para escanear tus tests
  },
})
