import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { Clock, ListChecks, MapPin, PlusSquare, Trash2 } from 'lucide-react'

import { ErrorBlock, LoadingBlock } from '@/components/layout/AsyncState'
import { PageHeader } from '@/components/common/PageHeader'
import { EmptyState } from '@/components/common/EmptyState'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { toast } from '@/components/ui/sonner'
import { useAsyncData } from '@/hooks/useAsyncData'
import { useI18n } from '@/i18n/I18nProvider'
import { api } from '@/lib/api'
import { mapReserva } from '@/lib/adapters'
import { getCurrentSolicitante } from '@/lib/currentUser'

export function MyBookingsPage() {
  const { t } = useI18n()
  const [tab, setTab] = useState('pending')

  const loadBookings = useCallback(async () => {
    const currentSolicitante = await getCurrentSolicitante()
    const reservas = await api.listReservasPorSolicitante(currentSolicitante.id)
    return reservas.map(mapReserva)
  }, [])

  const { data, loading, error, setData } = useAsyncData(loadBookings)

  const buckets = {
    pending: (data ?? []).filter((booking) => booking.status === 'PENDENTE'),
    approved: (data ?? []).filter((booking) => booking.status === 'APROVADA'),
    rejected: (data ?? []).filter((booking) => booking.status === 'RECUSADA' || booking.cancelada),
    all: data ?? [],
  }

  async function handleCancel(booking) {
    try {
      const reservaAtualizada = await api.cancelarReserva(booking.id)
      const mapped = mapReserva(reservaAtualizada)
      setData((current) => current.map((b) => (b.id === mapped.id ? mapped : b)))
      toast.success(t('common.statuses.cancelled'))
    } catch (caughtError) {
      toast.error(caughtError.message)
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl">
      <PageHeader
        title={t('bookings.title')}
        icon={ListChecks}
        actions={
          <Button asChild>
            <Link to="/reservas/nova">
              <PlusSquare className="h-4 w-4" />
              {t('bookings.newReservation')}
            </Link>
          </Button>
        }
      />

      {error && <ErrorBlock message={t('async.reservationsError')} />}
      {loading && <LoadingBlock label={t('async.reservationsLoad')} />}

      {!loading && !error && data && (
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="pending">
              Pendentes ({buckets.pending.length})
            </TabsTrigger>
            <TabsTrigger value="approved">
              Aprovadas ({buckets.approved.length})
            </TabsTrigger>
            <TabsTrigger value="rejected">
              Recusadas/Canceladas ({buckets.rejected.length})
            </TabsTrigger>
            <TabsTrigger value="all">
              {t('bookings.tabs.all')} ({buckets.all.length})
            </TabsTrigger>
          </TabsList>

          {['pending', 'approved', 'rejected', 'all'].map((id) => (
            <TabsContent key={id} value={id} className="mt-4">
              {loading ? (
                <div className="space-y-3">
                  {[0, 1, 2].map((i) => (
                    <Skeleton key={i} className="h-24 w-full rounded-lg" />
                  ))}
                </div>
              ) : buckets[id].length === 0 ? (
                <EmptyState title="Nenhuma reserva" description="Você ainda não tem reservas nesta categoria." />
              ) : (
                <div className="space-y-3">
                  {buckets[id].map((booking) => (
                    <Card
                      key={booking.id}
                      className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-semibold">{booking.space}</h3>
                          <StatusBadge statusKey={booking.statusKey} />
                          <span className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                            {booking.code}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">{booking.reason}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                          <span className="inline-flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {booking.date} · {booking.time}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            {booking.building}
                          </span>
                        </div>
                      </div>
                      {(booking.status === 'PENDENTE' || booking.status === 'APROVADA') && !booking.cancelada && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-4 w-4" />
                              {t('bookings.cancel')}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>{t('bookings.modalTitle')}</AlertDialogTitle>
                              <AlertDialogDescription>
                                {t('bookings.modalBody', { code: booking.code, space: booking.space })}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>{t('bookings.back')}</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleCancel(booking)}>
                                {t('bookings.confirmCancellation')}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  )
}
