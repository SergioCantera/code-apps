import path from 'path'
import { defineConfig, loadEnv, type PluginOption } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { powerApps } from '@microsoft/power-apps-vite';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { mockAgentApiPlugin } from './mock/mock-agent-api-plugin';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "")
  const mockApiEnabled = env.VITE_MOCK_AGENT_API !== "false" && env.VITE_MOCK_AGENT_API !== "0"
  const isMcpBuild = mode === "mcp"

  const plugins: PluginOption[] = [
    react(),
    tailwindcss(),
    powerApps(),
  ]

  if (isMcpBuild) {
    plugins.push(viteSingleFile())
  }

  if (mockApiEnabled) {
    plugins.push(
      mockAgentApiPlugin({
        githubModelsApiToken: env.VITE_GITHUB_MODELS_API_TOKEN,
        githubModel: env.VITE_LLM_MODEL,
        githubModelsApiUrl: env.VITE_GITHUB_MODELS_API_URL,
        mcpServers: env.VITE_MCP_SERVERS?.split(","),
      }),
    )
  }

  return {
    plugins,
    build: isMcpBuild
      ? {
          outDir: "dist-mcp",
          emptyOutDir: true,
          rollupOptions: {
            input: "mcp-app.html",
          },
        }
      : undefined,
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      }
    }
  }
})
