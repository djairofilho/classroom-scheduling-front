import { useCallback, useMemo, useState } from 'react'
import { Search, UserPlus } from 'lucide-react'

import { ErrorBlock, LoadingBlock } from '@/components/layout/AsyncState'
import { PageHeader } from '@/components/common/PageHeader'
import { AdminTabs } from '@/components/common/AdminTabs'
import { EmptyState } from '@/components/common/EmptyState'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAsyncData } from '@/hooks/useAsyncData'
import { useI18n } from '@/i18n/I18nProvider'
import { api } from '@/lib/api'
import { mapReserva, mapUsuario } from '@/lib/adapters'
import { toast } from '@/components/ui/sonner'

const EMPTY_FORM = { nome: '', email: '', tipoSolicitante: 'ALUNO' }

export function AdminUsersPage() {
  const { t } = useI18n()
  const [emailTerm, setEmailTerm] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)

  const loadUsers = useCallback(async () => {
    const [usuarios, solicitantes, reservas] = await Promise.all([
      api.listUsuarios(),
      api.listSolicitantes(),
      api.listReservas(),
    ])

    const mappedReservas = reservas.map(mapReserva)

    const mappedUsuarios = usuarios.map(mapUsuario).map((user) => ({
      id: `usuario-${user.id}`,
      name: user.name,
      email: user.email,
      roleKey: 'common.statuses.user',
      requests: 0,
      isRequester: false,
    }))

    const mappedSolicitantes = solicitantes.map((solicitante) => ({
      id: `solicitante-${solicitante.id}`,
      name: solicitante.nome,
      email: solicitante.email,
      roleKey: 'common.statuses.requester',
      requests: mappedReservas.filter((reservation) => reservation.solicitanteId === solicitante.id).length,
      isRequester: true,
    }))

    return [...mappedUsuarios, ...mappedSolicitantes]
  }, [])

  const { data, loading, error, setData } = useAsyncData(loadUsers)

  const filteredUsers = useMemo(() => {
    const users = data ?? []
    if (!emailTerm) return users
    return users.filter((user) => user.email.toLowerCase().includes(emailTerm.toLowerCase()))
  }, [data, emailTerm])

  function openCreate() {
    setForm(EMPTY_FORM)
    setCreateOpen(true)
  }

  async function handleCreate(event) {
    event.preventDefault()
    if (!form.nome || !form.email) return
    setSaving(true)
    try {
      const created = await api.createSolicitante(form)
      const mapped = {
        id: `solicitante-${created.id}`,
        name: created.nome,
        email: created.email,
        roleKey: 'common.statuses.requester',
        requests: 0,
        isRequester: true,
      }
      setData((current) => [mapped, ...current])
      setCreateOpen(false)
      setForm(EMPTY_FORM)
      toast.success('Solicitante criado com sucesso.')
    } catch (caughtError) {
      toast.error(caughtError.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-7xl">
      <PageHeader
        title={t('admin.users.title')}
        description={t('admin.users.description')}
        actions={
          <Button onClick={openCreate}>
            <UserPlus className="h-4 w-4" />
            {t('admin.users.newRequester')}
          </Button>
        }
      />
      <AdminTabs pair="users" />

      {loading && <LoadingBlock label={t('async.usersLoad')} />}
      {error && <ErrorBlock message={t('async.usersError')} />}

      {!loading && !error && data && (
        <Card className="overflow-hidden p-0">
          <div className="border-b p-4">
            <div className="relative max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder={t('admin.users.searchByEmail')}
                value={emailTerm}
                onChange={(event) => setEmailTerm(event.target.value)}
              />
            </div>
          </div>

          {filteredUsers.length === 0 ? (
            <div className="p-6">
              <EmptyState title="Nenhum usuário" description="Tente ajustar a busca." />
            </div>
          ) : (
            <ul className="divide-y">
              {filteredUsers.map((user) => (
                <li key={user.id} className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar className="h-10 w-10 border">
                      <AvatarFallback className="bg-primary-soft text-sm font-semibold text-primary">
                        {(user.name?.[0] ?? '?').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{user.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    <Badge variant={user.isRequester ? 'default' : 'secondary'}>{t(user.roleKey)}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {user.requests} {user.requests === 1 ? 'solicitação' : 'solicitações'}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo solicitante</DialogTitle>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleCreate}>
            <div className="flex flex-col gap-2">
              <Label htmlFor="requester-name">Nome</Label>
              <Input
                id="requester-name"
                value={form.nome}
                onChange={(event) => setForm((current) => ({ ...current, nome: event.target.value }))}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="requester-email">E-mail</Label>
              <Input
                id="requester-email"
                type="email"
                value={form.email}
                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="requester-type">Tipo</Label>
              <select
                id="requester-type"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={form.tipoSolicitante}
                onChange={(event) =>
                  setForm((current) => ({ ...current, tipoSolicitante: event.target.value }))
                }
              >
                <option value="ALUNO">Aluno</option>
                <option value="FUNCIONARIO">Funcionário</option>
              </select>
            </div>
            <DialogFooter className="gap-2 sm:gap-2">
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)} disabled={saving}>
                Cancelar
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Salvando...' : 'Criar solicitante'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
