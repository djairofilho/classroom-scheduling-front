export function Card({ className = '', children }) {
  return <section className={`rounded-2xl border border-stroke bg-white p-5 shadow-soft ${className}`}>{children}</section>
}

export function Button({ className = '', tone = 'primary', children, ...props }) {
  const tones = {
    primary: 'bg-brand-red text-white hover:bg-brand-red-dark',
    secondary: 'border border-stroke bg-white text-ink hover:bg-warm-stone',
    ghost: 'bg-transparent text-brand-red hover:bg-brand-red/5',
  }

  return (
    <button
      className={`inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition ${tones[tone]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export function Badge({ children, tone = 'neutral' }) {
  const tones = {
    neutral: 'bg-brand-blush text-ink-muted',
    success: 'bg-mint/20 text-mint-deep',
    warning: 'bg-amber-soft text-amber-deep',
    danger: 'bg-brand-red/10 text-brand-red',
    info: 'bg-sky-soft text-navy',
  }

  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] ${tones[tone]}`}>
      {children}
    </span>
  )
}
