import { api } from './api'

export async function getCurrentSolicitante() {
  return api.getMe()
}
