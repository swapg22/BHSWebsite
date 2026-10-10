/** Opening and aarti times with seasonal overrides (FR-02). Edited once in the CMS, shown on every page. */

export interface TimesSet {
  weekdays: string
  weekends: string
  aarti: string
  note?: string | null
}

export interface SeasonalOverride extends Partial<TimesSet> {
  label: string
  startDate: string // ISO
  endDate: string // ISO
}

export interface OpeningTimesInput {
  standard: TimesSet
  overrides?: SeasonalOverride[] | null
}

export interface ResolvedTimes extends TimesSet {
  overrideLabel: string | null
}

function ukDateKey(d: Date): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/London' }).format(d)
}

export function resolveTimes({ standard, overrides }: OpeningTimesInput, now = new Date()): ResolvedTimes {
  const today = ukDateKey(now)
  const active = (overrides ?? []).find((o) => {
    const start = o.startDate.slice(0, 10)
    const end = o.endDate.slice(0, 10)
    return start <= today && today <= end
  })
  if (!active) return { ...standard, overrideLabel: null }
  return {
    weekdays: active.weekdays || standard.weekdays,
    weekends: active.weekends || standard.weekends,
    aarti: active.aarti || standard.aarti,
    note: active.note ?? standard.note,
    overrideLabel: active.label,
  }
}

export const DEFAULT_TIMES: TimesSet = {
  weekdays: '9am–12pm & 6–8pm',
  weekends: '9am–1pm & 5–8pm',
  aarti: '9.45am & 6.45pm',
  note: null,
}
