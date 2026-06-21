import { ThemeProvider } from "@/providers/theme-provider"
import { SonnerProvider } from "@/providers/sonner-provider"
import { QueryProvider } from "./providers/query-provider"
import { RouterProvider } from "react-router-dom"
import { router } from "@/router"
import {LanguageProvider} from "@/lib/i18n"

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <SonnerProvider>  
          <QueryProvider>
            <RouterProvider router={router} />
          </QueryProvider>
        </SonnerProvider>
      </LanguageProvider>
    </ThemeProvider>
  )
}