import { Link, useLocation } from 'wouter';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter
} from '@/components/ui/sidebar'
import {Home, Settings, HelpCircle, TestTube} from 'lucide-react'
import powerAppsLogo from '@/assets/power-apps.svg'
import {useT} from '@/lib/i18n';

export function AppSidebar() {
  const [pathname] = useLocation();
  const {t} = useT();

  const navItems = [
    { title: t.nav.home, url: "/", icon: Home },
    { title: t.nav.test, url: "/test", icon: TestTube },
  ]

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border px-4 py-3">
        <div className="flex flex-col gap-1.5">
          <img src={powerAppsLogo} alt="Power Apps Logo" className="h-8 w-auto object-contain object-left" />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t.nav.main}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive = pathname === item.url || (item.url !== "/" && pathname.startsWith(item.url));
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild data-active={isActive}>
                      <Link href={item.url} className="flex items-center gap-2">
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border p2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <a href="#" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span>{t.nav.settings}</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <a href="#" className="flex items-center gap-2">
                <HelpCircle className="h-4 w-4" />
                <span>{t.nav.help}</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}