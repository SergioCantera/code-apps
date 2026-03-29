import { ThemeProvider } from "@/providers/theme-provider"
import { SonnerProvider } from "@/providers/sonner-provider"
import { QueryProvider } from "./providers/query-provider"
import { AppRouter } from "@/router"
import {LanguageProvider} from "@/lib/i18n"

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <SonnerProvider>  
          <QueryProvider>
            <AppRouter />
          </QueryProvider>
        </SonnerProvider>
      </LanguageProvider>
    </ThemeProvider>
  )
}