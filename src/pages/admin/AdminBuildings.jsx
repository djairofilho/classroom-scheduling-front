import { useCallback, useState } from 'react'
import { Edit, Layers, MapPin, PlusSquare, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'

import { ErrorBlock, LoadingBlock } from '@/components/layout/AsyncState'
import { PageHeader } from '@/components/common/PageHeader'
import { AdminTabs } from '@/components/common/AdminTabs'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useAsyncData } from '@/hooks/useAsyncData'
import { useI18n } from '@/i18n/I18nProvider'
import { api } from '@/lib/api'
import { mapEspaco, mapPredio } from '@/lib/adapters'
import { cn } from '@/lib/utils'
import { toast } from '@/components/ui/sonner'

const HEADER_GRADIENTS = [
  'bg-gradient-to-br from-primary/20 via-primary-soft to-card',
  'bg-gradient-to-br from-secondary via-muted to-card',
  'bg-gradient-to-br from-success/20 via-card to-primary-soft',
]

export function AdminBuildingsPage() {
  const { t } = useI18n()
  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({ nome: '', codigo: '', localizacao: '' })

  const loadBuildings = useCallback(async () => {
    const [predios, espacos] = await Promise.all([api.listPredios(), api.listEspacos()])
    const mappedBuildings = predios.map(mapPredio)
    const mappedSpaces = espacos.map(mapEspaco)

    return mappedBuildings.map((building) => {
      const rooms = mappedSpaces.filter((space) => space.buildingId === building.id)
      const availableCount = rooms.filter((space) => space.statusKey === 'common.statuses.available').length

      return {
        ...building,
        roomsCount: rooms.length,
        occupancy: rooms.length
          ? `${Math.round(((rooms.length - availableCount) / rooms.length) * 100)}%`
          : '0%',
        statusKey:
          availableCount === rooms.length
            ? 'common.statuses.operating'
            : availableCount === 0
              ? 'common.statuses.attention'
              : 'common.statuses.partial',
      }
    })
  }, [])

  const { data, loading, error, setData } = useAsyncData(loadBuildings)

  function resetForm() {
    setForm({ nome: '', codigo: '', localizacao: '' })
  }

  function openCreate() {
    resetForm()
    setCreateOpen(true)
  }

  function openEdit(building) {
    setEditingId(building.id)
    setForm({ nome: building.name, codigo: building.code, localizacao: building.location })
    setEditOpen(true)
  }

  async function handleCreate() {
    if (!form.nome || !form.codigo || !form.localizacao) return
    setSaving(true)
    try {
      const created = await api.createPredio(form)
      const mapped = mapPredio(created)
      setData((current) => [
        {
          ...mapped,
          roomsCount: 0,
          occupancy: '0%',
          statusKey: 'common.statuses.operating',
        },
        ...current,
      ])
      setCreateOpen(false)
      toast.success('Prédio criado com sucesso.')
    } catch (caughtError) {
      toast.error(caughtError.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleEdit() {
    if (!editingId || !form.nome || !form.codigo || !form.localizacao) return
    setSaving(true)
    try {
      const updated = await api.updatePredio(editingId, form)
      const mapped = mapPredio(updated)
      setData((current) =>
        current.map((item) => (item.id === mapped.id ? { ...item, ...mapped } : item)),
      )
      setEditOpen(false)
      toast.success('Prédio atualizado com sucesso.')
    } catch (caughtError) {
      toast.error(caughtError.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(building) {
    const confirmed = window.confirm(
      `Deseja remover o prédio "${building.name}"? Essa ação deve remover as salas relacionadas em cascata.`,
    )
    if (!confirmed) return
    setSaving(true)
    try {
      await api.removePredio(building.id)
      setData((current) => current.filter((item) => item.id !== building.id))
      toast.success('Prédio removido com sucesso.')
    } catch (caughtError) {
      toast.error(caughtError.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-7xl">
      <PageHeader
        eyebrow={t('admin.buildings.eyebrow')}
        title={t('admin.buildings.title')}
        description={t('admin.buildings.description')}
        icon={Layers}
        actions={
          <Button onClick={openCreate}>
            <PlusSquare className="h-4 w-4" />
            {t('admin.buildings.newBuilding')}
          </Button>
        }
      />
      <AdminTabs pair="spaces" />

      {loading && <LoadingBlock label={t('async.buildingsLoad')} />}
      {error && <ErrorBlock message={t('async.buildingsError')} />}

      {!loading && !error && data && (
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((building, index) => (
            <Card key={building.id} className="overflow-hidden p-0">
              <div className={cn('h-28 w-full', HEADER_GRADIENTS[index % HEADER_GRADIENTS.length])} />
              <div className="space-y-3 p-5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-base font-semibold">{building.name}</h3>
                    <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" />
                      {building.location}
                    </p>
                  </div>
                  <StatusBadge statusKey={building.statusKey} />
                </div>
                <Separator />
                <dl className="grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <dt className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                      {t('admin.buildings.code')}
                    </dt>
                    <dd className="mt-0.5 font-semibold">{building.code}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                      {t('admin.buildings.rooms')}
                    </dt>
                    <dd className="mt-0.5 font-semibold">{building.roomsCount}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                      {t('admin.buildings.occupancy')}
                    </dt>
                    <dd className="mt-0.5 font-semibold">{building.occupancy}</dd>
                  </div>
                </dl>
                <div className="flex gap-2 pt-1">
                  <Button asChild variant="outline" size="sm" className="flex-1">
                    <Link to={`/admin/predios/${building.id}`}>
                    {t('admin.buildings.viewDetails')}
                    </Link>
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => openEdit(building)}>
                    <Edit className="h-4 w-4" />
                    {t('common.edit')}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDelete(building)}
                    disabled={saving}
                  >
                    <Trash2 className="h-4 w-4" />
                    Excluir
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </section>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo prédio</DialogTitle>
          </DialogHeader>
          <BuildingForm form={form} onChange={setForm} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button onClick={handleCreate} disabled={saving}>
              {saving ? 'Salvando...' : 'Criar prédio'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar prédio</DialogTitle>
          </DialogHeader>
          <BuildingForm form={form} onChange={setForm} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button onClick={handleEdit} disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar alterações'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function BuildingForm({ form, onChange }) {
  return (
    <div className="grid gap-3">
      <div className="grid gap-2">
        <Label htmlFor="building-name">Nome</Label>
        <Input
          id="building-name"
          value={form.nome}
          onChange={(event) => onChange((current) => ({ ...current, nome: event.target.value }))}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="building-code">Código</Label>
        <Input
          id="building-code"
          value={form.codigo}
          onChange={(event) => onChange((current) => ({ ...current, codigo: event.target.value }))}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="building-location">Localização</Label>
        <Input
          id="building-location"
          value={form.localizacao}
          onChange={(event) => onChange((current) => ({ ...current, localizacao: event.target.value }))}
        />
      </div>
    </div>
  )
}
