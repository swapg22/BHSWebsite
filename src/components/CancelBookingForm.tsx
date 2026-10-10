'use client'

import { useActionState } from 'react'
import { cancelMyBooking } from '@/app/(frontend)/actions/booking'
import { Checkbox, FormMessage, SubmitButton } from '@/components/forms'
import type { FormState } from '@/lib/formGuard'

export function CancelBookingForm({ reference, token = '' }: { reference: string; token?: string }) {
  const [state, action] = useActionState<FormState, FormData>(cancelMyBooking, {})
  if (state.ok) return <div className="mt-6"><FormMessage state={state} /></div>
  return (
    <details className="mt-8 rounded-2xl border border-ivory-300 bg-white p-5">
      <summary className="min-h-11 cursor-pointer py-2 font-semibold text-charcoal-800">Cancel this booking</summary>
      <form action={action} className="mt-3 space-y-4">
        <input type="hidden" name="reference" value={reference} />
        <input type="hidden" name="t" value={token} />
        <FormMessage state={state} />
        <p className="text-sm text-charcoal-600">Refunds follow the cancellation rules shown when you booked.</p>
        <Checkbox name="confirm" label="Yes, I want to cancel this booking" />
        <SubmitButton size="md" pendingLabel="Cancelling…">Cancel booking</SubmitButton>
      </form>
    </details>
  )
}
