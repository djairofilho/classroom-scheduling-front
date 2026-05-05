import { useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, UserCircle2 } from 'lucide-react'

import { ErrorBlock, LoadingBlock } from '@/components/layout/AsyncState'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useAsyncData } from '@/hooks/useAsyncData'
import { api, getAuthToken } from '@/lib/api'
import { useAuth } from '@/lib/authContext'

export function ProfilePage() {
  const navigate = useNavigate()
  const { logout } = useAuth()

  const loadProfile = useCallback(async () => {
    if (!getAuthToken()) {
      const error = new Error('Sessão expirada. Faça login novamente.')
      error.status = 401
      throw error
    }
    return api.getMyProfile()
  }, [])

  const { data, loading, error, reload } = useAsyncData(loadProfile)

  useEffect(() => {
    if (error?.status === 401 || error?.status === 403) {
      logout()
      navigate('/login', {
        replace: true,
        state: { sessionExpiredMessage: 'Sessão expirada. Faça login novamente.' },
      })
    }
  }, [error, logout, navigate])

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="mx-auto w-full max-w-4xl">
      <PageHeader
        title="Perfil"
        description="Dados da sua conta autenticada."
        icon={UserCircle2}
        actions={
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        }
      />

      {loading && <LoadingBlock label="Carregando perfil..." />}

      {!loading && error && (
        <div className="space-y-3">
          <ErrorBlock message="Não foi possível carregar seu perfil." />
          <div className="flex justify-end">
            <Button onClick={reload}>Tentar novamente</Button>
          </div>
        </div>
      )}

      {!loading && !error && data && (
        <Card className="space-y-4 p-5">
          <InfoRow label="Nome" value={data.nome} />
          <InfoRow label="Email" value={data.email} />
          <InfoRow label="Papel" value={data.papel} />
          <InfoRow label="Tipo de solicitante" value={data.tipoSolicitante ?? '—'} />
          <InfoRow label="Status" value={data.ativo === false ? 'Inativo' : 'Ativo'} />
          <InfoRow label="ID" value={String(data.id)} />
        </Card>
      )}
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3 text-sm last:border-b-0 last:pb-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}
