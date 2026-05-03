import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../../lib/authContext'
import { AppIcon } from '../../lib/icons'
import { useI18n } from '../../i18n/I18nProvider'

function navClass({ isActive }) {
  return [
    'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-200',
    isActive
      ? 'border-r-4 border-brand-red bg-white text-brand-red shadow-soft'
      : 'text-ink-muted hover:bg-warm-stone hover:text-ink',
  ].join(' ')
}

export function AppShell() {
  const { locale, setLocale, t } = useI18n()
  const { user, isAdmin, logout } = useAuth()
  const userLabel = user?.email ?? ''
  const roleLabel = isAdmin ? 'Admin' : user?.tipoSolicitante === 'ALUNO' ? 'Aluno' : 'Funcionario'
  const initials = userLabel.slice(0, 2).toUpperCase()

  const navigation = [
    { to: '/', label: t('shell.nav.dashboard'), icon: 'dashboard', end: true },
    { to: '/espacos', label: t('shell.nav.search'), icon: 'search' },
    { to: '/reservas/nova', label: t('shell.nav.newReservation'), icon: 'plus-square' },
    { to: '/reservas', label: t('shell.nav.bookings'), icon: 'calendar' , end: true},
    { to: '/notificacoes', label: t('shell.nav.notifications'), icon: 'bell' },
    ...(isAdmin
      ? [
          { to: '/admin/espacos', label: t('shell.nav.admin'), icon: 'shield' },
          { to: '/configuracoes/api', label: t('shell.nav.settings'), icon: 'settings' },
        ]
      : []),
  ]

  return (
    <div className="min-h-screen bg-brand-paper text-ink">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-stroke bg-panel px-5 py-8 lg:flex lg:flex-col">
        <div className="px-3">
          <p className="text-xl font-extrabold tracking-tight text-brand-red">{t('shell.brand')}</p>
          <p className="mt-1 text-sm font-medium text-ink-muted">{t('shell.subtitle')}</p>
        </div>

        <nav className="mt-10 flex flex-1 flex-col gap-2">
          {navigation.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={navClass}>
              <AppIcon name={item.icon} className="h-5 w-5" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="mt-8 border-t border-stroke px-3 pt-6">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-ink-muted">{t('shell.language')}</p>
          <div className="mb-5 flex gap-2">
            <button
              className={`rounded-full px-3 py-1 text-xs font-semibold ${locale === 'pt-BR' ? 'bg-brand-red text-white' : 'border border-stroke bg-white text-ink-muted'}`}
              onClick={() => setLocale('pt-BR')}
              type="button"
            >
              PT-BR
            </button>
            <button
              className={`rounded-full px-3 py-1 text-xs font-semibold ${locale === 'en' ? 'bg-brand-red text-white' : 'border border-stroke bg-white text-ink-muted'}`}
              onClick={() => setLocale('en')}
              type="button"
            >
              EN
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-red/10 text-sm font-bold text-brand-red">
              {initials}
            </div>
            <div>
              <p className="break-all text-sm font-semibold text-ink">{userLabel}</p>
              <p className="text-sm text-ink-muted">{roleLabel}</p>
            </div>
          </div>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-stroke bg-white/95 backdrop-blur">
          <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-5 py-4 lg:px-10">
            <div className="flex flex-1 items-center gap-3">
              <div className="relative w-full max-w-xl">
                <AppIcon
                  name="search"
                  className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted"
                />
                <input
                  className="h-12 w-full rounded-full border border-stroke bg-warm-stone pl-11 pr-4 text-sm text-ink outline-none transition focus:border-brand-red focus:bg-white focus:ring-4 focus:ring-brand-red/10"
                  placeholder={t('shell.searchPlaceholder')}
                  type="text"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button className="flex h-11 w-11 items-center justify-center rounded-full border border-stroke bg-white text-ink-muted transition hover:border-brand-red/30 hover:text-brand-red">
                <AppIcon name="bell" className="h-5 w-5" />
              </button>
              <button className="flex items-center gap-3 rounded-full border border-stroke bg-white px-3 py-2 transition hover:border-brand-red/30">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-navy/10 text-sm font-bold text-navy">
                  {initials}
                </div>
                <div className="hidden text-left sm:block">
                  <p className="max-w-56 truncate text-sm font-semibold text-ink">{userLabel}</p>
                  <p className="text-xs text-ink-muted">{roleLabel}</p>
                </div>
              </button>
              <button
                className="rounded-full border border-stroke bg-white px-4 py-2 text-sm font-semibold text-ink-muted transition hover:border-brand-red/30 hover:text-brand-red"
                onClick={logout}
                type="button"
              >
                Sair
              </button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[1440px] px-5 py-10 lg:px-10">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
