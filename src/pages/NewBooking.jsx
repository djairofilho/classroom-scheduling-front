import { PageIntro } from '../components/layout/PageIntro'
import { Button, Card } from '../components/layout/ui'
import { spaces } from '../lib/data'

export function NewBookingPage() {
  return (
    <>
      <PageIntro
        title="Nova reserva"
        description="Preencha os dados abaixo para solicitar um novo espaco academico."
      />

      <div className="grid gap-6 xl:grid-cols-12">
        <div className="space-y-6 xl:col-span-8">
          <FormSection
            title="Dados do solicitante"
            description="Use o e-mail institucional para localizar o perfil de quem fara a solicitacao."
          >
            <Field label="Buscar por e-mail institucional" placeholder="nome.sobrenome@insper.edu.br" />
          </FormSection>

          <FormSection
            title="Selecao de espaco"
            description="Escolha primeiro o predio e depois o ambiente desejado."
          >
            <div className="grid gap-4 md:grid-cols-2">
              <SelectField label="Predio / Unidade" options={['Selecione o predio...', 'Predio Central', 'Predio Alfa', 'Hub de Inovacao']} />
              <SelectField label="Sala / Laboratorio" options={['Selecione a sala...', ...spaces.map((space) => space.name)]} />
            </div>
          </FormSection>

          <FormSection
            title="Data e horario"
            description="Informe a janela completa da reserva para evitar conflitos de agenda."
          >
            <div className="grid gap-4 md:grid-cols-3">
              <Field label="Data da reserva" type="date" />
              <Field label="Hora de inicio" type="time" />
              <Field label="Hora de termino" type="time" />
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
              />
            </label>
          </FormSection>
        </div>

        <div className="xl:col-span-4">
          <div className="sticky top-28 space-y-4">
            <Card>
              <h2 className="border-b border-stroke pb-4 text-2xl font-bold text-ink">Resumo da reserva</h2>
              <dl className="space-y-5 pt-5">
                <SummaryRow label="Espaco selecionado" value="Sala A101" />
                <SummaryRow label="Predio / Unidade" value="Predio Alfa" />
                <SummaryRow label="Capacidade estimada" value="40 pessoas" />
                <SummaryRow label="Data e horario" value="24 Nov 2026, 14:00 - 16:00" />
                <SummaryRow label="Solicitante" value="Marina Silva" />
              </dl>
            </Card>

            <div className="flex flex-col gap-3">
              <Button className="w-full">Confirmar reserva</Button>
              <Button tone="secondary" className="w-full">
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      </div>
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

function Field({ label, placeholder = '', type = 'text' }) {
  return (
    <label>
      <span className="mb-2 block text-sm font-bold text-ink">{label}</span>
      <input
        className="h-13 w-full rounded-2xl border border-stroke bg-panel px-4 text-sm outline-none transition focus:border-brand-red focus:ring-4 focus:ring-brand-red/10"
        placeholder={placeholder}
        type={type}
      />
    </label>
  )
}

function SelectField({ label, options }) {
  return (
    <label>
      <span className="mb-2 block text-sm font-bold text-ink">{label}</span>
      <select className="h-13 w-full rounded-2xl border border-stroke bg-panel px-4 text-sm outline-none transition focus:border-brand-red focus:ring-4 focus:ring-brand-red/10">
        {options.map((option) => (
          <option key={option}>{option}</option>
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
