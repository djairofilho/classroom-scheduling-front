import { AlertTriangle } from 'lucide-react'

import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function LoadingBlock({ label = 'Carregando dados...' }) {
  return (
    <Card className="p-6">
      <div className="space-y-3">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-4 w-72" />
        <Skeleton className="h-32 w-full" />
        <span className="sr-only">{label}</span>
      </div>
    </Card>
  )
}

export function ErrorBlock({ message = 'Não foi possível carregar os dados.' }) {
  return (
    <Card className="border-destructive/30 bg-destructive/5">
      <div className="flex min-h-32 items-center justify-center gap-3 px-6 py-10 text-sm font-semibold text-destructive">
        <AlertTriangle className="h-5 w-5" />
        <span>{message}</span>
      </div>
    </Card>
  )
}
