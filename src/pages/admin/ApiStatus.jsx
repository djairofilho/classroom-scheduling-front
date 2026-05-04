import { useCallback, useState } from 'react'
import { CheckCircle2, RefreshCw, Server } from 'lucide-react'

import { ErrorBlock, LoadingBlock } from '@/components/layout/AsyncState'
import { PageHeader } from '@/components/common/PageHeader'
import { AdminTabs } from '@/components/common/AdminTabs'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { useAsyncData } from '@/hooks/useAsyncData'
import { useI18n } from '@/i18n/I18nProvider'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'

export function ApiStatusPage() {
  const { locale, t, tm } = useI18n()
  const [pushEnabled, setPushEnabled] = useState(true)
  const [themeIndex, setThemeIndex] = useState(0)

  const loadApiStatus = useCallback(async () => {
    const healthStart = performance.now()
    const health = await api.getHealth()
    const healthLatency = Math.round(performance.now() - healthStart)

    const checks = await Promise.all([
      timedCheck('Espaços API', 'Spaces API', () => api.listEspacos()),
      timedCheck('Reservas API', 'Reservations API', () => api.listReservasAtivas()),
      timedCheck('Notificações API', 'Notifications API', () => api.listNotificacoes()),
    ])

    return { health, healthLatency, checks }
  }, [])

  const { data, loading, error } = useAsyncData(loadApiStatus)

  return (
    <div className="mx-auto w-full max-w-7xl">
      <PageHeader title={t('admin.api.title')} description={t('admin.api.description')} icon={Server} />
      <AdminTabs />

      {loading && <LoadingBlock label={t('async.apiLoad')} />}
      {error && <ErrorBlock message={t('async.apiError')} />}

      {!loading && !error && data && (
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-5">
            <Card className="p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold">{t('admin.api.health')}</h2>
                <StatusBadge tone="success" label={data.health?.status ?? 'OK'} />
              </div>
              <Separator className="my-4" />
              <ul className="space-y-3 text-sm">
                {data.checks.map((service) => (
                  <li key={service.key} className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium">{service.label[locale] ?? service.label['pt-BR']}</p>
                      <p className="text-xs text-muted-foreground">{t(service.statusKey)}</p>
                    </div>
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-success">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {t('common.patterns.latencyMs', { value: service.latency })}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 rounded-md bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                {t('admin.api.healthResponse', { latency: data.healthLatency })}
              </div>
              <Button variant="outline" size="sm" className="mt-4 w-full">
                <RefreshCw className="h-4 w-4" />
                {t('admin.api.testConnection')}
              </Button>
            </Card>
          </div>

          <div className="space-y-6 lg:col-span-7">
            <Card className="p-5">
              <h2 className="text-base font-semibold">{t('admin.api.systemSettings')}</h2>
              <Separator className="my-4" />
              <div className="space-y-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <Label htmlFor="api-push" className="text-sm font-medium">
                      {t('admin.api.pushNotifications')}
                    </Label>
                    <p className="mt-1 text-sm text-muted-foreground">{t('admin.api.pushDescription')}</p>
                  </div>
                  <Switch id="api-push" checked={pushEnabled} onCheckedChange={setPushEnabled} />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="api-language">{t('admin.api.language')}</Label>
                  <select
                    id="api-language"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    defaultValue={locale}
                  >
                    <option value="pt-BR">Português (Brasil)</option>
                    <option value="en">English (US)</option>
                  </select>
                </div>

                <div>
                  <p className="mb-2 text-sm font-medium">{t('admin.api.theme')}</p>
                  <div className="grid gap-2 md:grid-cols-3">
                    {tm('admin.api.themes').map((theme, index) => (
                      <button
                        key={theme}
                        type="button"
                        onClick={() => setThemeIndex(index)}
                        className={cn(
                          'rounded-md border px-3 py-3 text-sm font-medium transition',
                          themeIndex === index
                            ? 'border-primary bg-primary-soft text-primary'
                            : 'border-input bg-background text-muted-foreground hover:text-foreground',
                        )}
                      >
                        {theme}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2 border-t pt-4">
                <Button variant="outline" size="sm">
                  {t('common.discard')}
                </Button>
                <Button size="sm">{t('common.save')}</Button>
              </div>
            </Card>

            <footer className="flex flex-col gap-2 rounded-md border bg-card px-4 py-3 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
              <span className="font-medium text-foreground">{t('admin.api.portalVersion')}</span>
              <span>v2.4.1</span>
            </footer>
          </div>
        </div>
      )}
    </div>
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
