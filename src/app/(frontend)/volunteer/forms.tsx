'use client'

import Link from 'next/link'
import { useActionState, useState } from 'react'
import { signUpForShift, submitVolunteer } from '@/app/(frontend)/actions/community'
import { Checkbox, FormGuardFields, FormMessage, SubmitButton, TextArea, TextField } from '@/components/forms'
import type { FormState } from '@/lib/formGuard'

const SKILLS = [
  ['kitchen', 'Kitchen and cooking'],
  ['events', 'Event set-up and stewarding'],
  ['teaching', 'Teaching and youth work'],
  ['seniors', 'Seniors and lunch club'],
  ['fundraising', 'Fundraising'],
  ['media', 'Photography and media'],
  ['it', 'IT and website'],
  ['admin', 'Finance and admin'],
  ['trades', 'Building, trades and maintenance'],
  ['first-aid', 'First aid'],
]
const AVAIL = [
  ['weekday-mornings', 'Weekday mornings'],
  ['weekday-evenings', 'Weekday evenings'],
  ['weekends', 'Weekends'],
  ['festivals-only', 'Festivals only'],
  ['remote', 'From home'],
]

export function VolunteerForm({ token }: { token: string }) {
  const [state, action] = useActionState<FormState, FormData>(submitVolunteer, {})
  const v = state.values ?? {}
  const e = state.errors ?? {}
  if (state.ok) return <FormMessage state={state} />
  return (
    <form action={action} className="card relative space-y-6 p-6 sm:p-8" noValidate>
      <FormGuardFields token={token} />
      <FormMessage state={state} />
      <TextField name="name" label="Full name" autoComplete="name" required defaultValue={v.name} error={e.name} />
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField name="email" type="email" label="Email" autoComplete="email" required defaultValue={v.email} error={e.email} />
        <TextField name="phone" type="tel" label="Phone" autoComplete="tel" defaultValue={v.phone} />
      </div>
      <fieldset>
        <legend className="field-label">Where could you help? <span className="text-saffron-700">*</span></legend>
        <div className="mt-1 grid gap-1 sm:grid-cols-2">
          {SKILLS.map(([val, label]) => <Checkbox key={val} name="skills" value={val} label={label} />)}
        </div>
        {e.skills && <p className="field-error">{e.skills}</p>}
      </fieldset>
      <fieldset>
        <legend className="field-label">When are you free? <span className="text-saffron-700">*</span></legend>
        <div className="mt-1 grid gap-1 sm:grid-cols-2">
          {AVAIL.map(([val, label]) => <Checkbox key={val} name="availability" value={val} label={label} />)}
        </div>
        {e.availability && <p className="field-error">{e.availability}</p>}
      </fieldset>
      <TextArea name="professionalSkills" label="Professional skills for the new Mandir project" rows={3} defaultValue={v.professionalSkills} hint="e.g. architect, structural engineer, solicitor, accountant, project manager" />
      <TextArea name="message" label="Anything else" rows={3} defaultValue={v.message} />
      <Checkbox name="over18" required error={e.over18} label="I am aged 18 or over" />
      <Checkbox name="privacy" required error={e.privacy} label={<>Store my details to arrange volunteering (<Link href="/privacy" className="underline">privacy notice</Link>)</>} />
      <SubmitButton pendingLabel="Sending…">Offer to volunteer</SubmitButton>
    </form>
  )
}

export function ShiftSignup({ shiftId, token }: { shiftId: number; token: string }) {
  const [open, setOpen] = useState(false)
  const [state, action] = useActionState<FormState, FormData>(signUpForShift, {})
  if (state.ok) return <p role="status" className="mt-3 text-sm font-semibold text-[#15803d]">{state.message}</p>
  if (!open) return <button type="button" onClick={() => setOpen(true)} className="mt-3 min-h-11 cursor-pointer rounded-full border border-saffron-200 px-4 text-sm font-semibold text-saffron-800 hover:bg-saffron-50">Sign up for this shift</button>
  return (
    <form action={action} className="relative mt-4 space-y-3" noValidate>
      <FormGuardFields token={token} />
      <input type="hidden" name="shiftId" value={shiftId} />
      <FormMessage state={state} />
      <TextField name={`name`} id={`s${shiftId}-name`} label="Name" required />
      <TextField name="email" type="email" label="Email" required />
      <SubmitButton size="md" pendingLabel="…">Confirm</SubmitButton>
    </form>
  )
}
