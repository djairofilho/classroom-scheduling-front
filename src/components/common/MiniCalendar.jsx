import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { cn } from '@/lib/utils'

const WEEKDAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']
const MONTHS = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
]

function toIsoDate(date) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
  return local.toISOString().slice(0, 10)
}

export function MiniCalendar({ highlightedDates = [], selected, onSelect }) {
  const [cursor, setCursor] = useState(() => {
    const d = new Date()
    return new Date(d.getFullYear(), d.getMonth(), 1)
  })

  const today = toIsoDate(new Date())
  const highlightSet = useMemo(() => new Set(highlightedDates), [highlightedDates])

  const cells = useMemo(() => {
    const firstDay = new Date(cursor.getFullYear(), cursor.getMonth(), 1)
    const startOffset = firstDay.getDay()
    const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate()
    const arr = []
    for (let i = 0; i < startOffset; i++) arr.push(null)
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(cursor.getFullYear(), cursor.getMonth(), d)
      arr.push({ iso: toIsoDate(date), day: d })
    }
    return arr
  }, [cursor])

  const shift = (delta) => setCursor((c) => new Date(c.getFullYear(), c.getMonth() + delta, 1))

  return (
    <div className="w-full">
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => shift(-1)}
          className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
          aria-label="Mês anterior"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-sm font-semibold">
          {MONTHS[cursor.getMonth()]} {cursor.getFullYear()}
        </span>
        <button
          type="button"
          onClick={() => shift(1)}
          className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
          aria-label="Próximo mês"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="mb-1 grid grid-cols-7 gap-1 text-center text-[11px] font-medium text-muted-foreground">
        {WEEKDAYS.map((w, i) => (
          <span key={i}>{w}</span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell, i) => {
          if (!cell) return <div key={i} className="aspect-square" />
          const isToday = cell.iso === today
          const isSelected = selected === cell.iso
          const isHighlighted = highlightSet.has(cell.iso)
          return (
            <button
              key={cell.iso}
              type="button"
              onClick={() => onSelect?.(cell.iso)}
              className={cn(
                'relative flex aspect-square items-center justify-center rounded-full text-sm transition',
                'hover:bg-primary-soft hover:text-primary',
                isHighlighted && !isSelected && 'bg-primary-soft font-semibold text-primary',
                isToday && !isSelected && 'ring-1 ring-primary/40',
                isSelected && 'bg-primary font-semibold text-primary-foreground shadow',
              )}
            >
              {cell.day}
            </button>
          )
        })}
      </div>
    </div>
  )
}
