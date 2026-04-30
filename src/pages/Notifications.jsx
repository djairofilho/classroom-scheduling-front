import { useCallback, useMemo, useState } from 'react'
import { ErrorBlock, LoadingBlock } from '../components/layout/AsyncState'
import { PageIntro } from '../components/layout/PageIntro'
import { Button, Card } from '../components/layout/ui'
import { useAsyncData } from '../hooks/useAsyncData'
import { api } from '../lib/api'
import { mapNotificacao } from '../lib/adapters'

export function NotificationsPage() {
  const [tab, setTab] = useState('Todas')
  const loadNotifications = useCallback(async () => {
    const notificacoes = await api.listNotificacoes()
    return notificacoes.map(mapNotificacao)
  }, [])

  const { data, loading, error, setData } = useAsyncData(loadNotifications)

  const filteredNotifications = useMemo(() => {
    const notifications = data ?? []
    if (tab === 'Nao lidas') return notifications.filter((item) => !item.lida)
    if (tab === 'Lidas') return notifications.filter((item) => item.lida)
    return notifications
  }, [data, tab])

  const groupedNotifications = useMemo(() => {
    const today = []
    const previous = []

    filteredNotifications.forEach((item) => {
      if (item.time.includes('min') || item.time.includes('hora')) {
        today.push(item)
      } else {
        previous.push(item)
      }
    })

    return { today, previous }
  }, [filteredNotifications])

  async function handleMarkAsRead(notificationId) {
    const updated = await api.marcarNotificacaoComoLida(notificationId)
    const mapped = mapNotificacao(updated)
    setData((current) => current.map((item) => (item.id === mapped.id ? mapped : item)))
  }

  return (
    <>
      <PageIntro
        title="Notificacoes"
        description="Acompanhe atualizacoes de reservas e comunicados institucionais."
        actions={
          <div className="inline-flex rounded-full border border-stroke bg-panel p-1">
            <button className={`rounded-full px-5 py-2 text-sm font-semibold ${tab === 'Todas' ? 'bg-white text-ink shadow-soft' : 'text-ink-muted'}`} onClick={() => setTab('Todas')} type="button">
              Todas
            </button>
            <button className={`rounded-full px-5 py-2 text-sm font-semibold ${tab === 'Nao lidas' ? 'bg-white text-ink shadow-soft' : 'text-ink-muted'}`} onClick={() => setTab('Nao lidas')} type="button">
              Nao lidas
            </button>
            <button className={`rounded-full px-5 py-2 text-sm font-semibold ${tab === 'Lidas' ? 'bg-white text-ink shadow-soft' : 'text-ink-muted'}`} onClick={() => setTab('Lidas')} type="button">
              Lidas
            </button>
          </div>
        }
      />

      {loading ? <LoadingBlock label="Carregando notificacoes..." /> : null}
      {error ? <ErrorBlock message="Nao foi possivel carregar as notificacoes da API." /> : null}

      {!loading && !error ? (
        <div className="space-y-8">
          <section>
            <h2 className="mb-4 text-2xl font-bold text-ink">Hoje</h2>
            <div className="space-y-4">
              {groupedNotifications.today.map((item) => (
                <NotificationCard key={item.id} notification={item} unread={!item.lida} onMarkAsRead={handleMarkAsRead} />
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-bold text-ink-muted">Anteriores</h2>
            <div className="space-y-4">
              {groupedNotifications.previous.map((item) => (
                <NotificationCard key={item.id} notification={item} unread={!item.lida} onMarkAsRead={handleMarkAsRead} />
              ))}
            </div>
          </section>
        </div>
      ) : null}
    </>
  )
}

function NotificationCard({ notification, unread = false, onMarkAsRead }) {
  const accentClass =
    notification.tone === 'primary'
      ? 'border-l-brand-red'
      : notification.tone === 'warning'
        ? 'border-l-amber-500'
        : 'border-l-navy'

  return (
    <Card className={`border-l-4 ${accentClass}`}>
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-blush text-brand-red">
          {notification.tone === 'warning' ? '!' : 'i'}
        </div>
        <div className="flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-3">
            <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-brand-red">{notification.title}</span>
            <span className="h-1 w-1 rounded-full bg-ink-muted" />
            <span className="text-sm text-ink-muted">{notification.time}</span>
            {unread ? <span className="h-2 w-2 rounded-full bg-brand-red" /> : null}
          </div>
          <p className="text-base font-semibold text-ink">{notification.body}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {unread ? <Button tone="ghost" onClick={() => onMarkAsRead(notification.id)}>Marcar como lida</Button> : null}
          <Button tone="secondary">{notification.tone === 'warning' ? 'Nova reserva' : 'Ver reserva'}</Button>
        </div>
      </div>
    </Card>
  )
}
