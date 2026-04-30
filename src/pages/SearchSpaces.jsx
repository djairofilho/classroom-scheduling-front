import { useCallback, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ErrorBlock, LoadingBlock } from '../components/layout/AsyncState'
import { PageIntro } from '../components/layout/PageIntro'
import { Badge, Card } from '../components/layout/ui'
import { useAsyncData } from '../hooks/useAsyncData'
import { useI18n } from '../i18n/I18nProvider'
import { api } from '../lib/api'
import { mapEspaco, mapPredio } from '../lib/adapters'

export function SearchSpacesPage() {
  const { t } = useI18n()
  const [term, setTerm] = useState('')
  const [buildingId, setBuildingId] = useState('')
  const [capacity, setCapacity] = useState('any')
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
        capacity === 'any' ||
        (capacity === 'up-to-20' && space.capacity <= 20) ||
        (capacity === '21 - 50' && space.capacity >= 21 && space.capacity <= 50) ||
        (capacity === '51+' && space.capacity >= 51)

      const matchesAvailability = !onlyAvailable || space.statusKey === 'common.statuses.available'

      return matchesTerm && matchesBuilding && matchesCapacity && matchesAvailability
    })
  }, [buildingId, capacity, data, onlyAvailable, term])

  return (
    <>
      <PageIntro
        title={t('search.title')}
        description={t('search.description')}
      />

      <Card className="mb-10">
        <div className="grid gap-6 md:grid-cols-12">
          <label className="md:col-span-12">
            <span className="mb-2 block text-sm font-bold text-ink">{t('search.nameOrCode')}</span>
            <input
              className="h-13 w-full rounded-2xl border border-stroke bg-panel px-4 text-sm outline-none transition focus:border-brand-red focus:ring-4 focus:ring-brand-red/10"
              placeholder="Ex: Sala A101"
              value={term}
              onChange={(event) => setTerm(event.target.value)}
            />
          </label>

          <Field
            className="md:col-span-3"
            label={t('search.building')}
            type="select"
            value={buildingId}
            onChange={setBuildingId}
            options={[
              { value: '', label: t('search.allBuildings') },
              ...((data?.buildings ?? []).map((building) => ({
                value: String(building.id),
                label: building.name,
              }))),
            ]}
          />
          <Field
            className="md:col-span-2"
            label={t('search.capacity')}
            type="select"
            value={capacity}
            onChange={setCapacity}
            options={[
              { value: 'any', label: t('search.capacityAny') },
              { value: 'up-to-20', label: t('search.capacityUpTo20') },
              { value: '21 - 50', label: '21 - 50' },
              { value: '51+', label: '51+' },
            ]}
          />
          <Field className="md:col-span-3" label={t('search.date')} type="date" />
          <Field className="md:col-span-2" label={t('search.start')} type="time" />
          <Field className="md:col-span-2" label={t('search.end')} type="time" />

          <div className="md:col-span-12 flex flex-col gap-4 border-t border-stroke pt-6 md:flex-row md:items-center md:justify-between">
            <label className="flex items-center gap-3 text-sm font-semibold text-ink">
              <button
                className={`flex h-7 w-12 items-center rounded-full px-1 ${onlyAvailable ? 'bg-navy' : 'bg-stroke'}`}
                onClick={() => setOnlyAvailable((current) => !current)}
                type="button"
              >
                <span className={`h-5 w-5 rounded-full bg-white transition ${onlyAvailable ? 'translate-x-5' : ''}`} />
              </button>
              <span>{t('search.availableOnly')}</span>
            </label>
            <div className="text-sm text-ink-muted">
              {t('search.timeHint')}
            </div>
          </div>
        </div>
      </Card>

      {loading ? <LoadingBlock label={t('async.spacesLoad')} /> : null}
      {error ? <ErrorBlock message={t('async.spacesError')} /> : null}

      {!loading && !error && data ? (
        <>
          <div className="mb-5 flex items-end justify-between gap-4">
            <h2 className="text-2xl font-bold text-ink">{t('search.results')}</h2>
            <p className="text-sm text-ink-muted">{t('search.foundCount', { count: filteredSpaces.length })}</p>
          </div>

          <section className="grid gap-6 xl:grid-cols-3">
            {filteredSpaces.map((space) => (
              <Card key={space.id} className="overflow-hidden p-0">
                <div className="h-52 bg-gradient-to-br from-brand-blush via-panel to-sky-soft" />
                <div className="p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-2xl font-bold text-ink">{space.name}</h3>
                      <p className="mt-1 text-sm text-ink-muted">{t(space.typeKey)}</p>
                    </div>
                    <Badge tone={space.statusTone === 'success' ? 'success' : 'danger'}>{t(space.statusKey)}</Badge>
                  </div>

                  <div className="mt-5 space-y-2 text-sm leading-6 text-ink-muted">
                    <p>{space.building}</p>
                    <p>{t('search.capacityPeople', { count: space.capacity })}</p>
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
                      {t('common.reserve')}
                    </Link>
                    <Link
                      className="inline-flex items-center justify-center rounded-2xl border border-stroke bg-white px-5 py-3 text-sm font-semibold text-ink transition hover:bg-warm-stone"
                      to={`/espacos/${space.id}`}
                    >
                      {t('common.details')}
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
