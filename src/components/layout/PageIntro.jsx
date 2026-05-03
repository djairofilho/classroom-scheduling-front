export function PageIntro({ eyebrow, title, description, actions }) {
  return (
    <section className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-3xl">
        {eyebrow ? <p className="mb-1.5 text-sm text-ink-muted">{eyebrow}</p> : null}
        <h1 className="text-balance text-3xl font-extrabold tracking-tight text-ink md:text-4xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-muted md:text-base">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
    </section>
  )
}
