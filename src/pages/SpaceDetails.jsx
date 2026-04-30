import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Badge, Button, Card } from '../components/layout/ui'
import { spaces } from '../lib/data'
import { AppIcon } from '../lib/icons'

export function SpaceDetailsPage() {
  const { spaceId } = useParams()

  const space = useMemo(
    () => spaces.find((item) => item.id === spaceId) ?? spaces[0],
    [spaceId],
  )

  return (
    <div className="relative min-h-[760px] overflow-hidden rounded-[32px] bg-white shadow-soft">
      <div className="absolute inset-0 bg-brand-paper" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(229,5,5,0.08),_transparent_38%)]" />

      <div className="relative grid min-h-[760px] lg:grid-cols-[1fr_560px]">
        <div className="border-r border-stroke p-8 lg:p-10">
          <div className="max-w-3xl opacity-35 blur-[1.6px]">
            <p className="text-sm text-ink-muted">Resultados da busca</p>
            <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-ink">Espacos encontrados</h1>
            <div className="mt-10 grid gap-6 xl:grid-cols-2">
              {spaces.map((item) => (
                <Card key={item.id} className="h-64 bg-white/90" />
              ))}
            </div>
          </div>
        </div>

        <aside className="relative z-10 flex h-full flex-col bg-white">
          <div className="flex items-center justify-between border-b border-stroke px-8 py-6">
            <div>
              <p className="text-sm text-ink-muted">Detalhe do espaco</p>
              <h2 className="mt-1 text-2xl font-bold text-ink">{space.name}</h2>
            </div>
            <Link className="rounded-full border border-stroke p-3 text-ink-muted transition hover:border-brand-red/30 hover:text-brand-red" to="/espacos">
              <AppIcon name="x" className="h-4 w-4" />
            </Link>
          </div>

          <div className="flex-1 space-y-8 overflow-y-auto px-8 py-8">
            <div>
              <Badge tone={space.statusTone === 'success' ? 'success' : 'danger'}>{space.status}</Badge>
              <h1 className="mt-4 text-5xl font-extrabold tracking-tight text-ink">{space.name}</h1>
              <p className="mt-3 text-base text-ink-muted">{space.building}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-panel">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-ink-muted">Capacidade</p>
                <p className="mt-3 text-3xl font-bold text-ink">{space.capacity}</p>
              </Card>
              <Card className="bg-panel">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-ink-muted">Tipo</p>
                <p className="mt-3 text-3xl font-bold text-ink">{space.type}</p>
              </Card>
            </div>

            <section>
              <h3 className="text-2xl font-bold text-ink">Horario semanal</h3>
              <div className="mt-4 overflow-hidden rounded-3xl border border-stroke">
                <div className="grid grid-cols-6 bg-panel text-center text-xs font-bold uppercase tracking-[0.18em] text-ink-muted">
                  {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'].map((day) => (
                    <div key={day} className="border-r border-stroke px-2 py-3 last:border-r-0">
                      {day}
                    </div>
                  ))}
                </div>
                {space.weeklySchedule.map((row, index) => (
                  <div key={index} className="grid grid-cols-6 border-t border-stroke">
                    {row.map((slot) => (
                      <div key={`${index}-${slot}`} className="border-r border-stroke p-2 last:border-r-0">
                        <div
                          className={[
                            'flex h-16 items-center justify-center rounded-xl text-center text-xs font-semibold',
                            slot === 'Reserva'
                              ? 'bg-navy text-white'
                              : slot === 'Evento'
                                ? 'bg-sky-soft text-navy'
                                : slot === 'Manutencao'
                                  ? 'bg-brand-red/12 text-brand-red'
                                  : 'border border-stroke bg-brand-paper text-ink-muted',
                          ].join(' ')}
                        >
                          {slot}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h3 className="text-2xl font-bold text-ink">Recursos</h3>
              <div className="mt-4 flex flex-wrap gap-3">
                {space.features.map((feature) => (
                  <Badge key={feature} tone="info">
                    {feature}
                  </Badge>
                ))}
              </div>
              <p className="mt-4 text-sm leading-7 text-ink-muted">{space.description}</p>
            </section>

            <section>
              <h3 className="text-2xl font-bold text-ink">Proximas reservas</h3>
              <div className="mt-4 overflow-hidden rounded-3xl border border-stroke">
                {space.nextEvents.map((event, index) => (
                  <div
                    key={event.title}
                    className={`flex items-center justify-between gap-4 px-5 py-4 ${index > 0 ? 'border-t border-stroke' : ''}`}
                  >
                    <div>
                      <p className="font-semibold text-ink">{event.title}</p>
                      <p className="text-sm text-ink-muted">{event.owner}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-ink">{event.date}</p>
                      <p className="text-sm text-ink-muted">{event.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="border-t border-stroke bg-white px-8 py-6">
            <div className="flex flex-col gap-3">
              <Button className="w-full">Reservar este espaco</Button>
              <div className="grid grid-cols-2 gap-3">
                <Button tone="secondary">Editar espaco</Button>
                <Button tone="ghost">Marcar indisponivel</Button>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
