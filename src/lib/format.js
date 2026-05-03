const dateTimeFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})

const timeFormatter = new Intl.DateTimeFormat('pt-BR', {
  hour: '2-digit',
  minute: '2-digit',
})

const relativeFormatter = new Intl.RelativeTimeFormat('pt-BR', { numeric: 'auto' })

export function formatDateTime(value) {
  if (!value) return '--'
  return dateTimeFormatter.format(new Date(value))
}

export function formatDate(value) {
  if (!value) return '--'
  return dateFormatter.format(new Date(value))
}

export function formatTime(value) {
  if (!value) return '--'
  return timeFormatter.format(new Date(value))
}

export function formatTimeRange(start, end) {
  if (!start || !end) return '--'
  return `${formatTime(start)} - ${formatTime(end)}`
}

export function formatRelativeTime(value) {
  if (!value) return '--'

  const timestamp = new Date(value).getTime()
  const diffMs = timestamp - Date.now()
  const diffMinutes = Math.round(diffMs / 60000)

  if (Math.abs(diffMinutes) < 60) {
    return relativeFormatter.format(diffMinutes, 'minute')
  }

  const diffHours = Math.round(diffMinutes / 60)
  if (Math.abs(diffHours) < 24) {
    return relativeFormatter.format(diffHours, 'hour')
  }

  const diffDays = Math.round(diffHours / 24)
  return relativeFormatter.format(diffDays, 'day')
}

export function toDateInputValue(value) {
  if (!value) return ''
  const date = new Date(value)
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
  return local.toISOString().slice(0, 10)
}

export function toTimeInputValue(value) {
  if (!value) return ''
  const date = new Date(value)
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

export function combineDateAndTime(date, time) {
  if (!date || !time) return null
  return `${date}T${time}:00`
}
