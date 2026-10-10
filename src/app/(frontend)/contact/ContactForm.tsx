'use client'

import { useActionState } from 'react'
import { submitContact } from '@/app/(frontend)/actions/community'
import { FormGuardFields, FormMessage, Select, SubmitButton, TextArea, TextField } from '@/components/forms'
import type { FormState } from '@/lib/formGuard'

export function ContactForm({ token }: { token: string }) {
  const [state, action] = useActionState<FormState, FormData>(submitContact, {})
  const v = state.values ?? {}
  const e = state.errors ?? {}
  if (state.ok) return <FormMessage state={state} />
  return (
    <form action={action} className="card relative space-y-5 p-6 sm:p-8" noValidate>
      <FormGuardFields token={token} />
      <FormMessage state={state} />
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField name="name" label="Name" autoComplete="name" required defaultValue={v.name} error={e.name} />
        <TextField name="email" type="email" label="Email" autoComplete="email" required defaultValue={v.email} error={e.email} />
      </div>
      <TextField name="phone" type="tel" label="Phone" autoComplete="tel" defaultValue={v.phone} />
      <Select
        name="topic"
        label="What is it about?"
        required
        defaultValue={v.topic ?? 'general'}
        error={e.topic}
        hint="We send your message straight to the right person."
        options={[
          { value: 'general', label: 'General enquiry' },
          { value: 'bookings', label: 'Bookings and hall hire' },
          { value: 'donations', label: 'Donations and Gift Aid' },
          { value: 'membership', label: 'Membership' },
          { value: 'safeguarding', label: 'Safeguarding concern' },
        ]}
      />
      <TextArea name="message" label="Message" rows={6} required defaultValue={v.message} error={e.message} />
      <SubmitButton pendingLabel="Sending…">Send message</SubmitButton>
    </form>
  )
}
