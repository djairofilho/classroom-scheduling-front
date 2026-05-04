import { NavLink, useLocation } from 'react-router-dom'
import {
  Bell,
  Building2,
  Layers,
  LayoutDashboard,
  ListChecks,
  LogOut,
  PlusSquare,
  Search,
  Server,
  Users,
} from 'lucide-react'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/authContext'
import { useI18n } from '@/i18n/I18nProvider'

export function AppSidebar() {
  const { state } = useSidebar()
  const collapsed = state === 'collapsed'
  const { pathname } = useLocation()
  const { user, isAdmin, logout } = useAuth()
  const { t, locale, setLocale } = useI18n()

  const isActive = (url) => (url === '/' ? pathname === '/' : pathname.startsWith(url))

  const mainItems = [
    { title: t('shell.nav.dashboard'), url: '/', icon: LayoutDashboard },
    { title: t('shell.nav.search'), url: '/espacos', icon: Search },
    { title: t('shell.nav.newReservation'), url: '/reservas/nova', icon: PlusSquare },
    { title: t('shell.nav.bookings'), url: '/reservas', icon: ListChecks },
    { title: t('shell.nav.notifications'), url: '/notificacoes', icon: Bell },
  ]

  const adminItems = [
    { title: t('admin.tabs.spaces'), url: '/admin/espacos', icon: Building2 },
    { title: t('admin.tabs.buildings'), url: '/admin/predios', icon: Layers },
    { title: t('admin.tabs.users'), url: '/admin/usuarios', icon: Users },
    { title: t('admin.tabs.api'), url: '/configuracoes/api', icon: Server },
  ]

  const userLabel = user?.email ?? ''
  const roleLabel = isAdmin ? 'Admin' : user?.tipoSolicitante === 'ALUNO' ? 'Aluno' : 'Funcionário'
  const initials = userLabel.slice(0, 2).toUpperCase() || '–'

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader className="px-3 py-4">
        {collapsed ? (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
            P
          </div>
        ) : (
          <div className="flex flex-col items-start gap-0.5 pl-1">
            <span className="text-base font-extrabold tracking-tight text-primary">{t('shell.brand')}</span>
            <span className="text-xs text-muted-foreground">{t('shell.subtitle')}</span>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                    <NavLink to={item.url} end={item.url === '/'} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>Administração</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminItems.map((item) => (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                      <NavLink to={item.url} className="flex items-center gap-2">
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="gap-3 border-t border-sidebar-border px-3 py-3">
        {!collapsed && (
          <div className="flex flex-col gap-2">
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-muted-foreground">
              {t('shell.language')}
            </p>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => setLocale('pt-BR')}
                className={`rounded-full px-2.5 py-1 text-[0.7rem] font-semibold transition ${
                  locale === 'pt-BR'
                    ? 'bg-primary text-primary-foreground'
                    : 'border border-sidebar-border bg-background text-muted-foreground hover:text-foreground'
                }`}
              >
                PT-BR
              </button>
              <button
                type="button"
                onClick={() => setLocale('en')}
                className={`rounded-full px-2.5 py-1 text-[0.7rem] font-semibold transition ${
                  locale === 'en'
                    ? 'bg-primary text-primary-foreground'
                    : 'border border-sidebar-border bg-background text-muted-foreground hover:text-foreground'
                }`}
              >
                EN
              </button>
            </div>
          </div>
        )}

        <div className={`flex ${collapsed ? 'flex-col items-center gap-2' : 'items-center gap-2'}`}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-soft text-xs font-bold text-primary">
            {initials}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-foreground">{userLabel}</p>
              <p className="text-[0.7rem] text-muted-foreground">{roleLabel}</p>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={logout}
            aria-label="Sair"
            title="Sair"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
