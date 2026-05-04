import { Link } from 'react-router-dom'
import { Bell } from 'lucide-react'

import { SidebarTrigger } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/authContext'
import { useI18n } from '@/i18n/I18nProvider'
import { cn } from '@/lib/utils'

export function Topbar() {
  const { user, isAdmin, logout } = useAuth()
  const { t, locale, setLocale } = useI18n()

  const userLabel = user?.email ?? ''
  const roleLabel = isAdmin ? 'Admin' : user?.tipoSolicitante === 'ALUNO' ? 'Aluno' : 'Funcionário'

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-card/80 px-4 backdrop-blur md:px-6">
      <SidebarTrigger />
      <div className="hidden items-center gap-2 text-sm md:flex">
        <span className="font-semibold text-foreground">{t('shell.brand')}</span>
        <span className="text-muted-foreground">•</span>
        <span className="text-muted-foreground">{t('shell.subtitle')}</span>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <div className="flex items-center gap-1 rounded-full border bg-background p-0.5">
          <button
            type="button"
            onClick={() => setLocale('pt-BR')}
            className={cn(
              'rounded-full px-2.5 py-1 text-xs font-semibold transition',
              locale === 'pt-BR'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            PT
          </button>
          <button
            type="button"
            onClick={() => setLocale('en')}
            className={cn(
              'rounded-full px-2.5 py-1 text-xs font-semibold transition',
              locale === 'en'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            EN
          </button>
        </div>
        <Button asChild variant="ghost" size="icon" aria-label="Notificações">
          <Link to="/notificacoes">
            <Bell className="h-5 w-5" />
          </Link>
        </Button>
        <div className="hidden text-right md:block">
          <div className="max-w-48 truncate text-sm font-medium leading-tight">{userLabel}</div>
          <div className="text-xs text-muted-foreground">{roleLabel}</div>
        </div>
        <Button variant="outline" size="sm" className="hidden md:inline-flex" onClick={logout}>
          Sair
        </Button>
      </div>
    </header>
  )
}
