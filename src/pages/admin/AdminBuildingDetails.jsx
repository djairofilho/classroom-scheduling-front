import { useCallback, useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, DoorOpen } from 'lucide-react'

import { ErrorBlock, LoadingBlock } from '@/components/layout/AsyncState'
import { AdminTabs } from '@/components/common/AdminTabs'
import { PageHeader } from '@/components/common/PageHeader'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useAsyncData } from '@/hooks/useAsyncData'
import { api } from '@/lib/api'
import { mapEspaco, mapPredio } from '@/lib/adapters'

export function AdminBuildingDetailsPage() {
  const { buildingId } = useParams()

  const loadData = useCallback(async () => {
    const [predio, espacos] = await Promise.all([api.getPredio(buildingId), api.listEspacos()])
    const mappedBuilding = mapPredio(predio)
    const mappedSpaces = espacos.map(mapEspaco).filter((space) => space.buildingId === Number(buildingId))
    return { building: mappedBuilding, spaces: mappedSpaces }
  }, [buildingId])

  const { data, loading, error } = useAsyncData(loadData)
  const availableCount = useMemo(
    () => (data?.spaces ?? []).filter((space) => space.statusKey === 'common.statuses.available').length,
    [data],
  )

  return (
    <div className="mx-auto w-full max-w-7xl">
      <div className="mb-4">
        <Button asChild variant="ghost" size="sm" className="-ml-2">
          <Link to="/admin/predios">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>
        </Button>
      </div>
      <PageHeader
        title={data?.building?.name ?? 'Detalhes do prédio'}
        description={data ? `${data.building.code} · ${data.building.location}` : 'Carregando...'}
      />
      <AdminTabs pair="spaces" />

      {loading && <LoadingBlock label="Carregando detalhes do prédio..." />}
      {error && <ErrorBlock message="Não foi possível carregar os detalhes do prédio." />}

      {!loading && !error && data && (
        <>
          <Card className="mb-5 p-4 text-sm text-muted-foreground">
            {data.spaces.length} salas cadastradas · {availableCount} disponíveis
          </Card>
          {data.spaces.length === 0 ? (
            <Card className="p-6 text-sm text-muted-foreground">Esse prédio não possui salas cadastradas.</Card>
          ) : (
            <div className="space-y-3">
              {data.spaces.map((space) => (
                <Card key={space.id} className="flex items-center justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{space.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {space.capacity} lugares · {space.building}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge statusKey={space.statusKey} />
                    <Button asChild variant="outline" size="sm">
                      <Link to={`/espacos/${space.id}`}>
                        <DoorOpen className="h-4 w-4" />
                        Ver sala
                      </Link>
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
