import { Link } from 'react-router-dom'
import { PageIntro } from '../components/layout/PageIntro'
import { Badge, Button, Card } from '../components/layout/ui'
import { spaces } from '../lib/data'

export function SearchSpacesPage() {
  return (
    <>
      <PageIntro
        title="Encontrar espaco"
        description="Utilize os filtros abaixo para localizar a sala ideal para sua necessidade academica."
      />

      <Card className="mb-10">
        <div className="grid gap-6 md:grid-cols-12">
          <label className="md:col-span-12">
            <span className="mb-2 block text-sm font-bold text-ink">Nome ou codigo da sala</span>
            <input className="h-13 w-full rounded-2xl border border-stroke bg-panel px-4 text-sm outline-none transition focus:border-brand-red focus:ring-4 focus:ring-brand-red/10" placeholder="Ex: Sala A101" />
          </label>

          <Field className="md:col-span-3" label="Predio" type="select" options={['Todos os predios', 'Predio Alfa', 'Predio Beta', 'Hub Central']} />
          <Field className="md:col-span-2" label="Capacidade" type="select" options={['Qualquer', 'Ate 20', '21 - 50', '51+']} />
          <Field className="md:col-span-3" label="Data" type="date" />
          <Field className="md:col-span-2" label="Inicio" type="time" />
          <Field className="md:col-span-2" label="Fim" type="time" />

          <div className="md:col-span-12 flex flex-col gap-4 border-t border-stroke pt-6 md:flex-row md:items-center md:justify-between">
            <label className="flex items-center gap-3 text-sm font-semibold text-ink">
              <span className="flex h-7 w-12 items-center rounded-full bg-navy px-1">
                <span className="h-5 w-5 rounded-full bg-white translate-x-5" />
              </span>
              Somente disponiveis
            </label>
            <Button>Buscar espacos</Button>
          </div>
        </div>
      </Card>

      <div className="mb-5 flex items-end justify-between gap-4">
        <h2 className="text-2xl font-bold text-ink">Resultados</h2>
        <p className="text-sm text-ink-muted">{spaces.length} espacos encontrados</p>
      </div>

      <section className="grid gap-6 xl:grid-cols-3">
        {spaces.map((space) => (
          <Card key={space.id} className="overflow-hidden p-0">
            <div className="h-52 bg-gradient-to-br from-brand-blush via-panel to-sky-soft" />
            <div className="p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-2xl font-bold text-ink">{space.name}</h3>
                  <p className="mt-1 text-sm text-ink-muted">{space.type}</p>
                </div>
                <Badge tone={space.statusTone === 'success' ? 'success' : 'danger'}>{space.status}</Badge>
              </div>

              <div className="mt-5 space-y-2 text-sm leading-6 text-ink-muted">
                <p>{space.building}</p>
                <p>Capacidade: {space.capacity} pessoas</p>
                {space.maintenanceReason ? <p className="rounded-xl bg-brand-red/10 px-3 py-2 text-brand-red">{space.maintenanceReason}</p> : null}
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <Button className="w-full" disabled={space.statusTone === 'danger'}>
                  Reservar
                </Button>
                <Link className="inline-flex items-center justify-center rounded-2xl border border-stroke bg-white px-5 py-3 text-sm font-semibold text-ink transition hover:bg-warm-stone" to={`/espacos/${space.id}`}>
                  Detalhes
                </Link>
              </div>
            </div>
          </Card>
        ))}
      </section>
    </>
  )
}

function Field({ className = '', label, type, options = [] }) {
  return (
    <label className={className}>
      <span className="mb-2 block text-sm font-bold text-ink">{label}</span>
      {type === 'select' ? (
        <select className="h-13 w-full rounded-2xl border border-stroke bg-white px-4 text-sm outline-none transition focus:border-brand-red focus:ring-4 focus:ring-brand-red/10">
          {options.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      ) : (
        <input className="h-13 w-full rounded-2xl border border-stroke bg-white px-4 text-sm outline-none transition focus:border-brand-red focus:ring-4 focus:ring-brand-red/10" type={type} />
      )}
    </label>
  )
}
