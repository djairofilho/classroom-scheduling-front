import { NavLink } from 'react-router-dom'
import { useCallback } from 'react'
import { ErrorBlock, LoadingBlock } from '../../components/layout/AsyncState'
import { PageIntro } from '../../components/layout/PageIntro'
import { Button, Card } from '../../components/layout/ui'
import { useAsyncData } from '../../hooks/useAsyncData'
import { api } from '../../lib/api'

export function ApiStatusPage() {
  const loadApiStatus = useCallback(async () => {
    const healthStart = performance.now()
    const health = await api.getHealth()
    const healthLatency = Math.round(performance.now() - healthStart)

    const checks = await Promise.all([
      timedCheck('Espacos API', () => api.listEspacos()),
      timedCheck('Reservas API', () => api.listReservasAtivas()),
      timedCheck('Notificacoes API', () => api.listNotificacoes()),
    ])

    return {
      health,
      healthLatency,
      checks,
    }
  }, [])

  const { data, loading, error } = useAsyncData(loadApiStatus)

  return (
    <>
      <PageIntro
        title="Configuracoes e status da API"
        description="Gerencie as preferencias do sistema e monitore a integridade dos servicos de integracao."
      />
      <AdminTabs />

      {loading ? <LoadingBlock label="Executando health checks..." /> : null}
      {error ? <ErrorBlock message="Nao foi possivel validar a API." /> : null}

      {!loading && !error && data ? (
        <div className="grid gap-6 xl:grid-cols-12">
          <div className="space-y-6 xl:col-span-5">
            <Card>
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-ink">API health</h2>
                <span className="rounded-full bg-mint/20 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-mint-deep">
                  {data.health.status ?? 'ok'}
                </span>
              </div>
              <div className="mt-6 space-y-4 text-sm">
                {data.checks.map((service) => (
                  <div key={service.name} className="flex items-center justify-between border-b border-stroke pb-4 last:border-b-0 last:pb-0">
                    <div>
                      <p className="font-semibold text-ink">{service.name}</p>
                      <p className="mt-1 text-ink-muted">{service.status}</p>
                    </div>
                    <p className="font-semibold text-ink">{service.latency} ms</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 rounded-2xl bg-panel px-4 py-3 text-sm text-ink-muted">Health endpoint respondeu em {data.healthLatency} ms.</div>
            </Card>
          </div>

          <div className="space-y-6 xl:col-span-7">
            <Card>
              <h2 className="text-2xl font-bold text-ink">Configuracoes do sistema</h2>
              <div className="mt-6 space-y-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-ink">Notificacoes push</p>
                    <p className="mt-1 text-sm leading-6 text-ink-muted">
                      Receba alertas em tempo real sobre mudancas de status da API e novas reservas criticas.
                    </p>
                  </div>
                  <div className="flex h-7 w-12 items-center rounded-full bg-brand-red px-1">
                    <div className="h-5 w-5 translate-x-5 rounded-full bg-white" />
                  </div>
                </div>

                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-ink">Idioma da interface</span>
                  <select className="h-12 w-full rounded-2xl border border-stroke bg-panel px-4 text-sm outline-none transition focus:border-brand-red focus:ring-4 focus:ring-brand-red/10">
                    <option>Portugues (Brasil)</option>
                    <option>English (US)</option>
                    <option>Espanol</option>
                  </select>
                </label>

                <div>
                  <p className="mb-3 text-sm font-bold text-ink">Tema preferido</p>
                  <div className="grid gap-3 md:grid-cols-3">
                    {['Claro', 'Escuro', 'Sistema'].map((theme, index) => (
                      <button
                        key={theme}
                        className={`rounded-2xl border px-4 py-5 text-sm font-semibold transition ${
                          index === 0
                            ? 'border-brand-red bg-brand-blush text-brand-red'
                            : 'border-stroke bg-white text-ink-muted hover:text-ink'
                        }`}
                        type="button"
                      >
                        {theme}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-3 border-t border-stroke pt-6">
                <Button tone="secondary">Descartar</Button>
                <Button>Salvar alteracoes</Button>
              </div>
            </Card>

            <footer className="flex flex-col gap-3 rounded-3xl border border-stroke bg-white px-6 py-5 text-sm text-ink-muted md:flex-row md:items-center md:justify-between">
              <span className="font-semibold text-ink">Portal de Espacos Academicos</span>
              <span>Versao 2.4.1</span>
            </footer>
          </div>
        </div>
      ) : null}
    </>
  )
}

async function timedCheck(name, request) {
  const start = performance.now()
  await request()
  const latency = Math.round(performance.now() - start)

  return {
    name,
    latency,
    status: latency < 150 ? 'Saudavel' : 'Atencao',
  }
}

function AdminTabs() {
  const links = [
    { to: '/admin/espacos', label: 'Espacos' },
    { to: '/admin/predios', label: 'Predios' },
    { to: '/admin/usuarios', label: 'Usuarios' },
    { to: '/configuracoes/api', label: 'API' },
  ]

  return (
    <div className="mb-8 flex flex-wrap gap-3">
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          className={({ isActive }) =>
            `rounded-full px-4 py-2 text-sm font-semibold transition ${
              isActive ? 'bg-brand-red text-white' : 'border border-stroke bg-white text-ink-muted hover:text-ink'
            }`
          }
        >
          {link.label}
        </NavLink>
      ))}
    </div>
  )
}
