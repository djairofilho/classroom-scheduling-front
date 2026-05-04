import { Clock, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Skeleton } from '@/components/ui/skeleton'
import { StatusBadge } from '@/components/common/StatusBadge'
import { EmptyState } from '@/components/common/EmptyState'
import { useI18n } from '@/i18n/I18nProvider'

export function MeetingsList({ reservas, loading, emptyMessage }) {
  const { t } = useI18n()

  if (loading) {
    return (
      <div className="space-y-3">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-20 w-full rounded-lg" />
        ))}
      </div>
    )
  }

  if (!reservas || reservas.length === 0) {
    return (
      <EmptyState
        title={t('dashboard.noActiveReservations') ?? 'Nada por aqui'}
        description={emptyMessage}
      />
    )
  }

  return (
    <ul className="space-y-3">
      {reservas.map((r) => (
        <li
          key={r.id}
          className="group flex items-start justify-between gap-3 rounded-xl border bg-card p-3 transition hover:border-primary/30"
        >
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="truncate text-sm font-semibold">{r.reason ?? r.space}</p>
              <StatusBadge statusKey={r.statusKey} tone={r.cancelada ? 'destructive' : 'success'} />
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {r.time}
              </span>
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {r.space}
              </span>
            </div>
          </div>
          <Link
            to="/reservas"
            className="shrink-0 text-xs font-medium text-primary opacity-0 transition group-hover:opacity-100"
          >
            Ver →
          </Link>
        </li>
      ))}
    </ul>
  )
}
