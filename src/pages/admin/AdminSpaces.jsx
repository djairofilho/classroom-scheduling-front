import { useCallback, useMemo, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { ErrorBlock, LoadingBlock } from '../../components/layout/AsyncState'
import { PageIntro } from '../../components/layout/PageIntro'
import { Badge, Button, Card } from '../../components/layout/ui'
import { useAsyncData } from '../../hooks/useAsyncData'
import { useI18n } from '../../i18n/I18nProvider'
import { api } from '../../lib/api'
import { mapEspaco, mapPredio } from '../../lib/adapters'

export function AdminSpacesPage() {
  const { t, tm } = useI18n()
  const [selectedBuildingId, setSelectedBuildingId] = useState('')
  const [onlyAvailable, setOnlyAvailable] = useState(false)
  const [pendingId, setPendingId] = useState(null)
  const loadAdminSpaces = useCallback(async () => {
    const [espacos, predios] = await Promise.all([api.listEspacos(), api.listPredios()])
    return {
      spaces: espacos.map(mapEspaco),
      buildings: predios.map(mapPredio),
    }
  }, [])

  const { data, loading, error, setData } = useAsyncData(loadAdminSpaces)

  const filteredSpaces = useMemo(() => {
    if (!data) return []

    return data.spaces.filter((space) => {
      const matchesBuilding = !selectedBuildingId || String(space.buildingId) === selectedBuildingId
      const matchesAvailability = !onlyAvailable || space.statusKey === 'common.statuses.available'
      return matchesBuilding && matchesAvailability
    })
  }, [data, onlyAvailable, selectedBuildingId])

  async function handleToggleAvailability(space) {
    setPendingId(space.id)

    try {
      const updated = await api.updateEspacoIndisponibilidade(space.id, {
        indisponivel: space.statusKey === 'common.statuses.available',
        motivo: space.statusKey === 'common.statuses.available' ? t('admin.spaces.adminReason') : null,
      })

      const mapped = mapEspaco(updated)
      setData((current) => ({
        ...current,
        spaces: current.spaces.map((item) => (item.id === mapped.id ? mapped : item)),
      }))
    } finally {
      setPendingId(null)
    }
  }

  return (
    <>
      <PageIntro
        title={t('admin.spaces.title')}
        description={t('admin.spaces.description')}
        actions={<Button>{t('admin.spaces.newSpace')}</Button>}
      />
      <AdminTabs />

      {loading ? <LoadingBlock label={t('async.adminSpacesLoad')} /> : null}
      {error ? <ErrorBlock message={t('async.adminSpacesError')} /> : null}

      {!loading && !error && data ? (
        <div className="grid gap-6 xl:grid-cols-[280px_1fr]">
          <Card className="h-fit">
            <h2 className="text-xl font-bold text-ink">{t('admin.spaces.filters')}</h2>
            <div className="mt-6 space-y-6">
              <label>
                <span className="mb-2 block text-sm font-bold text-ink">{t('admin.spaces.building')}</span>
                <select
                  className="h-12 w-full rounded-2xl border border-stroke bg-panel px-4 text-sm outline-none transition focus:border-brand-red focus:ring-4 focus:ring-brand-red/10"
                  value={selectedBuildingId}
                  onChange={(event) => setSelectedBuildingId(event.target.value)}
                >
                  <option value="">{t('admin.spaces.allBuildings')}</option>
                  {data.buildings.map((building) => (
                    <option key={building.id} value={building.id}>
                      {building.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex items-center gap-3 text-sm text-ink-muted">
                <input checked={onlyAvailable} type="checkbox" onChange={(event) => setOnlyAvailable(event.target.checked)} />
                {t('admin.spaces.availableOnly')}
              </label>
            </div>
          </Card>

          <Card className="overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead className="bg-panel">
                  <tr>
                    {tm('admin.spaces.headers').map((head) => (
                      <th key={head} className="px-6 py-4 text-left text-xs font-extrabold uppercase tracking-[0.18em] text-ink-muted">
                        {head}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredSpaces.map((space) => (
                    <tr key={space.id} className="border-t border-stroke hover:bg-brand-paper">
                      <td className="px-6 py-5 text-sm font-semibold text-ink">{space.name}</td>
                      <td className="px-6 py-5 text-sm text-ink-muted">{t(space.typeKey)}</td>
                      <td className="px-6 py-5 text-sm text-ink">{space.capacity}</td>
                      <td className="px-6 py-5 text-sm text-ink-muted">{space.building}</td>
                      <td className="px-6 py-5">
                        <Badge tone={space.statusTone}>{t(space.statusKey)}</Badge>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex justify-end gap-3 text-sm font-semibold">
                          <button className="text-navy" type="button">
                            {t('common.edit')}
                          </button>
                          <button className="text-brand-red" disabled={pendingId === space.id} onClick={() => handleToggleAvailability(space)} type="button">
                            {pendingId === space.id ? t('admin.spaces.saving') : t('admin.spaces.toggle')}
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
      ) : null}
    </>
  )
}

function AdminTabs() {
  const { t } = useI18n()
  const links = [
    { to: '/admin/espacos', label: t('admin.tabs.spaces') },
    { to: '/admin/predios', label: t('admin.tabs.buildings') },
    { to: '/admin/usuarios', label: t('admin.tabs.users') },
    { to: '/configuracoes/api', label: t('admin.tabs.api') },
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
