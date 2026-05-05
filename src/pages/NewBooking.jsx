import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

import { ptBR } from 'date-fns/locale'

import { ErrorBlock, LoadingBlock } from '@/components/layout/AsyncState'
import { PageHeader } from '@/components/common/PageHeader'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
import { cn } from '@/lib/utils'

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

  // Espaços disponíveis no prédio selecionado.
  const availableSpaces = useMemo(() => {
    if (!data || !form.predioId) return []
    return data.spaces.filter(
      (space) =>
        String(space.buildingId) === String(form.predioId) &&
        space.statusKey === 'common.statuses.available',
    )
  }, [data, form.predioId])

  const selectedSpace = useMemo(
    () => data?.spaces?.find((space) => String(space.id) === form.espacoId) ?? null,
    [data, form.espacoId],
  )

  const selectedBuilding = useMemo(() => {
    if (!data) return null
    const buildingId = form.predioId || (selectedSpace?.buildingId ? String(selectedSpace.buildingId) : '')
    if (!buildingId) return null
    return data.buildings.find((b) => String(b.id) === buildingId) ?? null
  }, [data, form.predioId, selectedSpace])

  // Carrega janelas ocupadas para o espaço/data selecionados.
  useEffect(() => {
    async function loadBusyRanges() {
      if (!form.espacoId || !form.data) {
        setBusyRanges([])
        setBusyRangesUnavailable(false)
        return
      }
      setLoadingBusyRanges(true)
      try {
        let reservas
        try {
          reservas = await api.listReservasAtivas()
        } catch {
          reservas = await api.listReservas()
        }
        const sameSpaceAndDay = reservas.filter((item) => {
          const espacoId = item.espaco?.id ?? item.espacoId
          return (
            Number(espacoId) === Number(form.espacoId) &&
            isSameLocalDate(item.horarios?.inicio ?? item.inicio, form.data)
          )
        })

        const activeRanges = sameSpaceAndDay
          .filter((item) => !item.cancelada)
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
    !form.espacoId || !form.data || !form.inicio || !form.fim || !form.motivo.trim()

  function setField(field, value) {
    setForm((current) => {
      const next = { ...current, [field]: value }
      // Cascading reset: changing earlier steps clears later ones.
      if (field === 'predioId') {
        next.espacoId = ''
        next.data = ''
        next.inicio = ''
        next.fim = ''
      }
      if (field === 'espacoId') {
        next.data = ''
        next.inicio = ''
        next.fim = ''
      }
      if (field === 'data') {
        next.inicio = ''
        next.fim = ''
      }
      if (field === 'inicio') {
        next.fim = ''
      }
      return next
    })
  }

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

  const formattedDate = formatBrDate(form.data)

  const summary = {
    space: selectedSpace?.name ?? '—',
    building: selectedBuilding?.name ?? selectedSpace?.building ?? '—',
    capacity: selectedSpace ? t('common.patterns.peopleCount', { count: selectedSpace.capacity }) : '—',
    dateTime: formattedDate && form.inicio && form.fim ? `${formattedDate} • ${form.inicio} – ${form.fim}` : '—',
    requester: user?.email ?? '—',
  }

  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="mb-4">
        <Button variant="ghost" size="sm" className="-ml-2" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
          {t('bookings.back')}
        </Button>
      </div>

      <PageHeader title={t('bookingForm.title')} description={t('bookingForm.description')} />

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

          {/* Step 1 — prédio */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">1. {t('bookingForm.building')}</CardTitle>
              <CardDescription>Escolha o prédio onde deseja reservar.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                <Label htmlFor="booking-building" className="sr-only">
                  {t('bookingForm.building')}
                </Label>
                <select
                  id="booking-building"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={form.predioId}
                  onChange={(event) => setField('predioId', event.target.value)}
                >
                  <option value="">{t('bookingForm.chooseBuilding')}</option>
                  {data.buildings.map((building) => (
                    <option key={building.id} value={String(building.id)}>
                      {building.name}
                    </option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Step 2 — sala disponível */}
          {form.predioId && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">2. {t('bookingForm.room')}</CardTitle>
                <CardDescription>
                  {availableSpaces.length === 0
                    ? 'Nenhuma sala disponível neste prédio no momento.'
                    : 'Selecione uma das salas disponíveis abaixo.'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {availableSpaces.length === 0 ? (
                  <p className="rounded-md border border-dashed bg-muted/30 p-4 text-sm text-muted-foreground">
                    Nenhuma sala disponível para este prédio. Tente outro prédio ou ajuste a disponibilidade no painel admin.
                  </p>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {availableSpaces.map((space) => {
                      const selected = String(space.id) === form.espacoId
                      return (
                        <button
                          key={space.id}
                          type="button"
                          onClick={() => setField('espacoId', String(space.id))}
                          className={cn(
                            'flex flex-col items-start rounded-lg border bg-card p-4 text-left transition hover:border-primary/40',
                            selected && 'border-primary bg-primary-soft',
                          )}
                        >
                          <span className="text-sm font-semibold">{space.name}</span>
                          <span className="mt-0.5 text-xs text-muted-foreground">
                            {t(space.typeKey)} · {t('common.patterns.peopleCount', { count: space.capacity })}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 3 — data */}
          {form.espacoId && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">3. {t('bookingForm.reservationDate')}</CardTitle>
                <CardDescription>
                  {form.data
                    ? `Selecionado: ${formatBrDate(form.data)}.`
                    : 'Escolha o dia da reserva no calendário.'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  locale={ptBR}
                  weekStartsOn={0}
                  selected={parseIsoDate(form.data)}
                  onSelect={(date) => setField('data', date ? toIsoDate(date) : '')}
                  disabled={isPastDay}
                  className="mx-auto rounded-md border bg-card p-3 sm:p-5"
                  classNames={{
                    months: 'flex flex-col sm:flex-row sm:gap-6',
                    month: 'space-y-4 sm:space-y-5',
                    caption_label: 'text-base font-semibold capitalize',
                    nav_button: 'h-8 w-8',
                    head_cell: 'text-muted-foreground w-12 font-medium text-xs uppercase tracking-[0.12em]',
                    cell: 'h-12 w-12 text-center text-sm p-0 relative focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md',
                    day: 'h-12 w-12 p-0 font-medium text-sm rounded-md hover:bg-accent hover:text-accent-foreground aria-selected:opacity-100',
                    day_selected:
                      'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground',
                    day_today: 'ring-1 ring-primary/40',
                    day_disabled: 'text-muted-foreground opacity-40',
                  }}
                />
              </CardContent>
            </Card>
          )}

          {/* Step 4 — início */}
          {form.data && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">4. {t('bookingForm.startTime')}</CardTitle>
                <CardDescription>
                  {loadingBusyRanges
                    ? 'Carregando horários disponíveis...'
                    : busyRangesUnavailable
                      ? 'Não foi possível validar horários ocupados — escolha com cuidado.'
                      : 'Selecione o horário de início.'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {startOptions.length === 0 && !loadingBusyRanges ? (
                  <p className="rounded-md border border-dashed bg-muted/30 p-4 text-sm text-muted-foreground">
                    Nenhum horário livre nesta data.
                  </p>
                ) : (
                  <TimeChipGrid
                    options={startOptions}
                    value={form.inicio}
                    onChange={(value) => setField('inicio', value)}
                  />
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 5 — fim */}
          {form.inicio && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">5. {t('bookingForm.endTime')}</CardTitle>
                <CardDescription>Escolha o horário de término.</CardDescription>
              </CardHeader>
              <CardContent>
                {endOptions.length === 0 ? (
                  <p className="rounded-md border border-dashed bg-muted/30 p-4 text-sm text-muted-foreground">
                    Sem horários de término válidos após o início selecionado.
                  </p>
                ) : (
                  <TimeChipGrid
                    options={endOptions}
                    value={form.fim}
                    onChange={(value) => setField('fim', value)}
                  />
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 6 — motivo */}
          {form.fim && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">6. {t('bookingForm.reasonTitle')}</CardTitle>
                <CardDescription>{t('bookingForm.reasonDescription')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="booking-reason" className="sr-only">
                    {t('bookingForm.academicReason')}
                  </Label>
                  <Textarea
                    id="booking-reason"
                    rows={5}
                    placeholder={t('bookingForm.reasonPlaceholder')}
                    value={form.motivo}
                    onChange={(event) => setField('motivo', event.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Confirmação textual */}
          {!formIncomplete && (
            <Card className="border-primary/30 bg-primary-soft p-5 text-sm text-foreground">
              <p>
                Reservar <strong>{summary.space}</strong> no prédio <strong>{summary.building}</strong> em{' '}
                <strong>
                  {formattedDate} das {form.inicio} às {form.fim}
                </strong>
                .
              </p>
            </Card>
          )}

          <div className="flex justify-end">
            <Button type="submit" size="lg" disabled={formIncomplete}>
              Continuar
            </Button>
          </div>
        </form>
      )}

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('bookingForm.summary')}</DialogTitle>
            <DialogDescription>
              Revise os dados antes de confirmar. Após confirmar, a reserva é registrada.
            </DialogDescription>
          </DialogHeader>
          <Separator />
          <div className="rounded-md border border-primary/30 bg-primary-soft p-4 text-sm">
            Reservar <strong>{summary.space}</strong> no prédio <strong>{summary.building}</strong> em{' '}
            <strong>
              {formattedDate} das {form.inicio} às {form.fim}
            </strong>
            .
          </div>
          <dl className="space-y-3 text-sm">
            <SummaryRow label={t('bookingForm.estimatedCapacity')} value={summary.capacity} />
            <SummaryRow label={t('bookingForm.requester')} value={summary.requester} />
            <SummaryRow label="Motivo" value={form.motivo} />
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

function TimeChipGrid({ options, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((slot) => {
        const selected = slot.value === value
        return (
          <button
            key={slot.value}
            type="button"
            onClick={() => onChange(slot.value)}
            className={cn(
              'rounded-full border px-3 py-1.5 text-xs font-medium transition',
              selected
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-input bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground',
            )}
          >
            {slot.value}
          </button>
        )
      })}
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

function buildTimeSlots(start = 7 * 60, end = 22 * 60, step = 30) {
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
  const local = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
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

function formatBrDate(yyyyMmDd) {
  if (!yyyyMmDd || !yyyyMmDd.includes('-')) return ''
  const [year, month, day] = yyyyMmDd.split('-')
  return `${day}/${month}/${year}`
}

function parseIsoDate(yyyyMmDd) {
  if (!yyyyMmDd || !yyyyMmDd.includes('-')) return undefined
  const [year, month, day] = yyyyMmDd.split('-').map(Number)
  if (!year || !month || !day) return undefined
  return new Date(year, month - 1, day)
}

function toIsoDate(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function isPastDay(date) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const day = new Date(date)
  day.setHours(0, 0, 0, 0)
  return day.getTime() < today.getTime()
}
