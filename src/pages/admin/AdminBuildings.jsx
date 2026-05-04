import { useCallback } from 'react'
import { Layers, MapPin, PlusSquare } from 'lucide-react'

import { ErrorBlock, LoadingBlock } from '@/components/layout/AsyncState'
import { PageHeader } from '@/components/common/PageHeader'
import { AdminTabs } from '@/components/common/AdminTabs'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useAsyncData } from '@/hooks/useAsyncData'
import { useI18n } from '@/i18n/I18nProvider'
import { api } from '@/lib/api'
import { mapEspaco, mapPredio } from '@/lib/adapters'
import { cn } from '@/lib/utils'

const HEADER_GRADIENTS = [
  'bg-gradient-to-br from-primary/20 via-primary-soft to-card',
  'bg-gradient-to-br from-secondary via-muted to-card',
  'bg-gradient-to-br from-success/20 via-card to-primary-soft',
]

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
        occupancy: rooms.length
          ? `${Math.round(((rooms.length - availableCount) / rooms.length) * 100)}%`
          : '0%',
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
    <div className="mx-auto w-full max-w-7xl">
      <PageHeader
        eyebrow={t('admin.buildings.eyebrow')}
        title={t('admin.buildings.title')}
        description={t('admin.buildings.description')}
        icon={Layers}
        actions={
          <Button>
            <PlusSquare className="h-4 w-4" />
            {t('admin.buildings.newBuilding')}
          </Button>
        }
      />
      <AdminTabs pair="spaces" />

      {loading && <LoadingBlock label={t('async.buildingsLoad')} />}
      {error && <ErrorBlock message={t('async.buildingsError')} />}

      {!loading && !error && data && (
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((building, index) => (
            <Card key={building.id} className="overflow-hidden p-0">
              <div className={cn('h-28 w-full', HEADER_GRADIENTS[index % HEADER_GRADIENTS.length])} />
              <div className="space-y-3 p-5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-base font-semibold">{building.name}</h3>
                    <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" />
                      {building.location}
                    </p>
                  </div>
                  <StatusBadge statusKey={building.statusKey} />
                </div>
                <Separator />
                <dl className="grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <dt className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                      {t('admin.buildings.code')}
                    </dt>
                    <dd className="mt-0.5 font-semibold">{building.code}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                      {t('admin.buildings.rooms')}
                    </dt>
                    <dd className="mt-0.5 font-semibold">{building.roomsCount}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                      {t('admin.buildings.occupancy')}
                    </dt>
                    <dd className="mt-0.5 font-semibold">{building.occupancy}</dd>
                  </div>
                </dl>
                <div className="flex gap-2 pt-1">
                  <Button variant="outline" size="sm" className="flex-1">
                    {t('admin.buildings.viewDetails')}
                  </Button>
                  <Button variant="ghost" size="sm">
                    {t('common.edit')}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </section>
      )}
    </div>
  )
}
