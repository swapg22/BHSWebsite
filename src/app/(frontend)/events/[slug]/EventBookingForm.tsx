'use client'

import { useActionState, useState } from 'react'
import { bookEvent } from '@/app/(frontend)/actions/booking'
import { FormGuardFields, FormMessage, SubmitButton, TextArea, TextField } from '@/components/forms'
import type { FormState } from '@/lib/formGuard'
import { formatGBP } from '@/lib/money'

export function EventBookingForm({
  eventId,
  token,
  isMember,
  defaults,
  full,
  memberPrice,
  guestPrice,
}: {
  eventId: number
  token: string
  isMember: boolean
  defaults?: { name: string; email: string; phone: string }
  full: boolean
  memberPrice: number
  guestPrice: number
}) {
  const [state, action] = useActionState<FormState, FormData>(bookEvent, {})
  const [qty, setQty] = useState(Number(state.values?.quantity ?? 1))
  const unit = isMember ? memberPrice : guestPrice
  const total = unit * (Number.isFinite(qty) ? qty : 1)
  const v = state.values ?? {}

  return (
    <form action={action} className="relative mt-6 space-y-5" noValidate>
      <FormGuardFields token={token} />
      <input type="hidden" name="eventId" value={eventId} />
      <FormMessage state={state} />
      <TextField name="name" label="Full name" autoComplete="name" required defaultValue={v.name ?? defaults?.name} error={state.errors?.name} />
      <TextField name="email" type="email" label="Email" autoComplete="email" required defaultValue={v.email ?? defaults?.email} error={state.errors?.email} hint="We'll send your confirmation here." />
      <TextField name="phone" type="tel" label="Phone" autoComplete="tel" defaultValue={v.phone ?? defaults?.phone} error={state.errors?.phone} />
      <TextField
        name="quantity"
        type="number"
        inputMode="numeric"
        min={1}
        max={20}
        label="Number of places"
        required
        defaultValue={v.quantity ?? '1'}
        onChange={(e) => setQty(Number(e.target.value))}
        error={state.errors?.quantity}
      />
      <TextArea name="dietaryNotes" label="Dietary or access needs" rows={2} defaultValue={v.dietaryNotes} error={state.errors?.dietaryNotes} />
      <div className="flex items-center justify-between rounded-2xl bg-ivory-100 px-5 py-4" aria-live="polite">
        <span className="text-charcoal-600">{isMember ? 'Member price' : 'Total'}</span>
        <span className="text-xl font-semibold">{total ? formatGBP(total) : 'Free'}</span>
      </div>
      {!isMember && memberPrice < guestPrice && <p className="text-sm text-charcoal-600">Members pay less. Sign in to see member prices.</p>}
      <SubmitButton className="w-full" pendingLabel="Booking…">
        {full ? 'Join the waiting list' : total ? 'Continue to payment' : 'Reserve my places'}
      </SubmitButton>
    </form>
  )
}
