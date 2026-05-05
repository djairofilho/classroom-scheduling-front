import { useEffect, useState } from 'react'

export function useAsyncData(loader) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  async function reload() {
    setLoading(true)
    setError(null)

    try {
      const result = await loader()
      setData(result)
      return result
    } catch (caughtError) {
      setError(caughtError)
      throw caughtError
    } finally {
      setLoading(false)
    }
  }

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

  return { data, loading, error, setData, reload }
}
