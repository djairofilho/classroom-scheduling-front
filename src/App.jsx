function App() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16 text-slate-50">
      <div className="mx-auto flex max-w-5xl flex-col gap-10">
        <div className="inline-flex w-fit rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-1 text-sm font-medium text-emerald-200">
          Vite + React + Tailwind
        </div>

        <section className="grid gap-8 rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-slate-950/40 backdrop-blur md:grid-cols-[1.4fr_0.8fr] md:p-12">
          <div className="space-y-5">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
              Agendamento Front
            </p>
            <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-white md:text-6xl">
              Projeto iniciado e pronto para evoluir.
            </h1>
            <p className="max-w-xl text-base leading-7 text-slate-300 md:text-lg">
              Edite <code className="rounded bg-white/10 px-2 py-1 text-sm">src/App.jsx</code> e use as classes do Tailwind para montar a interface.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-1">
            <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-5">
              <p className="text-sm text-slate-400">Dev server</p>
              <p className="mt-2 font-mono text-lg text-emerald-300">npm run dev</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-5">
              <p className="text-sm text-slate-400">Build</p>
              <p className="mt-2 font-mono text-lg text-cyan-300">npm run build</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

export default App
