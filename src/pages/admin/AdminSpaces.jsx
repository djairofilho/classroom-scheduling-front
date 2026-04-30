import { NavLink } from 'react-router-dom'
import { PageIntro } from '../../components/layout/PageIntro'
import { Badge, Button, Card } from '../../components/layout/ui'
import { adminSpaces } from '../../lib/data'

export function AdminSpacesPage() {
  return (
    <>
      <PageIntro
        title="Gerenciar espacos"
        description="Administre o inventario de salas, auditorios e laboratorios. Controle disponibilidade e caracteristicas estruturais do campus."
        actions={<Button>Novo espaco</Button>}
      />
      <AdminTabs />

      <div className="grid gap-6 xl:grid-cols-[280px_1fr]">
        <Card className="h-fit">
          <h2 className="text-xl font-bold text-ink">Filtros</h2>
          <div className="mt-6 space-y-6">
            <FilterGroup title="Predio" items={['Predio Principal', 'Bloco de Ciencias', 'Centro de Artes']} />
            <FilterGroup title="Status" items={['Disponivel', 'Em manutencao', 'Inativo']} checkedIndex={0} />
          </div>
        </Card>

        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead className="bg-panel">
                <tr>
                  {['Nome do espaco', 'Tipo', 'Cap.', 'Predio', 'Status', 'Acoes'].map((head) => (
                    <th key={head} className="px-6 py-4 text-left text-xs font-extrabold uppercase tracking-[0.18em] text-ink-muted">
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {adminSpaces.map((space) => (
                  <tr key={space.name} className="border-t border-stroke hover:bg-brand-paper">
                    <td className="px-6 py-5 text-sm font-semibold text-ink">{space.name}</td>
                    <td className="px-6 py-5 text-sm text-ink-muted">{space.type}</td>
                    <td className="px-6 py-5 text-sm text-ink">{space.capacity}</td>
                    <td className="px-6 py-5 text-sm text-ink-muted">{space.building}</td>
                    <td className="px-6 py-5">
                      <Badge tone={space.status === 'Disponivel' ? 'success' : space.status === 'Revisao' ? 'warning' : 'danger'}>
                        {space.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex justify-end gap-3 text-sm font-semibold">
                        <button className="text-navy" type="button">
                          Editar
                        </button>
                        <button className="text-brand-red" type="button">
                          Alternar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
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

function FilterGroup({ title, items, checkedIndex = -1 }) {
  return (
    <div>
      <p className="mb-3 text-sm font-bold text-ink">{title}</p>
      <div className="space-y-3">
        {items.map((item, index) => (
          <label key={item} className="flex items-center gap-3 text-sm text-ink-muted">
            <input defaultChecked={index === checkedIndex} type="checkbox" />
            {item}
          </label>
        ))}
      </div>
    </div>
  )
}
