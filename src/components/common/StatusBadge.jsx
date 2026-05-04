import { useI18n } from '@/i18n/I18nProvider'
import { cn } from '@/lib/utils'

const toneClasses = {
  success: 'bg-success/10 text-success border-success/20',
  warning: 'bg-warning/10 text-warning border-warning/20',
  destructive: 'bg-destructive/10 text-destructive border-destructive/20',
  danger: 'bg-destructive/10 text-destructive border-destructive/20',
  muted: 'bg-muted text-muted-foreground border-border',
  neutral: 'bg-muted text-muted-foreground border-border',
  info: 'bg-primary-soft text-primary border-primary/20',
  primary: 'bg-primary-soft text-primary border-primary/20',
  default: 'bg-primary-soft text-primary border-primary/20',
}

const STATUS_KEY_TONE = {
  'common.statuses.available': 'success',
  'common.statuses.unavailable': 'destructive',
  'common.statuses.active': 'success',
  'common.statuses.cancelled': 'destructive',
  'common.statuses.confirmed': 'success',
  'common.statuses.noSchedule': 'muted',
  'common.statuses.operating': 'success',
  'common.statuses.partial': 'warning',
  'common.statuses.attention': 'warning',
  'common.statuses.healthy': 'success',
  'common.statuses.requester': 'info',
  'common.statuses.user': 'muted',
}

export function StatusBadge({ statusKey, tone, label, className }) {
  const { t } = useI18n()
  const resolvedTone = tone ?? (statusKey ? STATUS_KEY_TONE[statusKey] : null) ?? 'default'
  const text = label ?? (statusKey ? t(statusKey) : '')

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium',
        toneClasses[resolvedTone] ?? toneClasses.default,
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {text}
    </span>
  )
}
