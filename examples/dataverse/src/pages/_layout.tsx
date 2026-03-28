import type { CSSProperties } from 'react';
import { Outlet } from "react-router-dom"
import {AppSidebar} from '@/components/app-sidebar'
import {SidebarProvider, SidebarTrigger} from '@/components/ui/sidebar'
import {ThemeToggle} from '@/components/theme-toggle'
import {DropdownMenu,DropdownMenuContent,DropdownMenuItem,DropdownMenuSeparator,DropdownMenuTrigger} from "@/components/ui/dropdown-menu"
import {Button} from "@/components/ui/button"
import { ChevronDown,Globe } from 'lucide-react';
import {useT, type Lang} from "@/lib/i18n"
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const LANG_OPTIONS: { code: Lang, label: string, flag: string }[] = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
]

const LOGGED_USER = {
  fullName: "John Doe",
  email: "john.doe@example.com",
  imageUrl: "https://testingbot.com/free-online-tools/random-avatar/300"
}

export default function Layout() {
  
  const {lang, setLang, t} = useT()
  const currentLang = LANG_OPTIONS.find((option) => option.code === lang) ?? LANG_OPTIONS[0]
  const userInitials = LOGGED_USER.fullName
    .split(' ')
    .map(name => name[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  
  const style = {
    "--sidebar-width": "15rem",
    "--sidebar-width-icon": "3.5rem",
  }

  return (
    <SidebarProvider style={style as CSSProperties}>
      <div className="flex h-screen w-full overflow-hidden">
        <AppSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center gap-2 px-4 h-11 border-b border-border bg-background shrink-0">
            <SidebarTrigger data-testid="button-sidebar-toggle" className="h-7 w-7" />
            <div className='flex-1' />
            <div className='flex items-center gap-3'>
              <div className='flex items-center gap-1.5 text-xs text-muted-foreground'>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  {t.app.welcomeMessage}
              </div>
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
              <ThemeToggle />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className='h-8 w-8 rounded-full' data-testid="button-user-profile">
                    <Avatar size="sm">
                      <AvatarImage src={LOGGED_USER.imageUrl} alt={LOGGED_USER.fullName} />
                      <AvatarFallback>{userInitials}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end' className="w-64 p-2">
                  <div className='flex items-center gap-3 rounded-md p-2'>
                    <Avatar size="lg">
                      <AvatarImage src={LOGGED_USER.imageUrl} alt={LOGGED_USER.fullName} />
                      <AvatarFallback>{userInitials}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className='truncate text-sm font-medium'>{LOGGED_USER.fullName}</p>
                      <p className='truncate text-xs text-muted-foreground'>{LOGGED_USER.email}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem disabled className="text-xs text-muted-foreground">
                    Logged user profile
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
          <main className="flex-1 overflow-hidden">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}