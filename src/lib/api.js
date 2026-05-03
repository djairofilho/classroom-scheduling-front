const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'
const AUTH_TOKEN_KEY = 'portal-auth-token'

export function getAuthToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY)
}

export function setAuthToken(token) {
  if (token) {
    localStorage.setItem(AUTH_TOKEN_KEY, token)
    return
  }

  localStorage.removeItem(AUTH_TOKEN_KEY)
}

async function apiRequest(path, options = {}) {
  const token = getAuthToken()
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
    ...options,
  })

  if (!response.ok) {
    const text = await response.text()
    const error = new Error(text || `Erro ${response.status}`)
    error.status = response.status
    throw error
  }

  if (response.status === 204) {
    return null
  }

  return response.json()
}

function queryString(params) {
  const search = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      search.set(key, String(value))
    }
  })

  const text = search.toString()
  return text ? `?${text}` : ''
}

export const api = {
  getHealth: () => apiRequest('/health'),

  login: (payload) => apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  register: (payload) => apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  getMe: () => apiRequest('/auth/me'),

  listEspacos: () => apiRequest('/espacos'),
  listEspacosDisponiveis: () => apiRequest('/espacos/disponiveis'),
  listEspacosPorPredio: (predioId) => apiRequest(`/espacos/por-predio${queryString({ predioId })}`),
  getEspaco: (id) => apiRequest(`/espacos/${id}`),
  createEspaco: (payload) => apiRequest('/espacos', { method: 'POST', body: JSON.stringify(payload) }),
  updateEspacoIndisponibilidade: (id, payload) =>
    apiRequest(`/espacos/${id}/indisponibilidade`, { method: 'PATCH', body: JSON.stringify(payload) }),

  listPredios: () => apiRequest('/predios'),
  getPredio: (id) => apiRequest(`/predios/${id}`),
  createPredio: (payload) => apiRequest('/predios', { method: 'POST', body: JSON.stringify(payload) }),
  findPredioByCodigo: (codigo) => apiRequest(`/predios/buscar${queryString({ codigo })}`),

  listReservas: () => apiRequest('/reservas'),
  listReservasAtivas: () => apiRequest('/reservas/ativas'),
  listReservasPorSolicitante: (solicitanteId) =>
    apiRequest(`/reservas/por-solicitante${queryString({ solicitanteId })}`),
  getReserva: (id) => apiRequest(`/reservas/${id}`),
  createReserva: (payload) => apiRequest('/reservas', { method: 'POST', body: JSON.stringify(payload) }),
  cancelarReserva: (id) => apiRequest(`/reservas/${id}/cancelar`, { method: 'PATCH' }),

  listNotificacoes: () => apiRequest('/notificacoes'),
  listNotificacoesPorDestinatario: (destinatarioId) =>
    apiRequest(`/notificacoes/por-destinatario${queryString({ destinatarioId })}`),
  listNotificacoesNaoLidas: (destinatarioId) =>
    apiRequest(`/notificacoes/nao-lidas${queryString({ destinatarioId })}`),
  marcarNotificacaoComoLida: (id) => apiRequest(`/notificacoes/${id}/lida`, { method: 'PATCH' }),

  listUsuarios: () => apiRequest('/usuarios'),
  getUsuario: (id) => apiRequest(`/usuarios/${id}`),
  findUsuarioByEmail: (email) => apiRequest(`/usuarios/buscar${queryString({ email })}`),
  removeUsuario: (id) => apiRequest(`/usuarios/${id}`, { method: 'DELETE' }),

  listSolicitantes: () => apiRequest('/solicitantes'),
  getSolicitante: (id) => apiRequest(`/solicitantes/${id}`),
  findSolicitanteByEmail: (email) => apiRequest(`/solicitantes/buscar${queryString({ email })}`),
  createSolicitante: (payload) => apiRequest('/solicitantes', { method: 'POST', body: JSON.stringify(payload) }),
}

export function isNotFoundError(error) {
  return error?.status === 404
}
