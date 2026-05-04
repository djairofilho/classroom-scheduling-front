import { useCallback, useMemo, useState } from 'react'
import { Building2, ChevronDown, Edit, PlusSquare, ToggleLeft } from 'lucide-react'

import { ErrorBlock, LoadingBlock } from '@/components/layout/AsyncState'
import { PageHeader } from '@/components/common/PageHeader'
import { AdminTabs } from '@/components/common/AdminTabs'
import { EmptyState } from '@/components/common/EmptyState'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAsyncData } from '@/hooks/useAsyncData'
import { useI18n } from '@/i18n/I18nProvider'
import { api } from '@/lib/api'
import { mapEspaco, mapPredio } from '@/lib/adapters'
import { toast } from '@/components/ui/sonner'

export function AdminSpacesPage() {
  const { t } = useI18n()
  const [selectedBuildingId, setSelectedBuildingId] = useState('')
  const [onlyAvailable, setOnlyAvailable] = useState(false)
  const [pendingId, setPendingId] = useState(null)

  const loadAdminSpaces = useCallback(async () => {
    const [espacos, predios] = await Promise.all([api.listEspacos(), api.listPredios()])
    return {
      spaces: espacos.map(mapEspaco),
      buildings: predios.map(mapPredio),
    }
  }, [])

  const { data, loading, error, setData } = useAsyncData(loadAdminSpaces)

  const filteredSpaces = useMemo(() => {
    if (!data) return []
    return data.spaces.filter((space) => {
      const matchesBuilding = !selectedBuildingId || String(space.buildingId) === selectedBuildingId
      const matchesAvailability = !onlyAvailable || space.statusKey === 'common.statuses.available'
      return matchesBuilding && matchesAvailability
    })
  }, [data, onlyAvailable, selectedBuildingId])

  async function handleToggleAvailability(space) {
    setPendingId(space.id)
    try {
      const wasAvailable = space.statusKey === 'common.statuses.available'
      const updated = await api.updateEspacoIndisponibilidade(space.id, {
        indisponivel: wasAvailable,
        motivo: wasAvailable ? t('admin.spaces.adminReason') : null,
      })
      const mapped = mapEspaco(updated)
      setData((current) => ({
        ...current,
        spaces: current.spaces.map((item) => (item.id === mapped.id ? mapped : item)),
      }))
      toast.success(wasAvailable ? t('common.statuses.unavailable') : t('common.statuses.available'))
    } catch (caughtError) {
      toast.error(caughtError.message)
    } finally {
      setPendingId(null)
    }
  }

  return (
    <div className="mx-auto w-full max-w-7xl">
      <PageHeader
        title={t('admin.spaces.title')}
        description={t('admin.spaces.description')}
        icon={Building2}
        actions={
          <Button>
            <PlusSquare className="h-4 w-4" />
            {t('admin.spaces.newSpace')}
          </Button>
        }
      />
      <AdminTabs pair="spaces" />

      {loading && <LoadingBlock label={t('async.adminSpacesLoad')} />}
      {error && <ErrorBlock message={t('async.adminSpacesError')} />}

      {!loading && !error && data && (
        <>
          <Card className="mb-6 p-4">
            <div className="flex flex-wrap items-end gap-4">
              <div className="flex min-w-[200px] flex-1 flex-col gap-2">
                <Label htmlFor="admin-building-filter">{t('admin.spaces.building')}</Label>
                <select
                  id="admin-building-filter"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={selectedBuildingId}
                  onChange={(event) => setSelectedBuildingId(event.target.value)}
                >
                  <option value="">{t('admin.spaces.allBuildings')}</option>
                  {data.buildings.map((building) => (
                    <option key={building.id} value={String(building.id)}>
                      {building.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex h-10 items-center gap-3">
                <Switch
                  id="admin-only-available"
                  checked={onlyAvailable}
                  onCheckedChange={setOnlyAvailable}
                />
                <Label htmlFor="admin-only-available" className="cursor-pointer text-sm">
                  {t('admin.spaces.availableOnly')}
                </Label>
              </div>
            </div>
          </Card>

          {filteredSpaces.length === 0 ? (
            <EmptyState title="Nenhum espaço" description="Ajuste os filtros." />
          ) : (
            <div className="space-y-3">
              {filteredSpaces.map((space) => {
                const isAvailable = space.statusKey === 'common.statuses.available'
                return (
                  <Card
                    key={space.id}
                    className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-semibold">{space.name}</h3>
                        <StatusBadge statusKey={space.statusKey} />
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {t(space.typeKey)} · {space.building} ·{' '}
                        {t('common.patterns.peopleCount', { count: space.capacity })}
                      </p>
                      {space.maintenanceReason && (
                        <p className="mt-1 text-xs text-destructive">{space.maintenanceReason}</p>
                      )}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" disabled={pendingId === space.id}>
                          {pendingId === space.id ? t('admin.spaces.saving') : 'Status'}
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>Status</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4" />
                          {t('common.edit')}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className={isAvailable ? 'text-destructive focus:text-destructive' : ''}
                          onClick={() => handleToggleAvailability(space)}
                        >
                          <ToggleLeft className="h-4 w-4" />
                          {isAvailable
                            ? t('common.statuses.unavailable')
                            : t('common.statuses.available')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </Card>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}
