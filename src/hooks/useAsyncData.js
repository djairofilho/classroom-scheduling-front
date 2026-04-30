import { useEffect, useState } from 'react'

export function useAsyncData(loader) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let active = true

    async function run() {
      setLoading(true)
      setError(null)

      try {
        const result = await loader()
        if (active) {
          setData(result)
        }
      } catch (caughtError) {
        if (active) {
          setError(caughtError)
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    run()

    return () => {
      active = false
    }
  }, [loader])

  return { data, loading, error, setData }
}
