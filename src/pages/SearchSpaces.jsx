import { useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search as SearchIcon, Users } from 'lucide-react'

import { ErrorBlock } from '@/components/layout/AsyncState'
import { PageHeader } from '@/components/common/PageHeader'
import { EmptyState } from '@/components/common/EmptyState'
import { RoomCard } from '@/components/common/RoomCard'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import { useAsyncData } from '@/hooks/useAsyncData'
import { useI18n } from '@/i18n/I18nProvider'
import { api } from '@/lib/api'
import { mapEspaco, mapPredio } from '@/lib/adapters'

export function SearchSpacesPage() {
  const { t } = useI18n()
  const navigate = useNavigate()
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
        (capacity === '21-50' && space.capacity >= 21 && space.capacity <= 50) ||
        (capacity === '51+' && space.capacity >= 51)

      const matchesAvailability = !onlyAvailable || space.statusKey === 'common.statuses.available'

      return matchesTerm && matchesBuilding && matchesCapacity && matchesAvailability
    })
  }, [buildingId, capacity, data, onlyAvailable, term])

  const handleReserve = (space) => navigate(`/reservas/nova?espacoId=${space.id}`)

  return (
    <div className="mx-auto w-full max-w-7xl">
      <PageHeader title={t('search.title')} description={t('search.description')} />

      <Card className="mb-6 p-4">
        <div className="grid gap-3 md:grid-cols-12">
          <div className="relative md:col-span-5">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder={t('search.nameOrCode')}
              value={term}
              onChange={(event) => setTerm(event.target.value)}
            />
          </div>

          <div className="md:col-span-3">
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={buildingId}
              onChange={(event) => setBuildingId(event.target.value)}
            >
              <option value="">{t('search.allBuildings')}</option>
              {(data?.buildings ?? []).map((building) => (
                <option key={building.id} value={String(building.id)}>
                  {building.name}
                </option>
              ))}
            </select>
          </div>

          <div className="relative md:col-span-2">
            <Users className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background py-2 pl-9 pr-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={capacity}
              onChange={(event) => setCapacity(event.target.value)}
            >
              <option value="any">{t('search.capacityAny')}</option>
              <option value="up-to-20">{t('search.capacityUpTo20')}</option>
              <option value="21-50">21 - 50</option>
              <option value="51+">51+</option>
            </select>
          </div>

          <div className="flex items-center gap-3 md:col-span-2">
            <Switch id="search-only-available" checked={onlyAvailable} onCheckedChange={setOnlyAvailable} />
            <Label htmlFor="search-only-available" className="cursor-pointer text-sm">
              {t('search.availableOnly')}
            </Label>
          </div>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">{t('search.timeHint')}</p>
      </Card>

      {loading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-[420px] rounded-lg" />
          ))}
        </div>
      )}
      {error && <ErrorBlock message={t('async.spacesError')} />}

      {!loading && !error && data && (
        <>
          <div className="mb-4 flex items-end justify-between gap-4">
            <h2 className="text-lg font-semibold">{t('search.results')}</h2>
            <p className="text-sm text-muted-foreground">
              {t('search.foundCount', { count: filteredSpaces.length })}
            </p>
          </div>

          {filteredSpaces.length === 0 ? (
            <EmptyState
              title="Nenhum espaço encontrado"
              description="Ajuste os filtros para ampliar a busca."
            />
          ) : (
            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredSpaces.map((space) => (
                <RoomCard key={space.id} space={space} onReserve={handleReserve} />
              ))}
            </section>
          )}
        </>
      )}
    </div>
  )
}
