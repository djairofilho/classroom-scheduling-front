import { useCallback, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ErrorBlock, LoadingBlock } from '../components/layout/AsyncState'
import { PageIntro } from '../components/layout/PageIntro'
import { Button, Card } from '../components/layout/ui'
import { useAsyncData } from '../hooks/useAsyncData'
import { useI18n } from '../i18n/I18nProvider'
import { api } from '../lib/api'
import { mapEspaco, mapPredio } from '../lib/adapters'
import { useAuth } from '../lib/authContext'
import { combineDateAndTime } from '../lib/format'

export function NewBookingPage() {
  const { t } = useI18n()
  const { user } = useAuth()
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
  const [submitMessage, setSubmitMessage] = useState('')

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
    space: selectedSpace?.name ?? '--',
    building: selectedSpace?.building ?? '--',
    capacity: selectedSpace ? t('common.patterns.peopleCount', { count: selectedSpace.capacity }) : '--',
    dateTime: form.data && form.inicio && form.fim ? `${form.data} ${form.inicio} - ${form.fim}` : '--',
    requester: user.email,
  }

  const selectedBuildingId =
    form.predioId ||
    selectedSpace?.buildingId?.toString() ||
    ''

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitting(true)
    setSubmitMessage('')

    try {
      await api.createReserva({
        solicitanteId: user.id,
        espacoId: Number(form.espacoId),
        inicio: combineDateAndTime(form.data, form.inicio),
        fim: combineDateAndTime(form.data, form.fim),
        motivo: form.motivo,
      })

      setSubmitMessage(t('bookingForm.success'))
    } catch (caughtError) {
      setSubmitMessage(t('bookingForm.error', { message: caughtError.message }))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <PageIntro
        title={t('bookingForm.title')}
        description={t('bookingForm.description')}
      />

      {loading ? <LoadingBlock label={t('async.bookingLoad')} /> : null}
      {error ? <ErrorBlock message={t('async.bookingError')} /> : null}

      {!loading && !error && data ? (
        <form className="grid gap-6 xl:grid-cols-12" onSubmit={handleSubmit}>
          <div className="space-y-6 xl:col-span-8">
            <FormSection
              title={t('bookingForm.requesterTitle')}
              description={t('bookingForm.requesterDescription')}
            >
              <div className="rounded-2xl border border-stroke bg-panel px-4 py-3">
                <p className="text-sm font-semibold text-ink">{user.email}</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-ink-muted">
                  {user.papel === 'ADMIN' ? 'Admin' : user.tipoSolicitante === 'ALUNO' ? 'Aluno' : 'Funcionario'}
                </p>
              </div>
            </FormSection>

            <FormSection
              title={t('bookingForm.spaceTitle')}
              description={t('bookingForm.spaceDescription')}
            >
              <div className="grid gap-4 md:grid-cols-2">
                <SelectField
                  label={t('bookingForm.building')}
                  value={selectedBuildingId}
                  onChange={(value) => setForm((current) => ({ ...current, predioId: value, espacoId: '' }))}
                  options={[
                    { value: '', label: t('bookingForm.chooseBuilding') },
                    ...data.buildings.map((building) => ({ value: String(building.id), label: building.name })),
                  ]}
                />
                <SelectField
                  label={t('bookingForm.room')}
                  value={form.espacoId}
                  onChange={(value) => setForm((current) => ({ ...current, espacoId: value }))}
                  options={[
                    { value: '', label: t('bookingForm.chooseRoom') },
                    ...filteredSpaces.map((space) => ({ value: String(space.id), label: space.name })),
                  ]}
                />
              </div>
            </FormSection>

            <FormSection
              title={t('bookingForm.dateTimeTitle')}
              description={t('bookingForm.dateTimeDescription')}
            >
              <div className="grid gap-4 md:grid-cols-3">
                <Field
                  label={t('bookingForm.reservationDate')}
                  type="date"
                  value={form.data}
                  onChange={(value) => setForm((current) => ({ ...current, data: value }))}
                />
                <Field
                  label={t('bookingForm.startTime')}
                  type="time"
                  value={form.inicio}
                  onChange={(value) => setForm((current) => ({ ...current, inicio: value }))}
                />
                <Field
                  label={t('bookingForm.endTime')}
                  type="time"
                  value={form.fim}
                  onChange={(value) => setForm((current) => ({ ...current, fim: value }))}
                />
              </div>
            </FormSection>

            <FormSection
              title={t('bookingForm.reasonTitle')}
              description={t('bookingForm.reasonDescription')}
            >
              <label>
                <span className="mb-2 block text-sm font-bold text-ink">{t('bookingForm.academicReason')}</span>
                <textarea
                  className="min-h-36 w-full rounded-2xl border border-stroke bg-panel px-4 py-3 text-sm outline-none transition focus:border-brand-red focus:ring-4 focus:ring-brand-red/10"
                  placeholder={t('bookingForm.reasonPlaceholder')}
                  value={form.motivo}
                  onChange={(event) => setForm((current) => ({ ...current, motivo: event.target.value }))}
                />
              </label>
            </FormSection>
          </div>

          <div className="xl:col-span-4">
            <div className="sticky top-28 space-y-4">
              <Card>
                <h2 className="border-b border-stroke pb-4 text-2xl font-bold text-ink">{t('bookingForm.summary')}</h2>
                <dl className="space-y-5 pt-5">
                  <SummaryRow label={t('bookingForm.selectedSpace')} value={summary.space} />
                  <SummaryRow label={t('bookingForm.selectedBuilding')} value={summary.building} />
                  <SummaryRow label={t('bookingForm.estimatedCapacity')} value={summary.capacity} />
                  <SummaryRow label={t('bookingForm.selectedDateTime')} value={summary.dateTime} />
                  <SummaryRow label={t('bookingForm.requester')} value={summary.requester} />
                </dl>
              </Card>

              <div className="flex flex-col gap-3">
                <Button
                  className="w-full"
                  disabled={
                    submitting ||
                    !form.espacoId ||
                    !form.data ||
                    !form.inicio ||
                    !form.fim ||
                    !form.motivo
                  }
                >
                  {submitting ? t('bookingForm.submitting') : t('bookingForm.submit')}
                </Button>
                <Button tone="secondary" className="w-full" type="button">
                  {t('bookingForm.cancel')}
                </Button>
                {submitMessage ? <p className="text-sm text-ink-muted">{submitMessage}</p> : null}
              </div>
            </div>
          </div>
        </form>
      ) : null}
    </>
  )
}

