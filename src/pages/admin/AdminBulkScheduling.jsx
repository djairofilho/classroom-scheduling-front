import { useCallback, useMemo, useState } from 'react'
import { CalendarRange } from 'lucide-react'

import { ErrorBlock, LoadingBlock } from '@/components/layout/AsyncState'
import { AdminTabs } from '@/components/common/AdminTabs'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/components/ui/sonner'
import { useAsyncData } from '@/hooks/useAsyncData'
import { api } from '@/lib/api'
import { mapEspaco, mapPredio } from '@/lib/adapters'
import { useAuth } from '@/lib/authContext'

const WEEKDAYS = [
  { key: 1, label: 'Seg' },
  { key: 2, label: 'Ter' },
  { key: 3, label: 'Qua' },
  { key: 4, label: 'Qui' },
  { key: 5, label: 'Sex' },
  { key: 6, label: 'Sáb' },
]

export function AdminBulkSchedulingPage() {
  const { user } = useAuth()
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    predioId: '',
    espacoId: '',
    dataInicio: '',
    dataFim: '',
    horaInicio: '',
    horaFim: '',
    motivo: '',
  })
  const [selectedWeekdays, setSelectedWeekdays] = useState([1, 2, 3, 4, 5])

  const loadData = useCallback(async () => {
    const [predios, espacos] = await Promise.all([api.listPredios(), api.listEspacos()])
    return {
      buildings: predios.map(mapPredio),
      spaces: espacos.map(mapEspaco),
    }
  }, [])

  const { data, loading, error } = useAsyncData(loadData)

  const filteredSpaces = useMemo(() => {
    if (!data) return []
    return data.spaces.filter((space) => !form.predioId || String(space.buildingId) === String(form.predioId))
  }, [data, form.predioId])

  const invalidPeriod = form.dataInicio && form.dataFim && form.dataInicio > form.dataFim
  const invalidTime = form.horaInicio && form.horaFim && form.horaInicio >= form.horaFim
  const formInvalid =
    !form.espacoId ||
    !form.dataInicio ||
    !form.dataFim ||
    !form.horaInicio ||
    !form.horaFim ||
    !form.motivo ||
    selectedWeekdays.length === 0 ||
    invalidPeriod ||
    invalidTime

  function toggleWeekday(day) {
    setSelectedWeekdays((current) =>
      current.includes(day) ? current.filter((item) => item !== day) : [...current, day].sort(),
    )
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (formInvalid) return

    setSubmitting(true)
    try {
      const response = await api.createReservasEmMassa({
        solicitanteId: user.id,
        espacoId: Number(form.espacoId),
        dataInicio: form.dataInicio,
        dataFim: form.dataFim,
        diasSemana: selectedWeekdays,
        horaInicio: form.horaInicio,
        horaFim: form.horaFim,
        motivo: form.motivo,
      })

      const createdCount = response?.quantidadeCriada ?? response?.createdCount ?? 0
      const skippedCount = response?.quantidadeIgnorada ?? response?.skippedCount ?? 0
      toast.success(
        createdCount || skippedCount
          ? `Agendamento concluído. Criadas: ${createdCount} | Ignoradas: ${skippedCount}`
          : 'Agendamento em massa concluído.',
      )
    } catch (caughtError) {
      toast.error(caughtError.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl">
      <PageHeader
        title="Agendamento em massa"
        description="Selecione período, dias e horário para criar reservas recorrentes de uma vez."
        icon={CalendarRange}
      />
      <AdminTabs pair="users" />

      {loading && <LoadingBlock label="Carregando prédios e espaços..." />}
      {error && <ErrorBlock message="Não foi possível carregar os dados para agendamento em massa." />}

      {!loading && !error && data && (
        <form onSubmit={handleSubmit}>
          <Card className="space-y-5 p-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="bulk-building">Prédio</Label>
                <select
                  id="bulk-building"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={form.predioId}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, predioId: event.target.value, espacoId: '' }))
                  }
                >
                  <option value="">Selecione o prédio</option>
                  {data.buildings.map((building) => (
                    <option key={building.id} value={String(building.id)}>
                      {building.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="bulk-space">Espaço</Label>
                <select
                  id="bulk-space"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={form.espacoId}
                  onChange={(event) => setForm((current) => ({ ...current, espacoId: event.target.value }))}
                >
                  <option value="">Selecione o espaço</option>
                  {filteredSpaces.map((space) => (
                    <option key={space.id} value={String(space.id)}>
                      {space.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="bulk-start-date">Data inicial</Label>
                <Input
                  id="bulk-start-date"
                  type="date"
                  value={form.dataInicio}
                  onChange={(event) => setForm((current) => ({ ...current, dataInicio: event.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="bulk-end-date">Data final</Label>
                <Input
                  id="bulk-end-date"
                  type="date"
                  value={form.dataFim}
                  onChange={(event) => setForm((current) => ({ ...current, dataFim: event.target.value }))}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="bulk-start-time">Hora de início</Label>
                <Input
                  id="bulk-start-time"
                  type="time"
                  value={form.horaInicio}
                  onChange={(event) => setForm((current) => ({ ...current, horaInicio: event.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="bulk-end-time">Hora de término</Label>
                <Input
                  id="bulk-end-time"
                  type="time"
                  value={form.horaFim}
                  onChange={(event) => setForm((current) => ({ ...current, horaFim: event.target.value }))}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Dias da semana</Label>
              <div className="flex flex-wrap gap-2">
                {WEEKDAYS.map((day) => {
                  const selected = selectedWeekdays.includes(day.key)
                  return (
                    <Button
                      key={day.key}
                      type="button"
                      variant={selected ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => toggleWeekday(day.key)}
                    >
                      {day.label}
                    </Button>
                  )
                })}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="bulk-reason">Motivo</Label>
              <Textarea
                id="bulk-reason"
                rows={4}
                value={form.motivo}
                onChange={(event) => setForm((current) => ({ ...current, motivo: event.target.value }))}
                placeholder="Ex.: Aula recorrente de revisão de cálculo."
              />
            </div>

            {invalidPeriod && <p className="text-sm text-destructive">A data final deve ser maior ou igual à data inicial.</p>}
            {invalidTime && <p className="text-sm text-destructive">A hora final deve ser maior que a hora inicial.</p>}

            <div className="flex justify-end">
              <Button type="submit" disabled={formInvalid || submitting}>
                {submitting ? 'Salvando...' : 'Salvar agendamento em massa'}
              </Button>
            </div>
          </Card>
        </form>
      )}
    </div>
  )
}
