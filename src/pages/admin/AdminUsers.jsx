import { NavLink } from 'react-router-dom'
import { PageIntro } from '../../components/layout/PageIntro'
import { Badge, Button, Card } from '../../components/layout/ui'
import { adminUsers } from '../../lib/data'

export function AdminUsersPage() {
  return (
    <>
      <PageIntro
        title="Usuarios e solicitantes"
        description="Gerencie perfis de acesso e permissoes de solicitacao de espacos na instituicao."
        actions={<Button>Novo solicitante</Button>}
      />
      <AdminTabs />

      <Card className="overflow-hidden p-0">
        <div className="flex flex-col gap-4 border-b border-stroke px-6 py-5 md:flex-row md:items-center md:justify-between">
          <input
            className="h-12 w-full max-w-md rounded-2xl border border-stroke bg-panel px-4 text-sm outline-none transition focus:border-brand-red focus:ring-4 focus:ring-brand-red/10"
            placeholder="Buscar por email..."
          />
          <Button tone="secondary">Filtros</Button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead className="bg-panel">
              <tr>
                {['Nome', 'Email', 'Papel', 'Solicitacoes', 'Status', 'Acoes'].map((head) => (
                  <th key={head} className="px-6 py-4 text-left text-xs font-extrabold uppercase tracking-[0.18em] text-ink-muted">
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {adminUsers.map((user) => (
                <tr key={user.email} className="border-t border-stroke hover:bg-brand-paper">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-soft text-sm font-bold text-navy">
                        {user.name[0]}
                      </div>
                      <span className="text-sm font-semibold text-ink">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-ink-muted">{user.email}</td>
                  <td className="px-6 py-4 text-sm text-ink">{user.role}</td>
                  <td className="px-6 py-4 text-sm text-ink">{user.requests}</td>
                  <td className="px-6 py-4">
                    <Badge tone={user.status === 'Ativo' ? 'neutral' : user.status === 'Solicitante' ? 'info' : 'success'}>
                      {user.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-semibold text-navy">Gerenciar</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  )
}

function AdminTabs() {
  const links = [
    { to: '/admin/espacos', label: 'Espacos' },
    { to: '/admin/predios', label: 'Predios' },
    { to: '/admin/usuarios', label: 'Usuarios' },
    { to: '/configuracoes/api', label: 'API' },
  ]

  return (
    <div className="mb-8 flex flex-wrap gap-3">
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          className={({ isActive }) =>
            `rounded-full px-4 py-2 text-sm font-semibold transition ${
              isActive ? 'bg-brand-red text-white' : 'border border-stroke bg-white text-ink-muted hover:text-ink'
            }`
          }
        >
          {link.label}
        </NavLink>
      ))}
    </div>
  )
}
