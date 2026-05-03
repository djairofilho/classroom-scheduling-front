import { useEffect, useMemo, useState } from 'react'
import { api, getAuthToken, setAuthToken } from './api'
import { AuthContext } from './authContext'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(() => Boolean(getAuthToken()))

  useEffect(() => {
    let active = true

    async function loadSession() {
      if (!getAuthToken()) {
        setLoading(false)
        return
      }

      try {
        const usuario = await api.getMe()
        if (active) {
          setUser(usuario)
        }
      } catch {
        setAuthToken(null)
        if (active) {
          setUser(null)
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    loadSession()

    return () => {
      active = false
    }
  }, [])

  const value = useMemo(
    () => ({
      user,
      loading,
      isAdmin: user?.papel === 'ADMIN',
      async login(payload) {
        const response = await api.login(payload)
        setAuthToken(response.token)
        setUser(response.usuario)
        return response.usuario
      },
      async register(payload) {
        const response = await api.register(payload)
        setAuthToken(response.token)
        setUser(response.usuario)
        return response.usuario
      },
      logout() {
        setAuthToken(null)
        setUser(null)
      },
    }),
    [loading, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
