import { useCallback, useMemo, useState } from 'react'
import { ChevronDown, Edit, Search, Trash2, Users as UsersIcon, UserPlus } from 'lucide-react'

import { ErrorBlock, LoadingBlock } from '@/components/layout/AsyncState'
import { PageHeader } from '@/components/common/PageHeader'
import { AdminTabs } from '@/components/common/AdminTabs'
import { EmptyState } from '@/components/common/EmptyState'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
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
import { mapReserva, mapUsuario } from '@/lib/adapters'

export function AdminUsersPage() {
  const { t } = useI18n()
  const [emailTerm, setEmailTerm] = useState('')

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
      statusKey: 'common.statuses.active',
      isRequester: false,
    }))

    const mappedSolicitantes = solicitantes.map((solicitante) => ({
      id: `solicitante-${solicitante.id}`,
      name: solicitante.nome,
      email: solicitante.email,
      roleKey: 'common.statuses.requester',
      requests: mappedReservas.filter((reservation) => reservation.solicitanteId === solicitante.id).length,
      statusKey: 'common.statuses.requester',
      isRequester: true,
    }))

    return [...mappedUsuarios, ...mappedSolicitantes]
  }, [])

  const { data, loading, error } = useAsyncData(loadUsers)

  const filteredUsers = useMemo(() => {
    const users = data ?? []
    if (!emailTerm) return users
    return users.filter((user) => user.email.toLowerCase().includes(emailTerm.toLowerCase()))
  }, [data, emailTerm])

  return (
    <div className="mx-auto w-full max-w-7xl">
      <PageHeader
        title={t('admin.users.title')}
        description={t('admin.users.description')}
        icon={UsersIcon}
        actions={
          <Button>
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
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          Status
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel>Status</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4" />
                          {t('common.edit')}
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive focus:text-destructive">
                          <Trash2 className="h-4 w-4" />
                          {t('admin.users.manage')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}
    </div>
  )
}
