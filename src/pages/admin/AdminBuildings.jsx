import { NavLink } from 'react-router-dom'
import { PageIntro } from '../../components/layout/PageIntro'
import { Button, Card } from '../../components/layout/ui'
import { adminBuildings } from '../../lib/data'

export function AdminBuildingsPage() {
  return (
    <>
      <PageIntro
        eyebrow="Administracao institucional"
        title="Gerenciar predios"
        description="Visao por unidade para ocupacao, responsaveis e estado operacional."
        actions={<Button>Novo predio</Button>}
      />
      <AdminTabs />

      <section className="grid gap-6 xl:grid-cols-3">
        {adminBuildings.map((building, index) => (
          <Card key={building.name} className="overflow-hidden p-0">
            <div
              className={[
                'h-32',
                index === 0
                  ? 'bg-gradient-to-br from-brand-red/20 via-brand-blush to-panel'
                  : index === 1
                    ? 'bg-gradient-to-br from-navy/20 via-sky-soft to-panel'
                    : 'bg-gradient-to-br from-mint/20 via-panel to-brand-blush',
              ].join(' ')}
            />
            <div className="p-6">
              <div className="flex items-start justify-between">
                <h2 className="text-2xl font-bold text-ink">{building.name}</h2>
                <button className="text-ink-muted" type="button">
                  ...
                </button>
              </div>
              <dl className="mt-5 space-y-3 text-sm text-ink-muted">
                <div className="flex justify-between gap-4">
                  <dt>Responsavel</dt>
                  <dd className="font-semibold text-ink">{building.manager}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt>Salas cadastradas</dt>
                  <dd className="font-semibold text-ink">{building.rooms}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt>Ocupacao media</dt>
                  <dd className="font-semibold text-ink">{building.occupancy}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt>Status</dt>
                  <dd className="font-semibold text-ink">{building.status}</dd>
                </div>
              </dl>
              <div className="mt-6 flex gap-3 border-t border-stroke pt-4">
                <Button tone="secondary" className="flex-1">
                  Ver detalhes
                </Button>
                <Button tone="ghost">Editar</Button>
              </div>
            </div>
          </Card>
        ))}
      </section>
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
