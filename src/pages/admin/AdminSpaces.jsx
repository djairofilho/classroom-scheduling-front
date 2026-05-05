import { useCallback, useMemo, useState } from 'react'
import { PlusSquare, Trash2 } from 'lucide-react'

import { ErrorBlock, LoadingBlock } from '@/components/layout/AsyncState'
import { PageHeader } from '@/components/common/PageHeader'
import { AdminTabs } from '@/components/common/AdminTabs'
import { EmptyState } from '@/components/common/EmptyState'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useAsyncData } from '@/hooks/useAsyncData'
import { useI18n } from '@/i18n/I18nProvider'
import { api } from '@/lib/api'
import { mapEspaco, mapPredio } from '@/lib/adapters'
import { toast } from '@/components/ui/sonner'

const TIPO_ESPACO_OPTIONS = [
  { value: 'SALA', label: 'Sala' },
  { value: 'AUDITORIO', label: 'Auditório' },
  { value: 'QUADRA', label: 'Quadra' },
  { value: 'LABORATORIO', label: 'Laboratório' },
]

const EMPTY_FORM = { nome: '', tipo: 'SALA', capacidade: '', predioId: '' }

export function AdminSpacesPage() {
  const { t } = useI18n()
  const [selectedBuildingId, setSelectedBuildingId] = useState('')
  const [onlyAvailable, setOnlyAvailable] = useState(false)

  const [createOpen, setCreateOpen] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  const [pendingId, setPendingId] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteError, setDeleteError] = useState('')
  const [deleting, setDeleting] = useState(false)

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

  function openCreateDialog() {
    setForm({ ...EMPTY_FORM, predioId: selectedBuildingId || '' })
    setCreateOpen(true)
  }

  async function handleCreate(event) {
    event.preventDefault()
    if (saving) return

    const capacidadeNumber = Number(form.capacidade)
    if (
      !form.nome.trim() ||
      !form.tipo ||
      !form.predioId ||
      !Number.isFinite(capacidadeNumber) ||
      capacidadeNumber <= 0
    ) {
      toast.error('Preencha todos os campos com valores válidos.')
      return
    }

    setSaving(true)
    try {
      const created = await api.createEspaco({
        nome: form.nome.trim(),
        tipo: form.tipo,
        capacidade: capacidadeNumber,
        predioId: Number(form.predioId),
      })
      const mapped = mapEspaco(created)
      setData((current) => ({ ...current, spaces: [mapped, ...current.spaces] }))
      toast.success(`Espaço "${mapped.name}" criado.`)
      setCreateOpen(false)
      setForm(EMPTY_FORM)
    } catch (caughtError) {
      toast.error(caughtError.message || 'Não foi possível criar o espaço.')
    } finally {
      setSaving(false)
    }
  }

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

  function openDeleteDialog(space) {
    setDeleteTarget(space)
    setDeleteError('')
  }

  function closeDeleteDialog() {
    setDeleteTarget(null)
    setDeleteError('')
  }

  async function handleDelete() {
    if (!deleteTarget || deleting) return
    setDeleting(true)
    setDeleteError('')
    try {
      await api.removeEspaco(deleteTarget.id)
      setData((current) => ({
        ...current,
        spaces: current.spaces.filter((item) => item.id !== deleteTarget.id),
      }))
      toast.success(`Espaço "${deleteTarget.name}" removido.`)
      setDeleteTarget(null)
    } catch (caughtError) {
      const message = caughtError.message ?? ''
      const hasReservations =
        caughtError.status === 409 ||
        message.toLowerCase().includes('reserva')
      const friendly = hasReservations
        ? 'Não é possível excluir: o espaço possui reservas associadas.'
        : message || 'Não foi possível excluir o espaço.'
      setDeleteError(friendly)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-7xl">
      <PageHeader
        title={t('admin.spaces.title')}
        description={t('admin.spaces.description')}
        actions={
          <Button onClick={openCreateDialog}>
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
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant={isAvailable ? 'outline' : 'default'}
                        size="sm"
                        disabled={pendingId === space.id}
                        onClick={() => handleToggleAvailability(space)}
                      >
                        {pendingId === space.id
                          ? t('admin.spaces.saving')
                          : isAvailable
                            ? 'Marcar indisponível'
                            : 'Marcar disponível'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => openDeleteDialog(space)}
                      >
                        <Trash2 className="h-4 w-4" />
                        Excluir
                      </Button>
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo espaço</DialogTitle>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleCreate}>
            <div className="flex flex-col gap-2">
              <Label htmlFor="new-space-nome">Nome</Label>
              <Input
                id="new-space-nome"
                placeholder="Ex.: Sala A101"
                value={form.nome}
                onChange={(event) => setForm((current) => ({ ...current, nome: event.target.value }))}
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="new-space-tipo">Tipo</Label>
                <select
                  id="new-space-tipo"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={form.tipo}
                  onChange={(event) => setForm((current) => ({ ...current, tipo: event.target.value }))}
                >
                  {TIPO_ESPACO_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="new-space-capacidade">Capacidade</Label>
                <Input
                  id="new-space-capacidade"
                  type="number"
                  min={1}
                  placeholder="Ex.: 30"
                  value={form.capacidade}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, capacidade: event.target.value }))
                  }
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="new-space-predio">Prédio</Label>
              <select
                id="new-space-predio"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={form.predioId}
                onChange={(event) => setForm((current) => ({ ...current, predioId: event.target.value }))}
                required
              >
                <option value="">Selecione o prédio...</option>
                {(data?.buildings ?? []).map((building) => (
                  <option key={building.id} value={String(building.id)}>
                    {building.name}
                  </option>
                ))}
              </select>
            </div>

            <DialogFooter className="gap-2 sm:gap-2">
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)} disabled={saving}>
                Cancelar
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Salvando...' : 'Criar espaço'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) closeDeleteDialog()
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir espaço?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget
                ? `Tem certeza que deseja remover o espaço "${deleteTarget.name}"? Esta ação não pode ser desfeita.`
                : ''}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteError && (
            <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {deleteError}
            </p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault()
                handleDelete()
              }}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? 'Excluindo...' : 'Excluir espaço'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
