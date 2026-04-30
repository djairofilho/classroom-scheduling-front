import { formatDate, formatRelativeTime, formatTimeRange } from './format'

export const appUser = {
  name: 'Marina Silva',
  role: 'Professora',
  department: 'Arquitetura e Cidade',
}

export function mapPredio(predio) {
  return {
    id: predio.id,
    name: predio.nome,
    code: predio.codigo,
    location: predio.localizacao,
  }
}

export function mapEspaco(espaco) {
  const indisponivel = Boolean(espaco.indisponivel)
  return {
    id: espaco.id,
    name: espaco.nome,
    capacity: espaco.capacidade,
    building: espaco.predio?.nome ?? 'Sem predio',
    buildingId: espaco.predio?.id ?? null,
    buildingCode: espaco.predio?.codigo ?? '',
    buildingLocation: espaco.predio?.localizacao ?? '',
    type: espaco.tipo ?? inferSpaceType(espaco.nome),
    status: indisponivel ? 'Indisponivel' : 'Disponivel',
    statusTone: indisponivel ? 'danger' : 'success',
    maintenanceReason: espaco.motivoIndisponibilidade ?? '',
    description: buildSpaceDescription(espaco),
    features: buildSpaceFeatures(espaco),
    floor: espaco.predio?.localizacao ?? 'Campus principal',
    weeklySchedule: [
      ['Livre', 'Reserva', 'Livre', 'Reserva', 'Livre', 'Livre'],
      ['Livre', 'Livre', indisponivel ? 'Manutencao' : 'Livre', 'Livre', 'Evento', 'Livre'],
    ],
  }
}

export function mapReserva(reserva) {
  const cancelada = Boolean(reserva.cancelada)
  return {
    id: reserva.id,
    code: `#RES-${String(reserva.id).padStart(3, '0')}`,
    solicitanteId: reserva.solicitante?.id ?? null,
    solicitanteNome: reserva.solicitante?.nome ?? 'Solicitante',
    solicitanteEmail: reserva.solicitante?.email ?? '',
    espacoId: reserva.espaco?.id ?? null,
    space: reserva.espaco?.nome ?? 'Espaco',
    building: reserva.espaco?.predio?.nome ?? 'Sem predio',
    date: formatDate(reserva.horarios?.inicio),
    time: formatTimeRange(reserva.horarios?.inicio, reserva.horarios?.fim),
    reason: reserva.motivo ?? 'Sem motivo informado',
    status: cancelada ? 'Cancelada' : 'Ativa',
    cancelada,
    createdAt: reserva.criadaEm,
    start: reserva.horarios?.inicio,
    end: reserva.horarios?.fim,
  }
}

export function mapNotificacao(notificacao) {
  const body = notificacao.mensagem ?? 'Notificacao sem mensagem.'
  return {
    id: notificacao.id,
    title: inferNotificationTitle(body),
    body,
    time: formatRelativeTime(notificacao.enviadaEm),
    tone: inferNotificationTone(body),
    lida: Boolean(notificacao.lida),
    enviadaEm: notificacao.enviadaEm,
    destinatarioId: notificacao.destinatario?.id ?? null,
    reservaId: notificacao.reserva?.id ?? null,
  }
}

export function mapUsuario(usuario) {
  return {
    id: usuario.id,
    name: usuario.nome,
    email: usuario.email,
  }
}

export function createDashboardMetrics({ reservasAtivas, espacos, notificacoes, predios }) {
  const disponiveis = espacos.filter((item) => item.status === 'Disponivel').length

  return [
    { label: 'Reservas ativas', value: String(reservasAtivas.length), icon: 'calendar', tone: 'primary' },
    { label: 'Espacos disponiveis', value: String(disponiveis), icon: 'building', tone: 'secondary' },
    { label: 'Notificacoes', value: String(notificacoes.filter((item) => !item.lida).length), icon: 'bell', tone: 'tertiary' },
    { label: 'Predios ativos', value: String(predios.length), icon: 'layers', tone: 'neutral' },
  ]
}

function inferSpaceType(name = '') {
  const lower = name.toLowerCase()
  if (lower.includes('laboratorio') || lower.includes('lab')) return 'Laboratorio'
  if (lower.includes('auditorio')) return 'Auditorio'
  if (lower.includes('reun')) return 'Reuniao'
  return 'Aula'
}

function buildSpaceDescription(espaco) {
  const predio = espaco.predio?.nome ? `em ${espaco.predio.nome}` : 'no campus'
  return `Espaco academico ${predio} com capacidade para ${espaco.capacidade ?? 0} pessoas.`
}

function buildSpaceFeatures(espaco) {
  const features = [`Capacidade ${espaco.capacidade ?? 0}`]
  if (espaco.predio?.codigo) features.push(`Codigo ${espaco.predio.codigo}`)
  if (espaco.predio?.localizacao) features.push(espaco.predio.localizacao)
  if (espaco.motivoIndisponibilidade) features.push('Indisponibilidade ativa')
  return features
}

function inferNotificationTone(message = '') {
  const lower = message.toLowerCase()
  if (lower.includes('cancel')) return 'warning'
  if (lower.includes('confirm')) return 'primary'
  return 'secondary'
}

function inferNotificationTitle(message = '') {
  const lower = message.toLowerCase()
  if (lower.includes('confirm')) return 'Confirmacao'
  if (lower.includes('cancel')) return 'Cancelamento'
  if (lower.includes('manuten')) return 'Manutencao'
  return 'Atualizacao'
}
