'use client'

import Link from 'next/link'
import { useActionState, useEffect, useMemo, useState } from 'react'
import { bookService } from '@/app/(frontend)/actions/booking'
import { Checkbox, FormGuardFields, FormMessage, Select, SubmitButton, TextArea, TextField } from '@/components/forms'
import type { FormState } from '@/lib/formGuard'
import { formatGBP } from '@/lib/money'

interface ServiceInfo {
  id: number
  name: string
  category: string
  location: string
  availableDays: string[]
  earliestTime: string
  latestTime: string
  defaultDuration: number
  memberPrice: number
  nonMemberPrice: number
  materialsPrice: number
  priceOnRequest: boolean
  perHour: boolean
  requiresPolicy: boolean
  requiresApproval: boolean
  capacity: number | null
}

const toMin = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5))
const toTime = (m: number) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
const DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

export function ServiceBookingForm({ token, service, isMember, minDate, maxDate, defaults }: { token: string; service: ServiceInfo; isMember: boolean; minDate: string; maxDate: string; defaults?: { name: string; email: string; phone: string } }) {
  const [state, action] = useActionState<FormState, FormData>(bookService, {})
  const v = state.values ?? {}
  const isClass = service.category === 'class' || service.category === 'meal'
  const [date, setDate] = useState(v.date ?? '')
  const [start, setStart] = useState(v.startTime ?? (isClass ? service.earliestTime : ''))
  const [duration, setDuration] = useState(Number(v.durationMinutes ?? service.defaultDuration))
  const [venue, setVenue] = useState(v.venue ?? (service.location === 'either' ? 'mandir' : service.location))
  const [materials, setMaterials] = useState(false)
  // Busy times are stored with the date/venue they were fetched for; loading is derived from that
  const [fetched, setFetched] = useState<{ key: string; busy: { start: string; end: string }[] } | null>(null)

  const dayOk = !date || service.availableDays.length === 0 || service.availableDays.includes(DAYS[new Date(`${date}T12:00:00Z`).getUTCDay()])

  const needsAvailability = Boolean(date) && dayOk && venue !== 'home' && !isClass
  const fetchKey = `${date}|${venue}`
  const busy = fetched?.key === fetchKey ? fetched.busy : null
  const loadingBusy = needsAvailability && fetched?.key !== fetchKey
  useEffect(() => {
    if (!needsAvailability) return
    const ctrl = new AbortController()
    fetch(`/availability?service=${service.id}&date=${date}&venue=${venue}`, { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : { busy: [] }))
      .then((d) => setFetched({ key: `${date}|${venue}`, busy: d.busy ?? [] }))
      .catch(() => {})
    return () => ctrl.abort()
  }, [date, venue, needsAvailability, service.id])

  const slots = useMemo(() => {
    const out: { time: string; free: boolean }[] = []
    const earliest = toMin(service.earliestTime)
    const latest = toMin(service.latestTime)
    for (let t = earliest; t + duration <= latest; t += 30) {
      const s = toMin(toTime(t))
      const e = s + duration
      const free = !((needsAvailability ? busy : null) ?? []).some((b) => s < toMin(b.end) && toMin(b.start) < e)
      out.push({ time: toTime(t), free })
    }
    return out
  }, [busy, needsAvailability, duration, service.earliestTime, service.latestTime])

  const unit = isMember ? service.memberPrice : service.nonMemberPrice
  const estimate = service.priceOnRequest ? null : unit * (service.perHour ? Math.ceil(duration / 60) : 1) + (materials ? service.materialsPrice : 0)

  return (
    <form action={action} className="relative space-y-6" noValidate>
      <FormGuardFields token={token} />
      <input type="hidden" name="serviceId" value={service.id} />
      <FormMessage state={state} />

      <fieldset className="card space-y-5 p-6">
        <legend className="float-left mb-2 w-full font-serif text-2xl">When</legend>
        <TextField
          name="date"
          type="date"
          label="Date"
          required
          min={minDate}
          max={maxDate}
          value={date}
          onChange={(e) => setDate(e.target.value)}
          error={state.errors?.date ?? (!dayOk ? `${service.name} is available on ${service.availableDays.map((d) => d[0].toUpperCase() + d.slice(1)).join(', ')} only.` : undefined)}
          hint={service.availableDays.length && service.availableDays.length < 7 ? `Available on ${service.availableDays.map((d) => d[0].toUpperCase() + d.slice(1)).join(', ')}.` : undefined}
        />
        {service.location === 'either' && (
          <Select
            name="venue"
            label="Where"
            required
            value={venue}
            onChange={(e) => setVenue(e.target.value)}
            options={[
              { label: 'At the Mandir', value: 'mandir' },
              { label: 'At my home or another venue', value: 'home' },
            ]}
          />
        )}
        {service.category === 'hall' && (
          <Select
            name="durationMinutes"
            label="How long"
            required
            value={String(duration)}
            onChange={(e) => setDuration(Number(e.target.value))}
            options={[120, 180, 240, 300, 360, 480, 600].map((m) => ({ label: `${m / 60} hours`, value: String(m) }))}
          />
        )}
        {isClass ? (
          <input type="hidden" name="startTime" value={service.earliestTime} />
        ) : (
          <div>
            <p id="slot-label" className="field-label">
              Start time <span className="text-kumkum-700">*</span>
            </p>
            {!date ? (
              <p className="field-hint">Choose a date to see free times.</p>
            ) : loadingBusy ? (
              <p className="field-hint" aria-live="polite">
                Checking availability…
              </p>
            ) : (
              <div role="radiogroup" aria-labelledby="slot-label" className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                {slots.map((s) => (
                  <label
                    key={s.time}
                    className={`flex min-h-11 items-center justify-center rounded-xl border text-sm font-semibold transition-colors ${!s.free ? 'cursor-not-allowed border-ivory-300 bg-ivory-200 text-charcoal-400 line-through' : start === s.time ? 'cursor-pointer border-kumkum-700 bg-kumkum-700 text-white' : 'cursor-pointer border-ivory-400 bg-white hover:border-charcoal-400'}`}
                  >
                    <input type="radio" name="startTime" value={s.time} disabled={!s.free} checked={start === s.time} onChange={() => setStart(s.time)} className="sr-only" />
                    {s.time}
                    {!s.free && <span className="sr-only"> (booked)</span>}
                  </label>
                ))}
              </div>
            )}
            {state.errors?.startTime && <p className="field-error">{state.errors.startTime}</p>}
            {needsAvailability && busy && busy.length > 0 && <p className="field-hint">Crossed-out times are already booked.</p>}
          </div>
        )}
        {service.category !== 'hall' && <input type="hidden" name="durationMinutes" value={duration} />}
      </fieldset>

      <fieldset className="card space-y-5 p-6">
        <legend className="float-left mb-2 w-full font-serif text-2xl">Your details</legend>
        <TextField name="name" label="Full name" autoComplete="name" required defaultValue={v.name ?? defaults?.name} error={state.errors?.name} />
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField name="email" type="email" label="Email" autoComplete="email" required defaultValue={v.email ?? defaults?.email} error={state.errors?.email} />
          <TextField name="phone" type="tel" label="Phone" autoComplete="tel" defaultValue={v.phone ?? defaults?.phone} error={state.errors?.phone} />
        </div>
        {service.category === 'meal' && <TextArea name="dietaryNotes" label="Dietary needs" rows={2} defaultValue={v.dietaryNotes} />}
        <TextArea name="notes" label={venue === 'home' ? 'Address and anything the pujari should know' : 'Anything we should know'} rows={3} defaultValue={v.notes} error={state.errors?.notes} />
        {service.materialsPrice > 0 && (
          <Checkbox name="includeMaterials" label={`Include pooja materials (${formatGBP(service.materialsPrice)}) — everything except fresh items`} checked={materials} onChange={(e) => setMaterials(e.target.checked)} />
        )}
        {service.requiresPolicy && (
          <Checkbox
            name="policyAgreed"
            required
            label={
              <>
                I have read and agree to the{' '}
                <Link href="/hall-hire-terms" target="_blank" className="font-semibold text-kumkum-800 underline">
                  hall and kitchen hire policy
                </Link>
              </>
            }
          />
        )}
      </fieldset>

      <div className="flex flex-col gap-4 rounded-2xl bg-charcoal-900 p-6 text-ivory-50 sm:flex-row sm:items-center sm:justify-between" aria-live="polite">
        <div>
          <p className="text-sm text-ivory-300">{service.priceOnRequest ? 'Price' : isMember ? 'Member price' : 'Estimated cost'}</p>
          <p className="text-2xl font-semibold">{estimate === null ? 'Confirmed on approval' : estimate ? formatGBP(estimate) : 'Free'}</p>
          {!isMember && !service.priceOnRequest && service.memberPrice < service.nonMemberPrice && (
            <p className="text-sm text-ivory-300">
              <Link href="/account/login" className="underline">
                Sign in
              </Link>{' '}
              for member prices.
            </p>
          )}
        </div>
        <SubmitButton pendingLabel="Sending…">{service.requiresApproval ? 'Send request' : estimate ? 'Continue to payment' : 'Reserve'}</SubmitButton>
      </div>
    </form>
  )
}
