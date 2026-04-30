import { useCallback } from 'react'
import { NavLink } from 'react-router-dom'
import { ErrorBlock, LoadingBlock } from '../../components/layout/AsyncState'
import { PageIntro } from '../../components/layout/PageIntro'
import { Button, Card } from '../../components/layout/ui'
import { useAsyncData } from '../../hooks/useAsyncData'
import { useI18n } from '../../i18n/I18nProvider'
import { api } from '../../lib/api'
import { mapEspaco, mapPredio } from '../../lib/adapters'

export function AdminBuildingsPage() {
  const { t } = useI18n()
  const loadBuildings = useCallback(async () => {
    const [predios, espacos] = await Promise.all([api.listPredios(), api.listEspacos()])
    const mappedBuildings = predios.map(mapPredio)
    const mappedSpaces = espacos.map(mapEspaco)

    return mappedBuildings.map((building) => {
      const rooms = mappedSpaces.filter((space) => space.buildingId === building.id)
      const availableCount = rooms.filter((space) => space.statusKey === 'common.statuses.available').length

      return {
        ...building,
        roomsCount: rooms.length,
        occupancy: rooms.length ? `${Math.round(((rooms.length - availableCount) / rooms.length) * 100)}%` : '0%',
        statusKey:
          availableCount === rooms.length
            ? 'common.statuses.operating'
            : availableCount === 0
              ? 'common.statuses.attention'
              : 'common.statuses.partial',
      }
    })
  }, [])

  const { data, loading, error } = useAsyncData(loadBuildings)

  return (
    <>
      <PageIntro
        eyebrow={t('admin.buildings.eyebrow')}
        title={t('admin.buildings.title')}
        description={t('admin.buildings.description')}
        actions={<Button>{t('admin.buildings.newBuilding')}</Button>}
      />
      <AdminTabs />

      {loading ? <LoadingBlock label={t('async.buildingsLoad')} /> : null}
      {error ? <ErrorBlock message={t('async.buildingsError')} /> : null}

      {!loading && !error && data ? (
        <section className="grid gap-6 xl:grid-cols-3">
          {data.map((building, index) => (
            <Card key={building.id} className="overflow-hidden p-0">
              <div
                className={[
                  'h-32',
                  index % 3 === 0
                    ? 'bg-gradient-to-br from-brand-red/20 via-brand-blush to-panel'
                    : index % 3 === 1
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
                    <dt>{t('admin.buildings.code')}</dt>
                    <dd className="font-semibold text-ink">{building.code}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt>{t('admin.buildings.location')}</dt>
                    <dd className="font-semibold text-ink">{building.location}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt>{t('admin.buildings.rooms')}</dt>
                    <dd className="font-semibold text-ink">{building.roomsCount}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt>{t('admin.buildings.occupancy')}</dt>
                    <dd className="font-semibold text-ink">{building.occupancy}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt>{t('admin.buildings.status')}</dt>
                    <dd className="font-semibold text-ink">{t(building.statusKey)}</dd>
                  </div>
                </dl>
                <div className="mt-6 flex gap-3 border-t border-stroke pt-4">
                  <Button tone="secondary" className="flex-1">
                    {t('admin.buildings.viewDetails')}
                  </Button>
                  <Button tone="ghost">{t('common.edit')}</Button>
                </div>
              </div>
            </Card>
          ))}
        </section>
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
