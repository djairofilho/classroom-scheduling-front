import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Button, Card } from '../components/layout/ui'
import { useAuth } from '../lib/authContext'

export function LoginPage() {
  const { user, login, register } = useAuth()
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
      const payload = {
        email: form.email,
        senha: form.senha,
      }

      if (mode === 'register') {
        await register(payload)
      } else {
        await login(payload)
      }

      navigate(location.state?.from?.pathname ?? '/', { replace: true })
    } catch (error) {
      setMessage(error.message || 'Nao foi possivel autenticar.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-brand-paper px-5 py-10 text-ink">
      <Card className="w-full max-w-md">
        <div className="mb-8">
          <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-brand-red">Portal de Espacos</p>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-ink">
            {mode === 'register' ? 'Criar conta' : 'Entrar'}
          </h1>
          <p className="mt-2 text-sm leading-6 text-ink-muted">
            Use seu email institucional do Insper para acessar reservas e notificacoes.
          </p>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-2 rounded-2xl bg-warm-stone p-1">
          <ModeButton active={mode === 'login'} onClick={() => setMode('login')}>
            Entrar
          </ModeButton>
          <ModeButton active={mode === 'register'} onClick={() => setMode('register')}>
            Criar conta
          </ModeButton>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <label>
            <span className="mb-2 block text-sm font-bold text-ink">Email institucional</span>
            <input
              className="h-13 w-full rounded-2xl border border-stroke bg-panel px-4 text-sm outline-none transition focus:border-brand-red focus:ring-4 focus:ring-brand-red/10"
              placeholder="aluno@al.insper.edu.br"
              type="email"
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            />
          </label>

          <label>
            <span className="mb-2 block text-sm font-bold text-ink">Senha</span>
            <input
              className="h-13 w-full rounded-2xl border border-stroke bg-panel px-4 text-sm outline-none transition focus:border-brand-red focus:ring-4 focus:ring-brand-red/10"
              minLength={6}
              placeholder="Minimo de 6 caracteres"
              type="password"
              value={form.senha}
              onChange={(event) => setForm((current) => ({ ...current, senha: event.target.value }))}
            />
          </label>

          <div className="pt-1">
            <Button className="w-full" disabled={submitting || !form.email || form.senha.length < 6}>
              {submitting ? 'Acessando...' : mode === 'register' ? 'Criar conta' : 'Entrar'}
            </Button>
          </div>

          {message ? <p className="text-sm text-brand-red">{message}</p> : null}
        </form>
      </Card>
    </main>
  )
}

function ModeButton({ active, children, onClick }) {
  return (
    <button
      className={`h-10 rounded-xl text-sm font-bold transition ${
        active ? 'bg-white text-brand-red shadow-soft' : 'text-ink-muted hover:text-ink'
      }`}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  )
}
