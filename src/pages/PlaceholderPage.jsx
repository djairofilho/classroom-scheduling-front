import { Card } from '../components/layout/ui'
import { PageIntro } from '../components/layout/PageIntro'

export function PlaceholderPage({ title, description }) {
  return (
    <>
      <PageIntro title={title} description={description} />
      <Card className="min-h-[360px]">
        <div className="flex h-full min-h-[300px] items-center justify-center rounded-2xl border border-dashed border-stroke bg-warm-stone text-center text-ink-muted">
          Conteudo desta tela entra no proximo conjunto de commits.
        </div>
      </Card>
    </>
  )
}
