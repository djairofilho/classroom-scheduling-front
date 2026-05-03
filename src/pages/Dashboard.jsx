import { useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ErrorBlock, LoadingBlock } from '../components/layout/AsyncState'
import { PageIntro } from '../components/layout/PageIntro'
import { Badge, Card } from '../components/layout/ui'
import { useAsyncData } from '../hooks/useAsyncData'
import { useI18n } from '../i18n/I18nProvider'
import { api } from '../lib/api'
import { createDashboardMetrics, mapEspaco, mapNotificacao, mapPredio, mapReserva } from '../lib/adapters'
import { useAuth } from '../lib/authContext'
import { getCurrentSolicitante } from '../lib/currentUser'
import { AppIcon } from '../lib/icons'

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

  const metrics = useMemo(() => {
    if (!data) return []
    return createDashboardMetrics(data)
  }, [data])

  const nextBooking = data?.reservasAtivas?.[0] ?? null

  return (
    <>
      <PageIntro
        eyebrow={t('dashboard.greeting', { name: user.email })}
        title={t('dashboard.title')}
        description={t('dashboard.description')}
        actions={
          <>
            <Link className="inline-flex items-center justify-center rounded-2xl border border-stroke bg-white px-5 py-3 text-sm font-semibold text-ink transition hover:bg-warm-stone" to="/espacos">
              {t('dashboard.viewAvailable')}
            </Link>
            <Link className="inline-flex items-center justify-center rounded-2xl bg-brand-red px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-red-dark" to="/reservas/nova">
              {t('dashboard.newReservation')}
            </Link>
          </>
        }
      />

      {loading ? <LoadingBlock label={t('async.dashboardLoad')} /> : null}
      {error ? <ErrorBlock message={t('async.dashboardError')} /> : null}

      {!loading && !error && data ? (
        <>
          <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {metrics.map((item) => (
              <Card key={item.labelKey} className="space-y-5">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-ink-muted">{t(item.labelKey)}</p>
                  <AppIcon
                    name={item.icon}
                    className={[
                      'h-5 w-5',
                      item.tone === 'primary'
                        ? 'text-brand-red'
                        : item.tone === 'secondary'
                          ? 'text-navy'
                          : item.tone === 'tertiary'
                            ? 'text-sky-700'
                            : 'text-ink-muted',
                    ].join(' ')}
                  />
                </div>
                <p className="text-5xl font-extrabold tracking-tight text-ink">{item.value}</p>
              </Card>
            ))}
          </section>

          <section className="mt-8 grid gap-6 xl:grid-cols-12">
            <Card className="xl:col-span-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-bold tracking-tight text-ink">{t('dashboard.nextBooking')}</h2>
                  <p className="mt-2 text-sm text-ink-muted">{t('dashboard.nextBookingSummary')}</p>
                </div>
                <Badge tone="danger">{nextBooking ? t('common.statuses.confirmed') : t('common.statuses.noSchedule')}</Badge>
              </div>

              <div className="mt-8 grid gap-6 border-t border-stroke pt-8 md:grid-cols-2">
                <div>
                  <p className="text-sm text-ink-muted">{t('dashboard.location')}</p>
                  <p className="mt-2 text-3xl font-bold text-ink">{nextBooking?.space ?? '--'}</p>
                  <p className="mt-1 text-base text-ink-muted">{nextBooking?.building ?? t('dashboard.noLocation')}</p>
                </div>
                <div>
                  <p className="text-sm text-ink-muted">{t('dashboard.timeReason')}</p>
                  <p className="mt-2 text-3xl font-bold text-ink">{nextBooking?.time ?? '--'}</p>
                  <p className="mt-1 text-base text-ink-muted">{nextBooking?.reason ?? t('dashboard.noActiveReservations')}</p>
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <Link className="inline-flex items-center gap-2 text-sm font-bold text-brand-red" to={nextBooking?.espacoId ? `/espacos/${nextBooking.espacoId}` : '/espacos'}>
                  {t('dashboard.fullDetails')}
                  <AppIcon name="chevron-right" className="h-4 w-4" />
                </Link>
              </div>
            </Card>

            <Card className="bg-panel xl:col-span-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-ink">{t('dashboard.recent')}</h2>
                <Link className="text-sm font-semibold text-ink-muted" to="/notificacoes">
                  {t('common.viewAll')}
                </Link>
              </div>

              <div className="mt-6 space-y-4">
                {data.notificacoes.slice(0, 3).map((item) => (
                  <article key={item.id} className="rounded-2xl border border-stroke bg-white p-4">
                    <div className="flex gap-3">
                      <span
                        className={[
                          'mt-1 h-2.5 w-2.5 rounded-full',
                          item.tone === 'primary'
                            ? 'bg-brand-red'
                            : item.tone === 'warning'
                              ? 'bg-amber-500'
                              : 'bg-navy',
                        ].join(' ')}
                      />
                      <div>
                        <p className="font-semibold text-ink">{t(item.titleKey)}</p>
                        <p className="mt-1 text-sm leading-6 text-ink-muted">{item.body}</p>
                        <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-ink-muted/80">{item.time}</p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </Card>
          </section>
        </>
      ) : null}
    </>
  )
}
