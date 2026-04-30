import { Link } from 'react-router-dom'
import { PageIntro } from '../components/layout/PageIntro'
import { Badge, Button, Card } from '../components/layout/ui'
import { metrics, recentNotifications, spaces } from '../lib/data'
import { AppIcon } from '../lib/icons'

export function DashboardPage() {
  const nextBooking = spaces[0]

  return (
    <>
      <PageIntro
        eyebrow="Ola, Marina"
        title="Agendamento de salas"
        description="Uma visao objetiva do portal para acompanhar disponibilidade, proximas reservas e alertas operacionais."
        actions={
          <>
            <Button tone="secondary">Ver espacos disponiveis</Button>
            <Button>Nova reserva</Button>
          </>
        }
      />

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((item) => (
          <Card key={item.label} className="space-y-5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-ink-muted">{item.label}</p>
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
              <h2 className="text-3xl font-bold tracking-tight text-ink">Proxima reserva</h2>
              <p className="mt-2 text-sm text-ink-muted">Resumo do seu compromisso mais proximo.</p>
            </div>
            <Badge tone="danger">Confirmada</Badge>
          </div>

          <div className="mt-8 grid gap-6 border-t border-stroke pt-8 md:grid-cols-2">
            <div>
              <p className="text-sm text-ink-muted">Localizacao</p>
              <p className="mt-2 text-3xl font-bold text-ink">{nextBooking.name}</p>
              <p className="mt-1 text-base text-ink-muted">
                {nextBooking.building}, {nextBooking.floor}
              </p>
            </div>
            <div>
              <p className="text-sm text-ink-muted">Horario e motivo</p>
              <p className="mt-2 text-3xl font-bold text-ink">14:00 - 16:00</p>
              <p className="mt-1 text-base text-ink-muted">Aula de projeto interdisciplinar</p>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <Link className="inline-flex items-center gap-2 text-sm font-bold text-brand-red" to={`/espacos/${nextBooking.id}`}>
              Ver detalhes completos
              <AppIcon name="chevron-right" className="h-4 w-4" />
            </Link>
          </div>
        </Card>

        <Card className="bg-panel xl:col-span-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-ink">Recentes</h2>
            <button className="text-sm font-semibold text-ink-muted">Ver tudo</button>
          </div>

          <div className="mt-6 space-y-4">
            {recentNotifications.map((item) => (
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
                    <p className="font-semibold text-ink">{item.title}</p>
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
  )
}
