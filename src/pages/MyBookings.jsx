import { useCallback, useState } from 'react'
import { ErrorBlock, LoadingBlock } from '../components/layout/AsyncState'
import { PageIntro } from '../components/layout/PageIntro'
import { Badge, Button, Card } from '../components/layout/ui'
import { useAsyncData } from '../hooks/useAsyncData'
import { api } from '../lib/api'
import { mapReserva } from '../lib/adapters'

export function MyBookingsPage() {
  const [selectedTab, setSelectedTab] = useState('Ativas')
  const [selectedBooking, setSelectedBooking] = useState(null)
  const loadBookings = useCallback(async () => {
    const reservas = await api.listReservas()
    return reservas.map(mapReserva)
  }, [])

  const { data, loading, error, setData } = useAsyncData(loadBookings)

  const filteredBookings = (data ?? []).filter((booking) => {
    if (selectedTab === 'Todas') return true
    if (selectedTab === 'Canceladas') return booking.status === 'Cancelada'
    return booking.status === 'Ativa'
  })

  async function handleCancelBooking() {
    if (!selectedBooking) return

    const reservaAtualizada = await api.cancelarReserva(selectedBooking.id)
    const mapped = mapReserva(reservaAtualizada)

    setData((current) => current.map((booking) => (booking.id === mapped.id ? mapped : booking)))
    setSelectedBooking(null)
  }

  return (
    <>
      <PageIntro title="Minhas reservas" actions={<Button>Nova reserva</Button>} />

      {loading ? <LoadingBlock label="Carregando reservas..." /> : null}
      {error ? <ErrorBlock message="Nao foi possivel carregar as reservas da API." /> : null}

      {!loading && !error ? (
        <>
          <div className="mb-6 flex gap-8 border-b border-stroke">
            {['Ativas', 'Canceladas', 'Todas'].map((tab) => (
              <button
                key={tab}
                className={`border-b-2 px-2 pb-3 text-sm font-bold transition ${
                  selectedTab === tab ? 'border-brand-red text-brand-red' : 'border-transparent text-ink-muted hover:text-ink'
                }`}
                onClick={() => setSelectedTab(tab)}
                type="button"
              >
                {tab}
              </button>
            ))}
          </div>

          <Card className="overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead className="bg-panel text-left">
                  <tr>
                    {['ID', 'Espaco', 'Predio', 'Data', 'Horario', 'Motivo', 'Status', 'Acoes'].map((head) => (
                      <th key={head} className="px-6 py-4 text-xs font-extrabold uppercase tracking-[0.18em] text-ink-muted">
                        {head}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map((booking) => (
                    <tr key={booking.id} className="border-t border-stroke transition hover:bg-brand-paper">
                      <td className="px-6 py-5 text-sm font-semibold text-ink">{booking.code}</td>
                      <td className="px-6 py-5 text-sm font-semibold text-brand-red">{booking.space}</td>
                      <td className="px-6 py-5 text-sm text-ink-muted">{booking.building}</td>
                      <td className="px-6 py-5 text-sm text-ink">{booking.date}</td>
                      <td className="px-6 py-5 text-sm text-ink">{booking.time}</td>
                      <td className="px-6 py-5 text-sm text-ink-muted">{booking.reason}</td>
                      <td className="px-6 py-5">
                        <Badge tone={booking.status === 'Ativa' ? 'info' : 'neutral'}>{booking.status}</Badge>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex justify-end gap-3 text-sm font-semibold">
                          <button className="text-navy" type="button">
                            Ver detalhes
                          </button>
                          {booking.status === 'Ativa' ? (
                            <button className="text-brand-red" onClick={() => setSelectedBooking(booking)} type="button">
                              Cancelar
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {selectedBooking ? (
            <div className="fixed inset-0 z-40 flex items-center justify-center bg-ink/35 px-4 backdrop-blur-sm">
              <Card className="relative z-50 w-full max-w-2xl">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-red/10 text-brand-red">
                    !
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-ink">Cancelar reserva?</h2>
                    <p className="mt-3 text-sm leading-7 text-ink-muted">
                      Tem certeza que deseja cancelar a reserva <strong>{selectedBooking.code}</strong> para o{' '}
                      <strong>{selectedBooking.space}</strong>? Esta acao nao pode ser desfeita e o espaco sera liberado imediatamente.
                    </p>
                  </div>
                </div>
                <div className="mt-6 flex justify-end gap-3 border-t border-stroke pt-5">
                  <Button tone="secondary" onClick={() => setSelectedBooking(null)}>
                    Voltar
                  </Button>
                  <Button onClick={handleCancelBooking}>Confirmar cancelamento</Button>
                </div>
              </Card>
            </div>
          ) : null}
        </>
      ) : null}
    </>
  )
}
