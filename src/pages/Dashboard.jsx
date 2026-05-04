import { useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Bell, Building2, Calendar, ChevronRight, ListChecks, PlusSquare, Search, Sparkles } from 'lucide-react'

import { ErrorBlock, LoadingBlock } from '@/components/layout/AsyncState'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { QuickActionCard } from '@/components/common/QuickActionCard'
import { MeetingsList } from '@/components/common/MeetingsList'
import { MiniCalendar } from '@/components/common/MiniCalendar'
import { StatusBadge } from '@/components/common/StatusBadge'
import { useAsyncData } from '@/hooks/useAsyncData'
import { useI18n } from '@/i18n/I18nProvider'
import { api } from '@/lib/api'
import { createDashboardMetrics, mapEspaco, mapNotificacao, mapPredio, mapReserva } from '@/lib/adapters'
import { useAuth } from '@/lib/authContext'
import { getCurrentSolicitante } from '@/lib/currentUser'

const METRIC_ICONS = {
  calendar: Calendar,
  building: Building2,
  bell: Bell,
  layers: ListChecks,
}

export function DashboardPage() {
  const { t } = useI18n()
  const { user } = useAuth()

  const loadDashboard = useCallback(async () => {
    const currentSolicitante = await getCurrentSolicitante()

    const [reservasAtivas, espacos, notificacoes, predios] = await Promise.all([
      api.listReservasPorSolicitante(currentSolicitante.id),
      api.listEspacos(),
      api.listNotificacoesPorDestinatario(currentSolicitante.id),
      api.listPredios(),
    ])

    return {
      reservasAtivas: reservasAtivas
        .map(mapReserva)
        .filter((reserva) => !reserva.cancelada)
        .sort((first, second) => new Date(first.start).getTime() - new Date(second.start).getTime()),
      espacos: espacos.map(mapEspaco),
      notificacoes: notificacoes.map(mapNotificacao),
      predios: predios.map(mapPredio),
    }
  }, [])

  const { data, loading, error } = useAsyncData(loadDashboard)

  const metrics = useMemo(() => (data ? createDashboardMetrics(data) : []), [data])
  const nextBooking = data?.reservasAtivas?.[0] ?? null

  const highlightedDates = useMemo(() => {
    if (!data?.reservasAtivas) return []
    return data.reservasAtivas
      .map((r) => (r.start ? new Date(r.start).toISOString().slice(0, 10) : null))
      .filter(Boolean)
  }, [data])

  const greetingName = user?.email?.split('@')[0] ?? ''

  return (
    <div className="mx-auto w-full max-w-7xl">
      <div className="mb-6">
        <p className="text-sm text-muted-foreground">
          Olá, <span className="font-medium text-foreground">{greetingName}</span> 👋
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight md:text-3xl">{t('dashboard.title')}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t('dashboard.description')}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <QuickActionCard
          title={t('dashboard.viewAvailable')}
          description={t('search.description')}
          icon={Search}
          to="/espacos"
          variant="primary"
        />
        <QuickActionCard
          title={t('dashboard.newReservation')}
          description={t('bookingForm.description')}
          icon={PlusSquare}
          to="/reservas/nova"
          variant="muted"
        />
      </div>

      {loading && (
        <div className="mt-6">
          <LoadingBlock label={t('async.dashboardLoad')} />
        </div>
      )}
      {error && (
        <div className="mt-6">
          <ErrorBlock message={t('async.dashboardError')} />
        </div>
      )}

      {!loading && !error && data && (
        <>
          <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {metrics.map((item) => {
              const Icon = METRIC_ICONS[item.icon] ?? Calendar
              return (
                <Card key={item.labelKey} className="p-5">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      {t(item.labelKey)}
                    </p>
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <p className="mt-3 text-3xl font-bold tracking-tight">{item.value}</p>
                </Card>
              )
            })}
          </section>

          <section className="mt-6 grid gap-4 lg:grid-cols-12">
            <Card className="p-5 lg:col-span-4">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold">{t('bookings.title')}</h2>
                <Link to="/reservas" className="text-xs font-medium text-primary hover:underline">
                  {t('common.viewAll')}
                </Link>
              </div>
              <MeetingsList reservas={data.reservasAtivas.slice(0, 4)} loading={loading} />
            </Card>

            <Card className="p-5 lg:col-span-4">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold">{t('dashboard.nextBooking')}</h2>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </div>
              <MiniCalendar highlightedDates={highlightedDates} />
            </Card>

            <div className="space-y-4 lg:col-span-4">
              <Card className="overflow-hidden p-5">
                <div className="mb-2 flex items-center justify-between">
                  <h2 className="text-sm font-semibold">{t('dashboard.nextBooking')}</h2>
                  <ListChecks className="h-4 w-4 text-muted-foreground" />
                </div>
                {nextBooking ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-base font-semibold">{nextBooking.space}</p>
                      <StatusBadge statusKey={nextBooking.statusKey} />
                    </div>
                    <p className="text-sm text-muted-foreground">{nextBooking.building}</p>
                    <p className="text-sm">
                      <span className="font-medium">{nextBooking.date}</span>
                      <span className="mx-1.5 text-muted-foreground">·</span>
                      {nextBooking.time}
                    </p>
                    <p className="line-clamp-2 text-xs text-muted-foreground">{nextBooking.reason}</p>
                    <Button asChild variant="outline" size="sm" className="mt-2 w-full">
                      <Link to={nextBooking.espacoId ? `/espacos/${nextBooking.espacoId}` : '/reservas'}>
                        {t('dashboard.fullDetails')}
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">{t('dashboard.noActiveReservations')}</p>
                )}
              </Card>

              <Card
                style={{ background: 'var(--gradient-primary)' }}
                className="relative overflow-hidden border-0 p-5 text-primary-foreground"
              >
                <Sparkles className="absolute -right-3 -top-3 h-24 w-24 opacity-15" />
                <h3 className="text-base font-semibold">{t('shell.brand')}</h3>
                <p className="mt-1 text-sm text-white/85">{t('dashboard.nextBookingSummary')}</p>
                <Link
                  to="/espacos"
                  className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-sm font-medium transition hover:bg-white/25"
                >
                  {t('dashboard.viewAvailable')}
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Card>
            </div>
          </section>

          <section className="mt-6">
            <Card className="p-5">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold">{t('dashboard.recent')}</h2>
                <Link to="/notificacoes" className="text-xs font-medium text-primary hover:underline">
                  {t('common.viewAll')}
                </Link>
              </div>
              {data.notificacoes.length === 0 ? (
                <p className="text-sm text-muted-foreground">—</p>
              ) : (
                <ul className="space-y-3">
                  {data.notificacoes.slice(0, 3).map((item) => (
                    <li key={item.id} className="flex gap-3 rounded-xl border bg-card p-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
                        <Bell className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold">{t(item.titleKey)}</p>
                        <p className="mt-0.5 text-sm text-muted-foreground">{item.body}</p>
                        <p className="mt-1 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground/80">
                          {item.time}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </section>
        </>
      )}

      {loading && !data && (
        <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 w-full rounded-lg" />
          ))}
        </section>
      )}
    </div>
  )
}
