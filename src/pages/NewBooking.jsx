import { useCallback, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { PlusSquare } from 'lucide-react'

import { ErrorBlock, LoadingBlock } from '@/components/layout/AsyncState'
import { PageHeader } from '@/components/common/PageHeader'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
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

  const submitDisabled =
    submitting || !form.espacoId || !form.data || !form.inicio || !form.fim || !form.motivo

  async function handleSubmit(event) {
    event.preventDefault()
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
      navigate('/reservas')
    } catch (caughtError) {
      toast.error(t('bookingForm.error', { message: caughtError.message }))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-7xl">
      <PageHeader
        title={t('bookingForm.title')}
        description={t('bookingForm.description')}
        icon={PlusSquare}
      />

      {loading && <LoadingBlock label={t('async.bookingLoad')} />}
      {error && <ErrorBlock message={t('async.bookingError')} />}

      {!loading && !error && data && (
        <form className="grid gap-6 lg:grid-cols-12" onSubmit={handleSubmit}>
          <div className="space-y-6 lg:col-span-8">
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
                        setForm((current) => ({ ...current, predioId: event.target.value, espacoId: '' }))
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
                        setForm((current) => ({ ...current, espacoId: event.target.value }))
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
                      onChange={(event) => setForm((current) => ({ ...current, data: event.target.value }))}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="booking-start">{t('bookingForm.startTime')}</Label>
                    <Input
                      id="booking-start"
                      type="time"
                      value={form.inicio}
                      onChange={(event) => setForm((current) => ({ ...current, inicio: event.target.value }))}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="booking-end">{t('bookingForm.endTime')}</Label>
                    <Input
                      id="booking-end"
                      type="time"
                      value={form.fim}
                      onChange={(event) => setForm((current) => ({ ...current, fim: event.target.value }))}
                    />
                  </div>
                </div>
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
          </div>

          <div className="lg:col-span-4">
            <div className="space-y-4 lg:sticky lg:top-20">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t('bookingForm.summary')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Separator className="mb-4" />
                  <dl className="space-y-3 text-sm">
                    <SummaryRow label={t('bookingForm.selectedSpace')} value={summary.space} />
                    <SummaryRow label={t('bookingForm.selectedBuilding')} value={summary.building} />
                    <SummaryRow label={t('bookingForm.estimatedCapacity')} value={summary.capacity} />
                    <SummaryRow label={t('bookingForm.selectedDateTime')} value={summary.dateTime} />
                    <SummaryRow label={t('bookingForm.requester')} value={summary.requester} />
                  </dl>
                </CardContent>
              </Card>

              <div className="flex flex-col gap-2">
                <Button type="submit" size="lg" className="w-full" disabled={submitDisabled}>
                  {submitting ? t('bookingForm.submitting') : t('bookingForm.submit')}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="w-full"
                  onClick={() => navigate(-1)}
                >
                  {t('bookingForm.cancel')}
                </Button>
              </div>
            </div>
          </div>
        </form>
      )}
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
