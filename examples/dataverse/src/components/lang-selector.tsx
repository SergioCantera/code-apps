import {DropdownMenu,DropdownMenuContent,DropdownMenuItem,DropdownMenuTrigger} from "@/components/ui/dropdown-menu"
import {Button} from "@/components/ui/button"
import { ChevronDown,Globe } from 'lucide-react';
import {useT, type Lang} from "@/lib/i18n"

const LANG_OPTIONS: { code: Lang, label: string, flag: string }[] = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
]

export function LangSelector() {

  const {lang, setLang} = useT()
  const currentLang = LANG_OPTIONS.find((option) => option.code === lang) ?? LANG_OPTIONS[0]

  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className='h-7 gap-1.5 text-xs px-2.5' data-testid="button-language-switcher">
          <Globe className='h-3.5 w-3.5 text-muted-foreground' />
          <span>{currentLang.flag}</span>
          <span>{currentLang.label}</span>
          <ChevronDown className='h-3 w-3 opacity-50'/>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className="w-36">
        {LANG_OPTIONS.map((option) => (
          <DropdownMenuItem
            key={option.code}
            onClick={() => setLang(option.code)}
            className={`gap-2 text-sm ${lang === option.code ? 'font-semibold text-primary' : ''}`}
            data-testid={`lang-option-${option.code}`}
            >
              <span>{option.flag}</span>
              <span>{option.label}</span>
              {lang === option.code && <span className="ml-auto text-primary text-[10px]">✓</span>}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}