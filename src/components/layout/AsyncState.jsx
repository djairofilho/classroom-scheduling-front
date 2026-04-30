import { Card } from './ui'

export function LoadingBlock({ label = 'Carregando dados...' }) {
  return (
    <Card>
      <div className="flex min-h-40 items-center justify-center text-sm font-semibold text-ink-muted">
        {label}
      </div>
    </Card>
  )
}

export function ErrorBlock({ message = 'Não foi possível carregar os dados.' }) {
  return (
    <Card className="border-brand-red/20 bg-brand-red/5">
      <div className="flex min-h-40 items-center justify-center text-sm font-semibold text-brand-red">
        {message}
      </div>
    </Card>
  )
}
