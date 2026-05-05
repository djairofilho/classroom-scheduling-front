import { formatDate, formatRelativeTime, formatTimeRange } from './format'

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
    building: espaco.predio?.nome ?? 'Sem prédio',
    buildingId: espaco.predio?.id ?? null,
    buildingCode: espaco.predio?.codigo ?? '',
    buildingLocation: espaco.predio?.localizacao ?? '',
    typeKey: inferSpaceType(espaco.tipo ?? espaco.nome),
    statusKey: indisponivel ? 'common.statuses.unavailable' : 'common.statuses.available',
    statusTone: indisponivel ? 'danger' : 'success',
    maintenanceReason: espaco.motivoIndisponibilidade ?? '',
    floor: espaco.predio?.localizacao ?? 'Campus principal',
  }
}

export function mapReserva(reserva) {
  const cancelada = Boolean(reserva.cancelada)
  const rawStatus = typeof reserva.status === 'string' ? reserva.status.toUpperCase() : null
  const status = rawStatus ?? (cancelada ? 'RECUSADA' : 'APROVADA')
  const statusKey =
    status === 'PENDENTE'
      ? 'common.statuses.waiting'
      : status === 'RECUSADA'
        ? 'common.statuses.cancelled'
        : cancelada
          ? 'common.statuses.cancelled'
          : 'common.statuses.active'

  return {
    id: reserva.id,
    code: `#RES-${String(reserva.id).padStart(3, '0')}`,
    solicitanteId: reserva.solicitante?.id ?? null,
    solicitanteNome: reserva.solicitante?.nome ?? 'Solicitante',
    solicitanteEmail: reserva.solicitante?.email ?? '',
    espacoId: reserva.espaco?.id ?? null,
    space: reserva.espaco?.nome ?? 'Espaço',
    building: reserva.espaco?.predio?.nome ?? 'Sem prédio',
    date: formatDate(reserva.horarios?.inicio),
    time: formatTimeRange(reserva.horarios?.inicio, reserva.horarios?.fim),
    reason: reserva.motivo ?? 'Sem motivo informado',
    status,
    statusKey,
    cancelada,
    createdAt: reserva.criadaEm,
    start: reserva.horarios?.inicio,
    end: reserva.horarios?.fim,
  }
}

export function mapNotificacao(notificacao) {
  const body = notificacao.mensagem ?? 'Notificação sem mensagem.'

  return {
    id: notificacao.id,
    titleKey: inferNotificationTitle(body),
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
  const disponiveis = espacos.filter((item) => item.statusKey === 'common.statuses.available').length

  return [
    { labelKey: 'dashboard.metrics.activeReservations', value: String(reservasAtivas.length), icon: 'calendar', tone: 'primary' },
    { labelKey: 'dashboard.metrics.availableSpaces', value: String(disponiveis), icon: 'building', tone: 'secondary' },
    { labelKey: 'dashboard.metrics.notifications', value: String(notificacoes.filter((item) => !item.lida).length), icon: 'bell', tone: 'tertiary' },
    { labelKey: 'dashboard.metrics.activeBuildings', value: String(predios.length), icon: 'layers', tone: 'neutral' },
  ]
}

function inferSpaceType(name = '') {
  const lower = name.toLowerCase()
  if (lower.includes('laboratorio') || lower.includes('laboratório') || lower.includes('lab')) return 'common.spaceTypes.lab'
  if (lower.includes('auditorio') || lower.includes('auditório')) return 'common.spaceTypes.auditorium'
  if (lower.includes('reun')) return 'common.spaceTypes.meeting'
  return 'common.spaceTypes.classroom'
}

function inferNotificationTone(message = '') {
  const lower = message.toLowerCase()
  if (lower.includes('cancel')) return 'warning'
  if (lower.includes('confirm')) return 'primary'
  return 'secondary'
}

function inferNotificationTitle(message = '') {
  const lower = message.toLowerCase()
  if (lower.includes('confirm')) return 'common.notifications.confirmation'
  if (lower.includes('cancel')) return 'common.notifications.cancellation'
  if (lower.includes('manuten')) return 'common.notifications.maintenance'
  return 'common.notifications.update'
}
