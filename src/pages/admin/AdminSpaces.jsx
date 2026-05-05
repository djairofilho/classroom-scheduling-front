import { useCallback, useMemo, useState } from 'react'
import { Building2, ChevronDown, Edit, PlusSquare, ToggleLeft, Trash2 } from 'lucide-react'

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
  const [pendingId, setPendingId] = useState(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [savingForm, setSavingForm] = useState(false)
  const [form, setForm] = useState({ nome: '', capacidade: '', tipo: 'SALA', predioId: '' })
  const [editingId, setEditingId] = useState(null)

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
    setCreateForm({ ...EMPTY_FORM, predioId: selectedBuildingId || '' })
    setCreateOpen(true)
  }

  async function handleCreateEspaco(event) {
    event.preventDefault()
    if (creating) return

    const capacidadeNumber = Number(createForm.capacidade)
    if (
      !createForm.nome.trim() ||
      !createForm.tipo ||
      !createForm.predioId ||
      !Number.isFinite(capacidadeNumber) ||
      capacidadeNumber <= 0
    ) {
      toast.error('Preencha todos os campos com valores válidos.')
      return
    }

    setCreating(true)
    try {
      const created = await api.createEspaco({
        nome: createForm.nome.trim(),
        tipo: createForm.tipo,
        capacidade: capacidadeNumber,
        predioId: Number(createForm.predioId),
      })
      const mapped = mapEspaco(created)
      setData((current) => ({
        ...current,
        spaces: [...current.spaces, mapped],
      }))
      toast.success(`Espaço "${mapped.name}" criado.`)
      setCreateOpen(false)
      setCreateForm(EMPTY_FORM)
    } catch (caughtError) {
      toast.error(caughtError.message || 'Não foi possível criar o espaço.')
    } finally {
      setCreating(false)
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

  function resetForm() {
    setForm({ nome: '', capacidade: '', tipo: 'SALA', predioId: '' })
  }

  function openCreateModal() {
    resetForm()
    setCreateOpen(true)
  }

  function openEditModal(space) {
    setEditingId(space.id)
    setForm({
      nome: space.name,
      capacidade: String(space.capacity),
      tipo: inferApiType(space.typeKey),
      predioId: space.buildingId ? String(space.buildingId) : '',
    })
    setEditOpen(true)
  }

  async function handleCreateSpace() {
    if (!form.nome || !form.capacidade || !form.predioId) return
    setSavingForm(true)
    try {
      const created = await api.createEspaco({
        nome: form.nome,
        capacidade: Number(form.capacidade),
        tipo: form.tipo,
        predioId: Number(form.predioId),
      })
      const mapped = mapEspaco(created)
      setData((current) => ({ ...current, spaces: [mapped, ...current.spaces] }))
      setCreateOpen(false)
      resetForm()
      toast.success('Espaço criado com sucesso.')
    } catch (caughtError) {
      toast.error(caughtError.message)
    } finally {
      setSavingForm(false)
    }
  }

  async function handleEditSpace() {
    if (!editingId || !form.nome || !form.capacidade || !form.predioId) return
    setSavingForm(true)
    try {
      const updated = await api.updateEspaco(editingId, {
        nome: form.nome,
        capacidade: Number(form.capacidade),
        tipo: form.tipo,
        predioId: Number(form.predioId),
      })
      const mapped = mapEspaco(updated)
      setData((current) => ({
        ...current,
        spaces: current.spaces.map((item) => (item.id === mapped.id ? mapped : item)),
      }))
      setEditOpen(false)
      toast.success('Espaço atualizado com sucesso.')
    } catch (caughtError) {
      toast.error(caughtError.message)
    } finally {
      setSavingForm(false)
    }
  }

  async function handleDeleteSpace(space) {
    const confirmed = window.confirm(`Deseja remover o espaço "${space.name}"?`)
    if (!confirmed) return

    setPendingId(space.id)
    try {
      await api.removeEspaco(space.id)
      setData((current) => ({
        ...current,
        spaces: current.spaces.filter((item) => item.id !== space.id),
      }))
      toast.success('Espaço removido com sucesso.')
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
          <Button onClick={openCreateModal}>
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
                        <DropdownMenuItem onClick={() => openEditModal(space)}>
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
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => handleDeleteSpace(space)}
                        >
                          <Trash2 className="h-4 w-4" />
                          Excluir espaço
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

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo espaço</DialogTitle>
          </DialogHeader>
          <SpaceFormFields
            buildings={data?.buildings ?? []}
            form={form}
            onChange={setForm}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)} disabled={savingForm}>
              Cancelar
            </Button>
            <Button onClick={handleCreateSpace} disabled={savingForm}>
              {savingForm ? 'Salvando...' : 'Criar espaço'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar espaço</DialogTitle>
          </DialogHeader>
          <SpaceFormFields
            buildings={data?.buildings ?? []}
            form={form}
            onChange={setForm}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)} disabled={savingForm}>
              Cancelar
            </Button>
            <Button onClick={handleEditSpace} disabled={savingForm}>
              {savingForm ? 'Salvando...' : 'Salvar alterações'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function SpaceFormFields({ buildings, form, onChange }) {
  return (
    <div className="grid gap-3">
      <div className="grid gap-2">
        <Label htmlFor="space-name">Nome</Label>
        <Input
          id="space-name"
          value={form.nome}
          onChange={(event) => onChange((current) => ({ ...current, nome: event.target.value }))}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="space-capacity">Capacidade</Label>
        <Input
          id="space-capacity"
          type="number"
          min={1}
          value={form.capacidade}
          onChange={(event) => onChange((current) => ({ ...current, capacidade: event.target.value }))}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="space-type">Tipo</Label>
        <select
          id="space-type"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          value={form.tipo}
          onChange={(event) => onChange((current) => ({ ...current, tipo: event.target.value }))}
        >
          <option value="SALA">Sala</option>
          <option value="LAB">Laboratório</option>
          <option value="AUDITORIO">Auditório</option>
          <option value="REUNIAO">Reunião</option>
        </select>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="space-building">Prédio</Label>
        <select
          id="space-building"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          value={form.predioId}
          onChange={(event) => onChange((current) => ({ ...current, predioId: event.target.value }))}
        >
          <option value="">Selecione</option>
          {buildings.map((building) => (
            <option key={building.id} value={String(building.id)}>
              {building.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

function inferApiType(typeKey) {
  if (typeKey === 'common.spaceTypes.lab') return 'LAB'
  if (typeKey === 'common.spaceTypes.auditorium') return 'AUDITORIO'
  if (typeKey === 'common.spaceTypes.meeting') return 'REUNIAO'
  return 'SALA'
}
