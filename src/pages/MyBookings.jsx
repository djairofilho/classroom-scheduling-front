import { useCallback, useState } from 'react'
import { ErrorBlock, LoadingBlock } from '../components/layout/AsyncState'
import { PageIntro } from '../components/layout/PageIntro'
import { Badge, Button, Card } from '../components/layout/ui'
import { useAsyncData } from '../hooks/useAsyncData'
import { useI18n } from '../i18n/I18nProvider'
import { api } from '../lib/api'
import { mapReserva } from '../lib/adapters'
import { getCurrentSolicitante } from '../lib/currentUser'

export function MyBookingsPage() {
  const { t, tm } = useI18n()
  const [selectedTab, setSelectedTab] = useState('active')
  const [selectedBooking, setSelectedBooking] = useState(null)
  const loadBookings = useCallback(async () => {
    const currentSolicitante = await getCurrentSolicitante()
    const reservas = await api.listReservasPorSolicitante(currentSolicitante.id)
    return reservas.map(mapReserva)
  }, [])

  const { data, loading, error, setData } = useAsyncData(loadBookings)

  const filteredBookings = (data ?? []).filter((booking) => {
    if (selectedTab === 'all') return true
    if (selectedTab === 'cancelled') return booking.cancelada
    return !booking.cancelada
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
      <PageIntro title={t('bookings.title')} actions={<Button>{t('bookings.newReservation')}</Button>} />

      {loading ? <LoadingBlock label={t('async.reservationsLoad')} /> : null}
      {error ? <ErrorBlock message={t('async.reservationsError')} /> : null}

      {!loading && !error ? (
        <>
          <div className="mb-6 flex gap-8 border-b border-stroke">
            {[
              { id: 'active', label: t('bookings.tabs.active') },
              { id: 'cancelled', label: t('bookings.tabs.cancelled') },
              { id: 'all', label: t('bookings.tabs.all') },
            ].map((tab) => (
              <button
                key={tab.id}
                className={`border-b-2 px-2 pb-3 text-sm font-bold transition ${
                  selectedTab === tab.id ? 'border-brand-red text-brand-red' : 'border-transparent text-ink-muted hover:text-ink'
                }`}
                onClick={() => setSelectedTab(tab.id)}
                type="button"
              >
                {tab.label}
              </button>
            ))}
          </div>

          <Card className="overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead className="bg-panel text-left">
                  <tr>
                    {tm('bookings.headers').map((head) => (
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
                        <Badge tone={booking.statusKey === 'common.statuses.active' ? 'info' : 'neutral'}>{t(booking.statusKey)}</Badge>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex justify-end gap-3 text-sm font-semibold">
                          <button className="text-navy" type="button">
                            {t('bookings.viewDetails')}
                          </button>
                          {!booking.cancelada ? (
                            <button className="text-brand-red" onClick={() => setSelectedBooking(booking)} type="button">
                              {t('bookings.cancel')}
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
                    <h2 className="text-2xl font-bold text-ink">{t('bookings.modalTitle')}</h2>
                    <p className="mt-3 text-sm leading-7 text-ink-muted">
                      {t('bookings.modalBody', { code: selectedBooking.code, space: selectedBooking.space })}
                    </p>
                  </div>
                </div>
                <div className="mt-6 flex justify-end gap-3 border-t border-stroke pt-5">
                  <Button tone="secondary" onClick={() => setSelectedBooking(null)}>
                    {t('bookings.back')}
                  </Button>
                  <Button onClick={handleCancelBooking}>{t('bookings.confirmCancellation')}</Button>
                </div>
              </Card>
            </div>
          ) : null}
        </>
      ) : null}
    </>
  )
}