function FormSection({ title, description, children }) {
  return (
    <Card>
      <div className="mb-5">
        <h2 className="text-2xl font-bold text-ink">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-ink-muted">{description}</p>
      </div>
      {children}
    </Card>
  )
}

function Field({ label, placeholder = '', type = 'text', value = '', onChange, onBlur }) {
  return (
    <label>
      <span className="mb-2 block text-sm font-bold text-ink">{label}</span>
      <input
        className="h-13 w-full rounded-2xl border border-stroke bg-panel px-4 text-sm outline-none transition focus:border-brand-red focus:ring-4 focus:ring-brand-red/10"
        placeholder={placeholder}
        type={type}
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        onBlur={onBlur}
      />
    </label>
  )
}

function SelectField({ label, options, value = '', onChange }) {
  return (
    <label>
      <span className="mb-2 block text-sm font-bold text-ink">{label}</span>
      <select
        className="h-13 w-full rounded-2xl border border-stroke bg-panel px-4 text-sm outline-none transition focus:border-brand-red focus:ring-4 focus:ring-brand-red/10"
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
      >
        {options.map((option) => (
          <option key={option.value ?? option} value={option.value ?? option}>
            {option.label ?? option}
          </option>
        ))}
      </select>
    </label>
  )
}

function SummaryRow({ label, value }) {
  return (
    <div className="border-b border-stroke pb-4 last:border-b-0 last:pb-0">
      <dt className="text-sm text-ink-muted">{label}</dt>
      <dd className="mt-1 text-base font-semibold text-ink">{value}</dd>
    </div>
  )
}
