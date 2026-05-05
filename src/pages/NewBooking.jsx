import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, PlusSquare } from 'lucide-react'

import { ErrorBlock, LoadingBlock } from '@/components/layout/AsyncState'
import { PageHeader } from '@/components/common/PageHeader'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from '@/components/ui/sonner'
import { useAsyncData } from '@/hooks/useAsyncData'
import { useI18n } from '@/i18n/I18nProvider'
import { api } from '@/lib/api'
import { mapEspaco, mapPredio } from '@/lib/adapters'
import { useAuth } from '@/lib/authContext'
import { combineDateAndTime } from '@/lib/format'

export function NewBookingPage() {
  const { t } = useI18n()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [form, setForm] = useState({
    predioId: '',
    espacoId: searchParams.get('espacoId') ?? '',
    data: '',
    inicio: '',
    fim: '',
    motivo: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [busyRanges, setBusyRanges] = useState([])
  const [loadingBusyRanges, setLoadingBusyRanges] = useState(false)
  const [busyRangesUnavailable, setBusyRangesUnavailable] = useState(false)

  const loadBookingData = useCallback(async () => {
    const [predios, espacos] = await Promise.all([api.listPredios(), api.listEspacos()])
    return {
      buildings: predios.map(mapPredio),
      spaces: espacos.map(mapEspaco),
    }
  }, [])

  const { data, loading, error } = useAsyncData(loadBookingData)

  const filteredSpaces = useMemo(() => {
    if (!data) return []
    const currentBuildingId =
      form.predioId ||
      data.spaces.find((space) => String(space.id) === form.espacoId)?.buildingId?.toString() ||
      ''

    return data.spaces.filter((space) => !currentBuildingId || String(space.buildingId) === currentBuildingId)
  }, [data, form.espacoId, form.predioId])

  const selectedSpace = useMemo(
    () =>
      filteredSpaces.find((space) => String(space.id) === form.espacoId) ??
      data?.spaces?.find((space) => String(space.id) === form.espacoId) ??
      null,
    [data, filteredSpaces, form.espacoId],
  )

  const summary = {
    space: selectedSpace?.name ?? '—',
    building: selectedSpace?.building ?? '—',
    capacity: selectedSpace ? t('common.patterns.peopleCount', { count: selectedSpace.capacity }) : '—',
    dateTime: form.data && form.inicio && form.fim ? `${form.data} • ${form.inicio} – ${form.fim}` : '—',
    requester: user?.email ?? '—',
  }

  const selectedBuildingId = form.predioId || selectedSpace?.buildingId?.toString() || ''

  useEffect(() => {
    async function loadBusyRanges() {
      if (!form.espacoId || !form.data) {
        setBusyRanges([])
        setBusyRangesUnavailable(false)
        return
      }
      setLoadingBusyRanges(true)
      try {
        let reservas = []
        try {
          reservas = await api.listReservasPorEspacoEData(Number(form.espacoId), form.data)
        } catch {
          try {
            const ativas = await api.listReservasAtivas()
            reservas = ativas.filter((item) => {
              const espacoId = item.espaco?.id ?? item.espacoId
              return Number(espacoId) === Number(form.espacoId) && isSameLocalDate(item.horarios?.inicio ?? item.inicio, form.data)
            })
          } catch {
            const allReservas = await api.listReservas()
            reservas = allReservas.filter((item) => {
              const espacoId = item.espaco?.id ?? item.espacoId
              return Number(espacoId) === Number(form.espacoId) && isSameLocalDate(item.horarios?.inicio ?? item.inicio, form.data)
            })
          }
        }

        const activeRanges = reservas
          .filter((item) => isBusyReservation(item))
          .map((item) => ({
            start: toMinutes(item.horarios?.inicio ?? item.inicio),
            end: toMinutes(item.horarios?.fim ?? item.fim),
          }))
          .filter((item) => Number.isFinite(item.start) && Number.isFinite(item.end) && item.end > item.start)
        setBusyRanges(activeRanges)
        setBusyRangesUnavailable(false)
      } catch {
        setBusyRanges([])
        setBusyRangesUnavailable(true)
      } finally {
        setLoadingBusyRanges(false)
      }
    }

    loadBusyRanges()
  }, [form.data, form.espacoId])

  const startOptions = useMemo(() => {
    const slots = buildTimeSlots()
    return slots.filter((slot) => !isMinuteBlocked(slot.minutes, busyRanges))
  }, [busyRanges])

  const endOptions = useMemo(() => {
    const startMinutes = parseTimeText(form.inicio)
    if (!Number.isFinite(startMinutes)) return []
    return buildTimeSlots(startMinutes + 5).filter((slot) => {
      if (slot.minutes <= startMinutes) return false
      return !hasOverlap(startMinutes, slot.minutes, busyRanges)
    })
  }, [busyRanges, form.inicio])

  const formIncomplete =
    !form.espacoId || !form.data || !form.inicio || !form.fim || !form.motivo

  function openConfirm(event) {
    event.preventDefault()
    if (formIncomplete) return
    setConfirmOpen(true)
  }

  async function handleConfirm() {
    setSubmitting(true)
    try {
      await api.createReserva({
        solicitanteId: user.id,
        espacoId: Number(form.espacoId),
        inicio: combineDateAndTime(form.data, form.inicio),
        fim: combineDateAndTime(form.data, form.fim),
        motivo: form.motivo,
      })

      toast.success(t('bookingForm.success'))
      setConfirmOpen(false)
      navigate('/reservas')
    } catch (caughtError) {
      toast.error(t('bookingForm.error', { message: caughtError.message }))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="mb-4">
        <Button variant="ghost" size="sm" className="-ml-2" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
          {t('bookings.back')}
        </Button>
      </div>

      <PageHeader
        title={t('bookingForm.title')}
        description={t('bookingForm.description')}
        icon={PlusSquare}
      />

      {loading && <LoadingBlock label={t('async.bookingLoad')} />}
      {error && <ErrorBlock message={t('async.bookingError')} />}

      {!loading && !error && data && (
        <form className="space-y-6" onSubmit={openConfirm}>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('bookingForm.requesterTitle')}</CardTitle>
              <CardDescription>{t('bookingForm.requesterDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border bg-muted/40 px-4 py-3">
                <p className="text-sm font-semibold">{user?.email}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.16em] text-muted-foreground">
                  {user?.papel === 'ADMIN'
                    ? 'Admin'
                    : user?.tipoSolicitante === 'ALUNO'
                      ? 'Aluno'
                      : 'Funcionário'}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('bookingForm.spaceTitle')}</CardTitle>
              <CardDescription>{t('bookingForm.spaceDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="booking-building">{t('bookingForm.building')}</Label>
                  <select
                    id="booking-building"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={selectedBuildingId}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        predioId: event.target.value,
                        espacoId: '',
                        inicio: '',
                        fim: '',
                      }))
                    }
                  >
                    <option value="">{t('bookingForm.chooseBuilding')}</option>
                    {data.buildings.map((building) => (
                      <option key={building.id} value={String(building.id)}>
                        {building.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="booking-space">{t('bookingForm.room')}</Label>
                  <select
                    id="booking-space"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={form.espacoId}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, espacoId: event.target.value, inicio: '', fim: '' }))
                    }
                  >
                    <option value="">{t('bookingForm.chooseRoom')}</option>
                    {filteredSpaces.map((space) => (
                      <option key={space.id} value={String(space.id)}>
                        {space.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('bookingForm.dateTimeTitle')}</CardTitle>
              <CardDescription>{t('bookingForm.dateTimeDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="booking-date">{t('bookingForm.reservationDate')}</Label>
                  <Input
                    id="booking-date"
                    type="date"
                    value={form.data}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, data: event.target.value, inicio: '', fim: '' }))
                    }
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="booking-start">{t('bookingForm.startTime')}</Label>
                  <select
                    id="booking-start"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={form.inicio}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, inicio: event.target.value, fim: '' }))
                    }
                    disabled={!form.espacoId || !form.data || loadingBusyRanges || busyRangesUnavailable}
                  >
                    <option value="">
                      {loadingBusyRanges ? 'Carregando horários...' : 'Selecione o horário'}
                    </option>
                    {startOptions.map((slot) => (
                      <option key={slot.value} value={slot.value}>
                        {slot.value}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="booking-end">{t('bookingForm.endTime')}</Label>
                  <select
                    id="booking-end"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={form.fim}
                    onChange={(event) => setForm((current) => ({ ...current, fim: event.target.value }))}
                    disabled={!form.inicio || loadingBusyRanges || busyRangesUnavailable}
                  >
                    <option value="">Selecione o horário</option>
                    {endOptions.map((slot) => (
                      <option key={slot.value} value={slot.value}>
                        {slot.value}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {busyRangesUnavailable && (
                <p className="mt-2 text-xs text-destructive">
                  Não foi possível validar os horários ocupados para este espaço. Tente novamente.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('bookingForm.reasonTitle')}</CardTitle>
              <CardDescription>{t('bookingForm.reasonDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                <Label htmlFor="booking-reason">{t('bookingForm.academicReason')}</Label>
                <Textarea
                  id="booking-reason"
                  rows={5}
                  placeholder={t('bookingForm.reasonPlaceholder')}
                  value={form.motivo}
                  onChange={(event) => setForm((current) => ({ ...current, motivo: event.target.value }))}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" size="lg" disabled={formIncomplete}>
              {t('bookingForm.submit')}
            </Button>
          </div>
        </form>
      )}

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('bookingForm.summary')}</DialogTitle>
            <DialogDescription>{t('bookingForm.description')}</DialogDescription>
          </DialogHeader>
          <Separator />
          <dl className="space-y-3 text-sm">
            <SummaryRow label={t('bookingForm.selectedSpace')} value={summary.space} />
            <SummaryRow label={t('bookingForm.selectedBuilding')} value={summary.building} />
            <SummaryRow label={t('bookingForm.estimatedCapacity')} value={summary.capacity} />
            <SummaryRow label={t('bookingForm.selectedDateTime')} value={summary.dateTime} />
            <SummaryRow label={t('bookingForm.requester')} value={summary.requester} />
          </dl>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button type="button" variant="outline" onClick={() => setConfirmOpen(false)} disabled={submitting}>
              {t('bookingForm.cancel')}
            </Button>
            <Button type="button" onClick={handleConfirm} disabled={submitting}>
              {submitting ? t('bookingForm.submitting') : t('bookingForm.submit')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  )
}

function buildTimeSlots(start = 7 * 60, end = 22 * 60, step = 5) {
  const slots = []
  for (let minute = start; minute <= end; minute += step) {
    slots.push({
      minutes: minute,
      value: `${String(Math.floor(minute / 60)).padStart(2, '0')}:${String(minute % 60).padStart(2, '0')}`,
    })
  }
  return slots
}

function isSameLocalDate(isoDateTime, yyyyMmDd) {
  if (!isoDateTime || !yyyyMmDd) return false
  const date = new Date(isoDateTime)
  if (Number.isNaN(date.getTime())) return false
  const local = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate(),
  ).padStart(2, '0')}`
  return local === yyyyMmDd
}

function parseTimeText(value) {
  if (!value || !value.includes(':')) return NaN
  const [hourText, minuteText] = value.split(':')
  const hour = Number(hourText)
  const minute = Number(minuteText)
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return NaN
  return hour * 60 + minute
}

function toMinutes(isoDateTime) {
  if (!isoDateTime) return NaN
  const date = new Date(isoDateTime)
  if (Number.isNaN(date.getTime())) return NaN
  return date.getHours() * 60 + date.getMinutes()
}

function isMinuteBlocked(minute, ranges) {
  return ranges.some((range) => minute >= range.start && minute < range.end)
}

function hasOverlap(start, end, ranges) {
  return ranges.some((range) => start < range.end && end > range.start)
}

function isBusyReservation(reservation) {
  if (reservation.cancelada) return false
  const rawStatus = typeof reservation.status === 'string' ? reservation.status.toUpperCase() : null
  return rawStatus !== 'RECUSADA'
}
