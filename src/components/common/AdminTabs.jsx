import { NavLink } from 'react-router-dom'

import { useI18n } from '@/i18n/I18nProvider'
import { cn } from '@/lib/utils'

export function AdminTabs() {
  const { t } = useI18n()
  const links = [
    { to: '/admin/espacos', label: t('admin.tabs.spaces') },
    { to: '/admin/predios', label: t('admin.tabs.buildings') },
    { to: '/admin/usuarios', label: t('admin.tabs.users') },
    { to: '/configuracoes/api', label: t('admin.tabs.api') },
  ]

  return (
    <div className="mb-6 inline-flex h-10 items-center rounded-md bg-muted p-1 text-muted-foreground">
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          className={({ isActive }) =>
            cn(
              'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              isActive ? 'bg-background text-foreground shadow-sm' : 'hover:text-foreground',
            )
          }
        >
          {link.label}
        </NavLink>
      ))}
    </div>
  )
}
