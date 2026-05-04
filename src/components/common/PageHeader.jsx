import { cn } from '@/lib/utils'

export function PageHeader({ title, description, icon: Icon, eyebrow, actions, className }) {
  return (
    <div
      className={cn(
        'mb-6 flex flex-col gap-3 md:mb-8 md:flex-row md:items-center md:justify-between',
        className,
      )}
    >
      <div className="flex items-start gap-3">
        {Icon && (
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
            <Icon className="h-5 w-5" />
          </div>
        )}
        <div className="min-w-0">
          {eyebrow && (
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">{eyebrow}</p>
          )}
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{title}</h1>
          {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
        </div>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}
