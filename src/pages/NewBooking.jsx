import { useCallback, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ErrorBlock, LoadingBlock } from '../components/layout/AsyncState'
import { PageIntro } from '../components/layout/PageIntro'
import { Button, Card } from '../components/layout/ui'
import { useAsyncData } from '../hooks/useAsyncData'
import { api, isNotFoundError } from '../lib/api'
import { mapEspaco, mapPredio } from '../lib/adapters'
import { combineDateAndTime } from '../lib/format'

export function NewBookingPage() {
  const [searchParams] = useSearchParams()
  const [form, setForm] = useState({
    nome: '',
    email: '',
    predioId: '',
    espacoId: searchParams.get('espacoId') ?? '',
    data: '',
    inicio: '',
    fim: '',
    motivo: '',
  })
  const [lookupMessage, setLookupMessage] = useState('')
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
    capacity: selectedSpace ? `${selectedSpace.capacity} pessoas` : '--',
    dateTime: form.data && form.inicio && form.fim ? `${form.data} ${form.inicio} - ${form.fim}` : '--',
    requester: form.nome || form.email || '--',
  }

  const selectedBuildingId =
    form.predioId ||
    selectedSpace?.buildingId?.toString() ||
    ''

  async function handleLookup() {
    if (!form.email) return

    try {
      const solicitante = await api.findSolicitanteByEmail(form.email)
      setForm((current) => ({ ...current, nome: solicitante.nome }))
      setLookupMessage('Solicitante localizado na API.')
    } catch (caughtError) {
      if (isNotFoundError(caughtError)) {
        setLookupMessage('Solicitante nao encontrado. Informe o nome para cadastro automatico.')
        return
      }

      setLookupMessage('Nao foi possivel consultar o solicitante.')
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitting(true)
    setSubmitMessage('')

    try {
      let solicitante

      try {
        solicitante = await api.findSolicitanteByEmail(form.email)
      } catch (caughtError) {
        if (!isNotFoundError(caughtError)) {
          throw caughtError
        }

        solicitante = await api.createSolicitante({
          nome: form.nome,
          email: form.email,
        })
      }

      await api.createReserva({
        solicitanteId: solicitante.id,
        espacoId: Number(form.espacoId),
        inicio: combineDateAndTime(form.data, form.inicio),
        fim: combineDateAndTime(form.data, form.fim),
        motivo: form.motivo,
      })

      setSubmitMessage('Reserva criada com sucesso.')
    } catch (caughtError) {
      setSubmitMessage(`Nao foi possivel criar a reserva: ${caughtError.message}`)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <PageIntro
        title="Nova reserva"
        description="Preencha os dados abaixo para solicitar um novo espaco academico."
      />

      {loading ? <LoadingBlock label="Carregando formulario a partir da API..." /> : null}
      {error ? <ErrorBlock message="Nao foi possivel carregar predios e espacos da API." /> : null}

      {!loading && !error && data ? (
        <form className="grid gap-6 xl:grid-cols-12" onSubmit={handleSubmit}>
          <div className="space-y-6 xl:col-span-8">
            <FormSection
              title="Dados do solicitante"
              description="Use o e-mail institucional para localizar o perfil de quem fara a solicitacao."
            >
              <div className="grid gap-4 md:grid-cols-[1.3fr_0.7fr]">
                <Field
                  label="E-mail institucional"
                  placeholder="nome.sobrenome@insper.edu.br"
                  value={form.email}
                  onChange={(value) => setForm((current) => ({ ...current, email: value }))}
                  onBlur={handleLookup}
                />
                <Field
                  label="Nome completo"
                  placeholder="Nome do solicitante"
                  value={form.nome}
                  onChange={(value) => setForm((current) => ({ ...current, nome: value }))}
                />
              </div>
              {lookupMessage ? <p className="mt-3 text-sm text-ink-muted">{lookupMessage}</p> : null}
            </FormSection>

            <FormSection
              title="Selecao de espaco"
              description="Escolha primeiro o predio e depois o ambiente desejado."
            >
              <div className="grid gap-4 md:grid-cols-2">
                <SelectField
                  label="Predio / Unidade"
                  value={selectedBuildingId}
                  onChange={(value) => setForm((current) => ({ ...current, predioId: value, espacoId: '' }))}
                  options={[
                    { value: '', label: 'Selecione o predio...' },
                    ...data.buildings.map((building) => ({ value: String(building.id), label: building.name })),
                  ]}
                />
                <SelectField
                  label="Sala / Laboratorio"
                  value={form.espacoId}
                  onChange={(value) => setForm((current) => ({ ...current, espacoId: value }))}
                  options={[
                    { value: '', label: 'Selecione a sala...' },
                    ...filteredSpaces.map((space) => ({ value: String(space.id), label: space.name })),
                  ]}
                />
              </div>
            </FormSection>

            <FormSection
              title="Data e horario"
              description="Informe a janela completa da reserva para evitar conflitos de agenda."
            >
              <div className="grid gap-4 md:grid-cols-3">
                <Field
                  label="Data da reserva"
                  type="date"
                  value={form.data}
                  onChange={(value) => setForm((current) => ({ ...current, data: value }))}
                />
                <Field
                  label="Hora de inicio"
                  type="time"
                  value={form.inicio}
                  onChange={(value) => setForm((current) => ({ ...current, inicio: value }))}
                />
                <Field
                  label="Hora de termino"
                  type="time"
                  value={form.fim}
                  onChange={(value) => setForm((current) => ({ ...current, fim: value }))}
                />
              </div>
            </FormSection>

            <FormSection
              title="Motivo da reserva"
              description="A justificativa ajuda a priorizar e aprovar solicitacoes com mais contexto."
            >
              <label>
                <span className="mb-2 block text-sm font-bold text-ink">Justificativa academica</span>
                <textarea
                  className="min-h-36 w-full rounded-2xl border border-stroke bg-panel px-4 py-3 text-sm outline-none transition focus:border-brand-red focus:ring-4 focus:ring-brand-red/10"
                  placeholder="Descreva brevemente o proposito da utilizacao do espaco..."
                  value={form.motivo}
                  onChange={(event) => setForm((current) => ({ ...current, motivo: event.target.value }))}
                />
              </label>
            </FormSection>
          </div>

          <div className="xl:col-span-4">
            <div className="sticky top-28 space-y-4">
              <Card>
                <h2 className="border-b border-stroke pb-4 text-2xl font-bold text-ink">Resumo da reserva</h2>
                <dl className="space-y-5 pt-5">
                  <SummaryRow label="Espaco selecionado" value={summary.space} />
                  <SummaryRow label="Predio / Unidade" value={summary.building} />
                  <SummaryRow label="Capacidade estimada" value={summary.capacity} />
                  <SummaryRow label="Data e horario" value={summary.dateTime} />
                  <SummaryRow label="Solicitante" value={summary.requester} />
                </dl>
              </Card>

              <div className="flex flex-col gap-3">
                <Button
                  className="w-full"
                  disabled={
                    submitting ||
                    !form.email ||
                    !form.nome ||
                    !form.espacoId ||
                    !form.data ||
                    !form.inicio ||
                    !form.fim ||
                    !form.motivo
                  }
                >
                  {submitting ? 'Enviando...' : 'Confirmar reserva'}
                </Button>
                <Button tone="secondary" className="w-full" type="button">
                  Cancelar
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
