import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/lib/authContext'
import { useI18n } from '@/i18n/I18nProvider'

export function LoginPage() {
  const { user, login, register } = useAuth()
  const { t } = useI18n()
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ email: '', senha: '' })
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const navigate = useNavigate()
  const location = useLocation()

  if (user) {
    return <Navigate to={location.state?.from?.pathname ?? '/'} replace />
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitting(true)
    setMessage('')

    try {
      const payload = { email: form.email, senha: form.senha }

      if (mode === 'register') {
        await register({ ...payload, papel: 'USER' })
      } else {
        await login(payload)
      }

      navigate(location.state?.from?.pathname ?? '/', { replace: true })
    } catch (error) {
      setMessage(error.message || 'Não foi possível autenticar.')
    } finally {
      setSubmitting(false)
    }
  }

  const submitDisabled = submitting || !form.email || form.senha.length < 6

  return (
    <main
      className="flex min-h-screen items-center justify-center bg-surface px-4 py-10 text-foreground"
      style={{ background: 'var(--gradient-soft)' }}
    >
      <Card className="w-full max-w-md p-8 shadow-[var(--shadow-elegant)]">
        <div className="mb-7">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">{t('shell.brand')}</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight">
            {mode === 'register' ? 'Criar conta' : 'Entrar'}
          </h1>
          <p className="mt-2 text-sm leading-7 text-muted-foreground">
            Use seu e-mail institucional do Insper para acessar reservas e notificações.
          </p>
        </div>

        <Tabs value={mode} onValueChange={setMode} className="mb-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Entrar</TabsTrigger>
            <TabsTrigger value="register">Criar conta</TabsTrigger>
          </TabsList>
        </Tabs>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2">
            <Label htmlFor="login-email">E-mail institucional</Label>
            <Input
              id="login-email"
              type="email"
              autoComplete="email"
              placeholder="aluno@al.insper.edu.br"
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="login-senha">Senha</Label>
            <Input
              id="login-senha"
              type="password"
              autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
              minLength={6}
              placeholder="Mínimo de 6 caracteres"
              value={form.senha}
              onChange={(event) => setForm((current) => ({ ...current, senha: event.target.value }))}
            />
          </div>

          <Button type="submit" size="lg" className="mt-2 w-full" disabled={submitDisabled}>
            {submitting ? 'Acessando...' : mode === 'register' ? 'Criar conta' : 'Entrar'}
          </Button>

          {message && <p className="text-sm font-medium text-destructive">{message}</p>}
        </form>
      </Card>
    </main>
  )
}
