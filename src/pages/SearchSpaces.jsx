import { useCallback, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ErrorBlock, LoadingBlock } from '../components/layout/AsyncState'
import { PageIntro } from '../components/layout/PageIntro'
import { Badge, Card } from '../components/layout/ui'
import { useAsyncData } from '../hooks/useAsyncData'
import { api } from '../lib/api'
import { mapEspaco, mapPredio } from '../lib/adapters'

export function SearchSpacesPage() {
  const [term, setTerm] = useState('')
  const [buildingId, setBuildingId] = useState('')
  const [capacity, setCapacity] = useState('Qualquer')
  const [onlyAvailable, setOnlyAvailable] = useState(true)

  const loadSpaces = useCallback(async () => {
    const [espacos, predios] = await Promise.all([api.listEspacos(), api.listPredios()])
    return {
      spaces: espacos.map(mapEspaco),
      buildings: predios.map(mapPredio),
    }
  }, [])

  const { data, loading, error } = useAsyncData(loadSpaces)

  const filteredSpaces = useMemo(() => {
    if (!data) return []

    return data.spaces.filter((space) => {
      const matchesTerm =
        !term ||
        space.name.toLowerCase().includes(term.toLowerCase()) ||
        space.building.toLowerCase().includes(term.toLowerCase()) ||
        String(space.id).includes(term)

      const matchesBuilding = !buildingId || String(space.buildingId) === buildingId

      const matchesCapacity =
        capacity === 'Qualquer' ||
        (capacity === 'Ate 20' && space.capacity <= 20) ||
        (capacity === '21 - 50' && space.capacity >= 21 && space.capacity <= 50) ||
        (capacity === '51+' && space.capacity >= 51)

      const matchesAvailability = !onlyAvailable || space.status === 'Disponivel'

      return matchesTerm && matchesBuilding && matchesCapacity && matchesAvailability
    })
  }, [buildingId, capacity, data, onlyAvailable, term])

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
            <input
              className="h-13 w-full rounded-2xl border border-stroke bg-panel px-4 text-sm outline-none transition focus:border-brand-red focus:ring-4 focus:ring-brand-red/10"
              placeholder="Ex: Sala A101"
              value={term}
              onChange={(event) => setTerm(event.target.value)}
            />
          </label>

          <Field
            className="md:col-span-3"
            label="Predio"
            type="select"
            value={buildingId}
            onChange={setBuildingId}
            options={[
              { value: '', label: 'Todos os predios' },
              ...((data?.buildings ?? []).map((building) => ({
                value: String(building.id),
                label: building.name,
              }))),
            ]}
          />
          <Field
            className="md:col-span-2"
            label="Capacidade"
            type="select"
            value={capacity}
            onChange={setCapacity}
            options={[
              { value: 'Qualquer', label: 'Qualquer' },
              { value: 'Ate 20', label: 'Ate 20' },
              { value: '21 - 50', label: '21 - 50' },
              { value: '51+', label: '51+' },
            ]}
          />
          <Field className="md:col-span-3" label="Data" type="date" />
          <Field className="md:col-span-2" label="Inicio" type="time" />
          <Field className="md:col-span-2" label="Fim" type="time" />

          <div className="md:col-span-12 flex flex-col gap-4 border-t border-stroke pt-6 md:flex-row md:items-center md:justify-between">
            <label className="flex items-center gap-3 text-sm font-semibold text-ink">
              <button
                className={`flex h-7 w-12 items-center rounded-full px-1 ${onlyAvailable ? 'bg-navy' : 'bg-stroke'}`}
                onClick={() => setOnlyAvailable((current) => !current)}
                type="button"
              >
                <span className={`h-5 w-5 rounded-full bg-white transition ${onlyAvailable ? 'translate-x-5' : ''}`} />
              </button>
              <span>Somente disponiveis</span>
            </label>
            <div className="text-sm text-ink-muted">
              Filtros de data e horario dependem da validacao do backend no momento da reserva.
            </div>
          </div>
        </div>
      </Card>

      {loading ? <LoadingBlock label="Carregando espacos do backend..." /> : null}
      {error ? <ErrorBlock message="Nao foi possivel listar os espacos da API." /> : null}

      {!loading && !error && data ? (
        <>
          <div className="mb-5 flex items-end justify-between gap-4">
            <h2 className="text-2xl font-bold text-ink">Resultados</h2>
            <p className="text-sm text-ink-muted">{filteredSpaces.length} espacos encontrados</p>
          </div>

          <section className="grid gap-6 xl:grid-cols-3">
            {filteredSpaces.map((space) => (
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
                    {space.maintenanceReason ? (
                      <p className="rounded-xl bg-brand-red/10 px-3 py-2 text-brand-red">{space.maintenanceReason}</p>
                    ) : null}
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <Link
                      className={`inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold transition ${
                        space.statusTone === 'danger'
                          ? 'cursor-not-allowed bg-stroke text-ink-muted'
                          : 'bg-brand-red text-white hover:bg-brand-red-dark'
                      }`}
                      to={space.statusTone === 'danger' ? '#' : `/reservas/nova?espacoId=${space.id}`}
                    >
                      Reservar
                    </Link>
                    <Link
                      className="inline-flex items-center justify-center rounded-2xl border border-stroke bg-white px-5 py-3 text-sm font-semibold text-ink transition hover:bg-warm-stone"
                      to={`/espacos/${space.id}`}
                    >
                      Detalhes
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </section>
        </>
      ) : null}
    </>
  )
}

function Field({ className = '', label, type, options = [], value, onChange }) {
  return (
    <label className={className}>
      <span className="mb-2 block text-sm font-bold text-ink">{label}</span>
      {type === 'select' ? (
        <select
          className="h-13 w-full rounded-2xl border border-stroke bg-white px-4 text-sm outline-none transition focus:border-brand-red focus:ring-4 focus:ring-brand-red/10"
          value={value}
          onChange={(event) => onChange?.(event.target.value)}
        >
          {options.map((option) => (
            <option key={option.value ?? option} value={option.value ?? option}>
              {option.label ?? option}
            </option>
          ))}
        </select>
      ) : (
        <input className="h-13 w-full rounded-2xl border border-stroke bg-white px-4 text-sm outline-none transition focus:border-brand-red focus:ring-4 focus:ring-brand-red/10" type={type} />
      )}
    </label>
  )
}
