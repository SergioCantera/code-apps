import type { CSSProperties, ReactNode } from 'react';
import {AppSidebar} from '@/components/app-sidebar'
import {SidebarProvider, SidebarTrigger} from '@/components/ui/sidebar'
import {useT} from "@/lib/i18n"
import {LangSelector} from '@/components/lang-selector'
import {ThemeToggle} from '@/components/theme-toggle'
import {LoggedUser} from '@/components/logged-user'

type LayoutProps = {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  
  const {t} = useT()
  
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
              <LangSelector />
              <ThemeToggle />
              <LoggedUser />
            </div>
          </header>
          <main className="flex-1 overflow-hidden">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}