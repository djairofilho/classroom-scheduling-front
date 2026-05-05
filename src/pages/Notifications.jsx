import { useCallback, useMemo, useState } from 'react'
import { AlertTriangle, Bell, CheckCircle, Info } from 'lucide-react'

import { ErrorBlock, LoadingBlock } from '@/components/layout/AsyncState'
import { PageHeader } from '@/components/common/PageHeader'
import { EmptyState } from '@/components/common/EmptyState'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAsyncData } from '@/hooks/useAsyncData'
import { useI18n } from '@/i18n/I18nProvider'
import { api } from '@/lib/api'
import { mapNotificacao } from '@/lib/adapters'
import { getCurrentSolicitante } from '@/lib/currentUser'
import { cn } from '@/lib/utils'

const ACCENT = {
  primary: { border: 'border-l-primary', icon: Bell, bg: 'bg-primary-soft text-primary' },
  warning: { border: 'border-l-warning', icon: AlertTriangle, bg: 'bg-warning/10 text-warning' },
  secondary: { border: 'border-l-secondary', icon: Info, bg: 'bg-secondary text-secondary-foreground' },
  success: { border: 'border-l-success', icon: CheckCircle, bg: 'bg-success/10 text-success' },
}

export function NotificationsPage() {
  const { t } = useI18n()
  const [tab, setTab] = useState('all')

  const loadNotifications = useCallback(async () => {
    const currentSolicitante = await getCurrentSolicitante()
    const notificacoes = await api.listNotificacoesPorDestinatario(currentSolicitante.id)
    return notificacoes.map(mapNotificacao)
  }, [])

  const { data, loading, error, setData } = useAsyncData(loadNotifications)

  const buckets = {
    all: data ?? [],
    unread: (data ?? []).filter((item) => !item.lida),
    read: (data ?? []).filter((item) => item.lida),
  }

  const [renderedAt] = useState(() => Date.now())
  const grouped = useMemo(() => {
    const today = []
    const previous = []
    const list = buckets[tab]
    list.forEach((item) => {
      const sentAt = new Date(item.enviadaEm).getTime()
      if (Number.isFinite(sentAt) && renderedAt - sentAt < 24 * 60 * 60 * 1000) today.push(item)
      else previous.push(item)
    })
    return { today, previous }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, tab, renderedAt])

  async function handleMarkAsRead(notificationId) {
    const updated = await api.marcarNotificacaoComoLida(notificationId)
    const mapped = mapNotificacao(updated)
    setData((current) => current.map((item) => (item.id === mapped.id ? mapped : item)))
  }

  return (
    <div className="mx-auto w-full max-w-7xl">
      <PageHeader title={t('notifications.title')} description={t('notifications.description')} />

      {loading && <LoadingBlock label={t('async.notificationsLoad')} />}
      {error && <ErrorBlock message={t('async.notificationsError')} />}

      {!loading && !error && data && (
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="all">
              {t('common.all')} ({buckets.all.length})
            </TabsTrigger>
            <TabsTrigger value="unread">
              {t('common.unread')} ({buckets.unread.length})
            </TabsTrigger>
            <TabsTrigger value="read">
              {t('common.read')} ({buckets.read.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={tab} className="mt-4 space-y-6">
            {buckets[tab].length === 0 ? (
              <EmptyState title="Nenhuma notificação" description="Você está em dia." icon={Bell} />
            ) : (
              <>
                {grouped.today.length > 0 && (
                  <section>
                    <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      {t('common.today')}
                    </h2>
                    <div className="space-y-3">
                      {grouped.today.map((item) => (
                        <NotificationItem key={item.id} item={item} onMarkAsRead={handleMarkAsRead} />
                      ))}
                    </div>
                  </section>
                )}
                {grouped.previous.length > 0 && (
                  <section>
                    <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      {t('common.previous')}
                    </h2>
                    <div className="space-y-3">
                      {grouped.previous.map((item) => (
                        <NotificationItem key={item.id} item={item} onMarkAsRead={handleMarkAsRead} />
                      ))}
                    </div>
                  </section>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}

function NotificationItem({ item, onMarkAsRead }) {
  const { t } = useI18n()
  const accent = ACCENT[item.tone] ?? ACCENT.secondary
  const Icon = accent.icon

  return (
    <Card className={cn('flex flex-col gap-3 border-l-4 p-4 md:flex-row md:items-center', accent.border)}>
      <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-full', accent.bg)}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-[0.16em] text-primary">{t(item.titleKey)}</span>
          <span className="text-xs text-muted-foreground">·</span>
          <span className="text-xs text-muted-foreground">{item.time}</span>
          {!item.lida && <span className="ml-1 h-2 w-2 rounded-full bg-primary" aria-hidden="true" />}
        </div>
        <p className="mt-1 text-sm font-medium">{item.body}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {!item.lida && (
          <Button variant="ghost" size="sm" onClick={() => onMarkAsRead(item.id)}>
            {t('notifications.markAsRead')}
          </Button>
        )}
      </div>
    </Card>
  )
}
