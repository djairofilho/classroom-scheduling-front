import { api, isNotFoundError } from './api'
import { appUser } from './adapters'

let currentSolicitantePromise

export async function getCurrentSolicitante() {
  if (!currentSolicitantePromise) {
    currentSolicitantePromise = resolveCurrentSolicitante()
  }

  return currentSolicitantePromise
}

async function resolveCurrentSolicitante() {
  try {
    return await api.findSolicitanteByEmail(appUser.email)
  } catch (error) {
    if (!isNotFoundError(error)) {
      throw error
    }
  }

  const solicitantes = await api.listSolicitantes()

  if (solicitantes.length > 0) {
    return solicitantes[0]
  }

  throw new Error('Nenhum solicitante disponivel para o portal.')
}
