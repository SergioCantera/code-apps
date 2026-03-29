import { Moon, Sun } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTheme } from "@/hooks/use-theme"
import type {Theme} from '@/providers/theme-provider'

const THEME_OPTIONS: { code: Theme, label: string, flag: string }[] = [
  { code: 'light', label: 'Light', flag: '🌞' },
  { code: 'dark', label: 'Dark', flag: '🌜' },
  { code: 'system', label: 'System', flag: '💻' },
]

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {THEME_OPTIONS.map((option) => (
            <DropdownMenuItem 
            key={option.code}
            onClick={() => setTheme(option.code)}
            className={`gap-2 text-sm ${theme === option.code ? 'font-semibold text-primary' : ''}`}
            data-testid={`theme-option-${option.code}`}
            >
            <span>{option.flag}</span>
              <span>{option.label}</span>
              {theme === option.code && <span className="ml-auto text-primary text-[10px]">✓</span>}
          </DropdownMenuItem>
        )
      )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}