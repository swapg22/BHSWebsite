'use client'

import { useActionState } from 'react'
import { updateProfile } from '@/app/(frontend)/actions/membership'
import { Checkbox, FormMessage, SubmitButton, TextField } from '@/components/forms'
import type { FormState } from '@/lib/formGuard'

interface P {
  firstName: string
  lastName: string
  phone: string
  addressLine1: string
  addressLine2: string
  town: string
  postcode: string
  newsletter: boolean
  sms: boolean
  autoRenew: boolean
  giftAid: boolean
  email: string
}

export function ProfileForm({ member }: { member: P }) {
  const [state, action] = useActionState<FormState, FormData>(updateProfile, {})
  const e = state.errors ?? {}
  return (
    <form action={action} className="mt-5 space-y-5" noValidate>
      <FormMessage state={state} />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <TextField name="firstName" label="First name" required defaultValue={member.firstName} error={e.firstName} />
        <TextField name="lastName" label="Last name" defaultValue={member.lastName} />
        <TextField name="phone" type="tel" label="Phone" defaultValue={member.phone} />
        <TextField name="addressLine1" label="Address line 1" defaultValue={member.addressLine1} />
        <TextField name="addressLine2" label="Address line 2" defaultValue={member.addressLine2} />
        <TextField name="town" label="Town" defaultValue={member.town} />
        <TextField name="postcode" label="Postcode" defaultValue={member.postcode} error={e.postcode} />
        <div className="sm:col-span-2">
          <p className="field-label">Email</p>
          <p className="min-h-12 content-center text-charcoal-700">{member.email} <span className="text-sm text-charcoal-500">(contact the membership officer to change)</span></p>
        </div>
      </div>
      <div className="grid gap-1 sm:grid-cols-2">
        <Checkbox name="newsletter" defaultChecked={member.newsletter} label="Email me the newsletter" />
        <Checkbox name="sms" defaultChecked={member.sms} label="Text/WhatsApp messages about events" />
        <Checkbox name="autoRenew" defaultChecked={member.autoRenew} label="Renew my membership automatically" />
        <Checkbox name="giftAid" defaultChecked={member.giftAid} label="Gift Aid my donations (I am a UK taxpayer)" />
      </div>
      <SubmitButton size="md" pendingLabel="Saving…">Save changes</SubmitButton>
    </form>
  )
}
