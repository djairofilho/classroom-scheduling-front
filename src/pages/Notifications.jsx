import { PageIntro } from '../components/layout/PageIntro'
import { Button, Card } from '../components/layout/ui'
import { recentNotifications } from '../lib/data'

export function NotificationsPage() {
  return (
    <>
      <PageIntro
        title="Notificacoes"
        description="Acompanhe atualizacoes de reservas e comunicados institucionais."
        actions={
          <div className="inline-flex rounded-full border border-stroke bg-panel p-1">
            <button className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-ink shadow-soft" type="button">
              Todas
            </button>
            <button className="rounded-full px-5 py-2 text-sm font-semibold text-ink-muted" type="button">
              Nao lidas
            </button>
            <button className="rounded-full px-5 py-2 text-sm font-semibold text-ink-muted" type="button">
              Lidas
            </button>
          </div>
        }
      />

      <div className="space-y-8">
        <section>
          <h2 className="mb-4 text-2xl font-bold text-ink">Hoje</h2>
          <div className="space-y-4">
            {recentNotifications.slice(0, 2).map((item) => (
              <NotificationCard key={item.id} notification={item} unread />
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-bold text-ink-muted">Ontem</h2>
          <NotificationCard
            notification={{
              id: 99,
              title: 'Cancelamento',
              body: 'Sua reserva para o Auditorio Principal foi cancelada por choque de horarios com evento da reitoria.',
              time: '14:20',
              tone: 'warning',
            }}
          />
        </section>
      </div>
    </>
  )
}

function NotificationCard({ notification, unread = false }) {
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
          {unread ? <Button tone="ghost">Marcar como lida</Button> : null}
          <Button tone="secondary">{notification.tone === 'warning' ? 'Nova reserva' : 'Ver reserva'}</Button>
        </div>
      </div>
    </Card>
  )
}
