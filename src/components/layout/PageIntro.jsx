export function PageIntro({ eyebrow, title, description, actions }) {
  return (
    <section className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-3xl">
        {eyebrow ? <p className="mb-2 text-sm text-ink-muted">{eyebrow}</p> : null}
        <h1 className="text-balance text-4xl font-extrabold tracking-tight text-ink md:text-5xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-3 max-w-2xl text-base leading-7 text-ink-muted md:text-lg">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
    </section>
  )
}
