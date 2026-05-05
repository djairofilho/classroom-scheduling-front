import { useCallback, useMemo } from 'react'
import { ClipboardCheck } from 'lucide-react'

import { ErrorBlock, LoadingBlock } from '@/components/layout/AsyncState'
import { AdminTabs } from '@/components/common/AdminTabs'
import { PageHeader } from '@/components/common/PageHeader'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from '@/components/ui/sonner'
import { useAsyncData } from '@/hooks/useAsyncData'
import { api } from '@/lib/api'
import { mapReserva } from '@/lib/adapters'

export function AdminReservationsPage() {
  const loadData = useCallback(async () => {
    const reservas = await api.listReservas()
    return reservas.map(mapReserva).sort((a, b) => new Date(b.start).getTime() - new Date(a.start).getTime())
  }, [])

  const { data, loading, error, reload } = useAsyncData(loadData)

  const buckets = useMemo(() => {
    const reservations = data ?? []
    return {
      pendentes: reservations.filter((item) => item.status === 'PENDENTE'),
      aprovadas: reservations.filter((item) => item.status === 'APROVADA'),
      recusadas: reservations.filter((item) => item.status === 'RECUSADA' || item.cancelada),
      todas: reservations,
    }
  }, [data])

  async function handleStatusChange(id, nextStatus) {
    try {
      if (nextStatus === 'APROVADA') {
        await api.aprovarReserva(id)
        toast.success('Reserva aceita.')
      } else if (nextStatus === 'RECUSADA') {
        await api.recusarReserva(id)
        toast.success('Reserva cancelada.')
      } else if (nextStatus === 'CANCELADA') {
        await api.cancelarReserva(id)
        toast.success('Reserva cancelada.')
      }
      await reload()
    } catch (caughtError) {
      toast.error(caughtError.message)
    }
  }

  return (
    <div className="mx-auto w-full max-w-7xl">
      <PageHeader
        title="Aprovação de reservas"
        description="Gerencie solicitações de salas com mudança de status por dropdown."
        icon={ClipboardCheck}
      />
      <AdminTabs pair="users" />

      {loading && <LoadingBlock label="Carregando reservas..." />}
      {error && <ErrorBlock message="Não foi possível carregar as reservas administrativas." />}

      {!loading && !error && data && (
        <Tabs defaultValue="pendentes">
          <TabsList>
            <TabsTrigger value="pendentes">Pendentes ({buckets.pendentes.length})</TabsTrigger>
            <TabsTrigger value="aprovadas">Aprovadas ({buckets.aprovadas.length})</TabsTrigger>
            <TabsTrigger value="recusadas">Recusadas ({buckets.recusadas.length})</TabsTrigger>
            <TabsTrigger value="todas">Todas ({buckets.todas.length})</TabsTrigger>
          </TabsList>

          {Object.entries(buckets).map(([key, values]) => (
            <TabsContent key={key} value={key} className="mt-4 space-y-3">
              {values.length === 0 ? (
                <Card className="p-5 text-sm text-muted-foreground">Nenhuma reserva nesta categoria.</Card>
              ) : (
                values.map((reservation) => (
                  <Card key={reservation.id} className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{reservation.space}</p>
                      <p className="text-xs text-muted-foreground">
                        {reservation.building} · {reservation.date} · {reservation.time}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">{reservation.reason}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{reservation.solicitanteEmail}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge statusKey={reservation.statusKey} />
                      {(reservation.status === 'PENDENTE' || reservation.status === 'APROVADA') && (
                        <Select onValueChange={(value) => handleStatusChange(reservation.id, value)}>
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Alterar para..." />
                          </SelectTrigger>
                          <SelectContent>
                            {reservation.status === 'PENDENTE' && (
                              <SelectItem value="APROVADA">Aceito</SelectItem>
                            )}
                            <SelectItem value={reservation.status === 'PENDENTE' ? 'RECUSADA' : 'CANCELADA'}>
                              Cancela
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </Card>
                ))
              )}
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  )
}
