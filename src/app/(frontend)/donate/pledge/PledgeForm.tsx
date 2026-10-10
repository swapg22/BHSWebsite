'use client'

import { useActionState, useState } from 'react'
import { submitPledge } from '@/app/(frontend)/actions/donate'
import { FormGuardFields, FormMessage, Select, SubmitButton, TextArea, TextField } from '@/components/forms'
import type { FormState } from '@/lib/formGuard'

export function PledgeForm({ token }: { token: string }) {
  const [state, action] = useActionState<FormState, FormData>(submitPledge, {})
  const [plan, setPlan] = useState('monthly')
  const v = state.values ?? {}
  if (state.ok) return <FormMessage state={state} />
  return (
    <form action={action} className="card relative space-y-5 p-6 sm:p-8" noValidate>
      <FormGuardFields token={token} />
      <FormMessage state={state} />
      <TextField name="name" label="Full name" autoComplete="name" required defaultValue={v.name} error={state.errors?.name} />
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField name="email" type="email" label="Email" autoComplete="email" required defaultValue={v.email} error={state.errors?.email} />
        <TextField name="phone" type="tel" label="Phone" autoComplete="tel" defaultValue={v.phone} />
      </div>
      <TextField name="amount" label="Total pledge (£)" inputMode="decimal" required defaultValue={v.amount} error={state.errors?.amount} hint="Minimum £1,000" />
      <div className="grid gap-5 sm:grid-cols-2">
        <Select name="plan" label="How you would like to give" required value={plan} onChange={(e) => setPlan(e.target.value)} options={[{ value: 'single', label: 'A single gift' }, { value: 'monthly', label: 'Monthly instalments' }, { value: 'quarterly', label: 'Quarterly instalments' }, { value: 'annual', label: 'Annual instalments' }]} />
        {plan !== 'single' && <TextField name="instalments" type="number" min={2} max={120} label="Number of instalments" required defaultValue={v.instalments ?? '12'} error={state.errors?.instalments} />}
      </div>
      <TextField name="dedication" label="Dedication" hint="In memory of, or in honour of…" defaultValue={v.dedication} />
      <Select name="contactPreference" label="How should a trustee contact you?" required defaultValue={v.contactPreference ?? 'phone'} options={[{ value: 'phone', label: 'By phone' }, { value: 'email', label: 'By email' }, { value: 'in-person', label: 'In person at the Mandir' }]} />
      <TextArea name="message" label="Message" rows={4} defaultValue={v.message} />
      <SubmitButton pendingLabel="Sending…">Send my pledge</SubmitButton>
    </form>
  )
}
