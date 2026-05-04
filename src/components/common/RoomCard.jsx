import { Users, MapPin, Building2 } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { StatusBadge } from '@/components/common/StatusBadge'
import { useI18n } from '@/i18n/I18nProvider'

export function RoomCard({ space, onReserve }) {
  const { t } = useI18n()
  const isAvailable = space.statusKey === 'common.statuses.available'

  return (
    <Card className="group flex flex-col overflow-hidden transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-elegant)]">
      <div
        className="relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden"
        style={{ background: 'var(--gradient-soft)' }}
      >
        <Building2 className="h-16 w-16 text-primary/30 transition duration-300 group-hover:scale-110" />
        <div className="absolute right-3 top-3">
          <StatusBadge statusKey={space.statusKey} />
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-base font-semibold tracking-tight">{space.name}</h3>
          <span className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-primary">
            <Users className="h-4 w-4" />
            {space.capacity}
          </span>
        </div>
        <p className="mt-1 inline-flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" />
          {space.building} · {space.buildingLocation || '—'}
        </p>

        <div className="mt-3 flex flex-wrap gap-1.5">
          <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
            {t(space.typeKey)}
          </span>
          {space.buildingCode && (
            <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
              {space.buildingCode}
            </span>
          )}
        </div>

        {!isAvailable && space.maintenanceReason && (
          <p className="mt-3 rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
            {space.maintenanceReason}
          </p>
        )}

        <div className="mt-4 flex gap-2">
          <Button asChild variant="outline" className="flex-1">
            <Link to={`/espacos/${space.id}`}>{t('common.details')}</Link>
          </Button>
          <Button
            className="flex-1"
            disabled={!isAvailable}
            onClick={() => onReserve?.(space)}
          >
            {t('common.reserve')}
          </Button>
        </div>
      </div>
    </Card>
  )
}
