import { useCallback, useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Building2, MapPin, Users } from 'lucide-react'

import { ErrorBlock, LoadingBlock } from '@/components/layout/AsyncState'
import { PageHeader } from '@/components/common/PageHeader'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useAsyncData } from '@/hooks/useAsyncData'
import { useI18n } from '@/i18n/I18nProvider'
import { api } from '@/lib/api'
import { mapEspaco, mapReserva } from '@/lib/adapters'
import { useAuth } from '@/lib/authContext'
import { cn } from '@/lib/utils'

const SLOT_CLASS = {
  reservation: 'bg-primary text-primary-foreground',
  event: 'bg-secondary text-secondary-foreground',
  maintenance: 'bg-destructive/15 text-destructive',
  free: 'border bg-card text-muted-foreground',
}

export function SpaceDetailsPage() {
  const { t, tm } = useI18n()
  const { spaceId } = useParams()
  const { user, isAdmin } = useAuth()

  const loadDetails = useCallback(async () => {
    const reservationsRequest = isAdmin ? api.listReservas() : api.listReservasPorSolicitante(user.id)
    const [espaco, reservas] = await Promise.all([api.getEspaco(spaceId), reservationsRequest])

    return {
      space: mapEspaco(espaco),
      reservations: reservas.map(mapReserva),
    }
  }, [isAdmin, spaceId, user.id])

  const { data, loading, error } = useAsyncData(loadDetails)

  const spaceReservations = useMemo(() => {
    if (!data) return []
    return data.reservations.filter((reservation) => reservation.espacoId === Number(spaceId)).slice(0, 6)
  }, [data, spaceId])

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-7xl">
        <LoadingBlock label={t('async.detailsLoad')} />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="mx-auto w-full max-w-7xl">
        <ErrorBlock message={t('async.detailsError')} />
      </div>
    )
  }

  const { space } = data

  return (
    <div className="mx-auto w-full max-w-7xl">
      <div className="mb-4">
        <Button asChild variant="ghost" size="sm" className="-ml-2">
          <Link to="/espacos">
            <ArrowLeft className="h-4 w-4" />
            {t('bookings.back')}
          </Link>
        </Button>
      </div>
      <PageHeader title={space.name} description={space.building} icon={Building2} />

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-8">
          <Card
            className="relative flex h-56 items-center justify-center overflow-hidden border-0 md:h-72"
            style={{ background: 'var(--gradient-soft)' }}
          >
            <Building2 className="h-24 w-24 text-primary/30" />
            <div className="absolute right-4 top-4">
              <StatusBadge statusKey={space.statusKey} />
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="text-base font-semibold">{t('spaceDetails.weeklySchedule')}</h3>
            <Separator className="my-3" />
            <div className="overflow-hidden rounded-lg border">
              <div className="grid grid-cols-6 bg-muted text-center text-[0.7rem] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                {tm('spaceDetails.days').map((day) => (
                  <div key={day} className="border-r px-2 py-2 last:border-r-0">
                    {day}
                  </div>
                ))}
              </div>
              {space.weeklySchedule.map((row, index) => (
                <div key={index} className="grid grid-cols-6 border-t">
                  {row.map((slot, slotIndex) => (
                    <div key={`${index}-${slotIndex}`} className="border-r p-1.5 last:border-r-0">
                      <div
                        className={cn(
                          'flex h-12 items-center justify-center rounded-md text-center text-[0.7rem] font-medium',
                          SLOT_CLASS[slot] ?? SLOT_CLASS.free,
                        )}
                      >
                        {t(`spaceDetails.schedule.${slot}`)}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="text-base font-semibold">{t('spaceDetails.upcomingReservations')}</h3>
            <Separator className="my-3" />
            {spaceReservations.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t('spaceDetails.noReservations')}</p>
            ) : (
              <ul className="divide-y">
                {spaceReservations.map((event) => (
                  <li key={event.id} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{event.reason}</p>
                      <p className="text-sm text-muted-foreground">{event.solicitanteNome}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{event.date}</p>
                      <p className="text-xs text-muted-foreground">{event.time}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <div className="space-y-6 lg:col-span-4 lg:sticky lg:top-20 lg:self-start">
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold">{t('spaceDetails.panelTitle')}</h3>
              <StatusBadge statusKey={space.statusKey} />
            </div>
            <Separator className="my-3" />
            <dl className="space-y-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <dt className="inline-flex items-center gap-2 text-muted-foreground">
                  <Users className="h-4 w-4" />
                  {t('spaceDetails.capacity')}
                </dt>
                <dd className="font-semibold">{space.capacity}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="inline-flex items-center gap-2 text-muted-foreground">
                  <Building2 className="h-4 w-4" />
                  {t('spaceDetails.type')}
                </dt>
                <dd className="font-semibold">{t(space.typeKey)}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="inline-flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  Prédio
                </dt>
                <dd className="font-semibold">{space.building}</dd>
              </div>
            </dl>

            {space.maintenanceReason && (
              <p className="mt-4 rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
                {space.maintenanceReason}
              </p>
            )}
          </Card>

          <Card className="p-5">
            <h3 className="text-base font-semibold">{t('spaceDetails.resources')}</h3>
            <Separator className="my-3" />
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{t('spaceDetails.featureCapacity', { capacity: space.capacity })}</Badge>
              {space.buildingCode && (
                <Badge variant="secondary">{t('spaceDetails.featureCode', { code: space.buildingCode })}</Badge>
              )}
              {space.maintenanceReason && (
                <Badge variant="destructive">{t('spaceDetails.featureUnavailable')}</Badge>
              )}
            </div>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              {t('spaceDetails.generatedDescription', {
                building: space.building,
                capacity: space.capacity,
              })}
            </p>
          </Card>

          <div className="space-y-2">
            <Button
              asChild
              size="lg"
              className="w-full"
              disabled={space.statusTone === 'danger'}
            >
              <Link to={`/reservas/nova?espacoId=${space.id}`}>{t('spaceDetails.reserveThisSpace')}</Link>
            </Button>
            {isAdmin && (
              <Button variant="outline" className="w-full">
                {t('spaceDetails.markUnavailable')}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
