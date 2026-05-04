import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

import { cn } from '@/lib/utils'

export function QuickActionCard({ title, description, icon: Icon, to, variant = 'primary' }) {
  return (
    <Link
      to={to}
      style={variant === 'primary' ? { background: 'var(--gradient-primary)' } : undefined}
      className={cn(
        'group relative flex items-center gap-4 overflow-hidden rounded-2xl border p-5 shadow-[var(--shadow-card)] transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-elegant)] md:p-6',
        variant === 'primary' ? 'border-transparent text-primary-foreground' : 'bg-card text-foreground',
      )}
    >
      <div
        className={cn(
          'flex h-14 w-14 shrink-0 items-center justify-center rounded-xl',
          variant === 'primary' ? 'bg-white/15 text-primary-foreground' : 'bg-primary-soft text-primary',
        )}
      >
        <Icon className="h-7 w-7" />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className={cn('mt-0.5 text-sm', variant === 'primary' ? 'text-white/85' : 'text-muted-foreground')}>
          {description}
        </p>
      </div>
      <ArrowRight className="h-5 w-5 shrink-0 transition group-hover:translate-x-1" />
    </Link>
  )
}
