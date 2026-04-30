import { useCallback } from 'react'
import { NavLink } from 'react-router-dom'
import { ErrorBlock, LoadingBlock } from '../../components/layout/AsyncState'
import { PageIntro } from '../../components/layout/PageIntro'
import { Button, Card } from '../../components/layout/ui'
import { useAsyncData } from '../../hooks/useAsyncData'
import { useI18n } from '../../i18n/I18nProvider'
import { api } from '../../lib/api'

export function ApiStatusPage() {
  const { locale, t, tm } = useI18n()
  const loadApiStatus = useCallback(async () => {
    const healthStart = performance.now()
    const health = await api.getHealth()
    const healthLatency = Math.round(performance.now() - healthStart)

    const checks = await Promise.all([
      timedCheck('Espaços API', 'Spaces API', () => api.listEspacos()),
      timedCheck('Reservas API', 'Reservations API', () => api.listReservasAtivas()),
      timedCheck('Notificações API', 'Notifications API', () => api.listNotificacoes()),
    ])

    return {
      health,
      healthLatency,
      checks,
    }
  }, [])

  const { data, loading, error } = useAsyncData(loadApiStatus)

  return (
    <>
      <PageIntro title={t('admin.api.title')} description={t('admin.api.description')} />
      <AdminTabs />

      {loading ? <LoadingBlock label={t('async.apiLoad')} /> : null}
      {error ? <ErrorBlock message={t('async.apiError')} /> : null}

      {!loading && !error && data ? (
        <div className="grid gap-6 xl:grid-cols-12">
          <div className="space-y-6 xl:col-span-5">
            <Card>
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-ink">{t('admin.api.health')}</h2>
                <span className="rounded-full bg-mint/20 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-mint-deep">
                  {data.health.status ?? 'ok'}
                </span>
              </div>
              <div className="mt-6 space-y-4 text-sm">
                {data.checks.map((service) => (
                  <div key={service.key} className="flex items-center justify-between border-b border-stroke pb-4 last:border-b-0 last:pb-0">
                    <div>
                      <p className="font-semibold text-ink">{service.label[locale] ?? service.label['pt-BR']}</p>
                      <p className="mt-1 text-ink-muted">{t(service.statusKey)}</p>
                    </div>
                    <p className="font-semibold text-ink">{t('common.patterns.latencyMs', { value: service.latency })}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 rounded-2xl bg-panel px-4 py-3 text-sm text-ink-muted">
                {t('admin.api.healthResponse', { latency: data.healthLatency })}
              </div>
            </Card>
          </div>

          <div className="space-y-6 xl:col-span-7">
            <Card>
              <h2 className="text-2xl font-bold text-ink">{t('admin.api.systemSettings')}</h2>
              <div className="mt-6 space-y-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-ink">{t('admin.api.pushNotifications')}</p>
                    <p className="mt-1 text-sm leading-6 text-ink-muted">{t('admin.api.pushDescription')}</p>
                  </div>
                  <div className="flex h-7 w-12 items-center rounded-full bg-brand-red px-1">
                    <div className="h-5 w-5 translate-x-5 rounded-full bg-white" />
                  </div>
                </div>

                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-ink">{t('admin.api.language')}</span>
                  <select className="h-12 w-full rounded-2xl border border-stroke bg-panel px-4 text-sm outline-none transition focus:border-brand-red focus:ring-4 focus:ring-brand-red/10">
                    <option>Português (Brasil)</option>
                    <option>English (US)</option>
                  </select>
                </label>

                <div>
                  <p className="mb-3 text-sm font-bold text-ink">{t('admin.api.theme')}</p>
                  <div className="grid gap-3 md:grid-cols-3">
                    {tm('admin.api.themes').map((theme, index) => (
                      <button
                        key={theme}
                        className={`rounded-2xl border px-4 py-5 text-sm font-semibold transition ${
                          index === 0
                            ? 'border-brand-red bg-brand-blush text-brand-red'
                            : 'border-stroke bg-white text-ink-muted hover:text-ink'
                        }`}
                        type="button"
                      >
                        {theme}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-3 border-t border-stroke pt-6">
                <Button tone="secondary">{t('common.discard')}</Button>
                <Button>{t('common.save')}</Button>
              </div>
            </Card>

            <footer className="flex flex-col gap-3 rounded-3xl border border-stroke bg-white px-6 py-5 text-sm text-ink-muted md:flex-row md:items-center md:justify-between">
              <span className="font-semibold text-ink">{t('admin.api.portalVersion')}</span>
              <span>Version 2.4.1</span>
            </footer>
          </div>
        </div>
      ) : null}
    </>
  )
}

async function timedCheck(namePt, nameEn, request) {
  const start = performance.now()
  await request()
  const latency = Math.round(performance.now() - start)

  return {
    key: nameEn,
    label: { 'pt-BR': namePt, en: nameEn },
    latency,
    statusKey: latency < 150 ? 'common.statuses.healthy' : 'common.statuses.attention',
  }
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
