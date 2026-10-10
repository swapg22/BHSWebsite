'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { joinMembership } from '@/app/(frontend)/actions/membership'
import { Checkbox, FormGuardFields, FormMessage, SubmitButton, TextField } from '@/components/forms'
import type { FormState } from '@/lib/formGuard'

export function JoinForm({ token }: { token: string }) {
  const [state, action] = useActionState<FormState, FormData>(joinMembership, {})
  const v = state.values ?? {}
  const e = state.errors ?? {}
  return (
    <form action={action} className="relative space-y-6" noValidate>
      <FormGuardFields token={token} />
      <FormMessage state={state} />
      <fieldset className="card space-y-5 p-6">
        <legend className="float-left w-full font-serif text-2xl">About you</legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField name="firstName" label="First name" autoComplete="given-name" required defaultValue={v.firstName} error={e.firstName} />
          <TextField name="lastName" label="Last name" autoComplete="family-name" required defaultValue={v.lastName} error={e.lastName} />
          <TextField name="email" type="email" label="Email" autoComplete="email" required defaultValue={v.email} error={e.email} />
          <TextField name="phone" type="tel" label="Phone" autoComplete="tel" required defaultValue={v.phone} error={e.phone} />
        </div>
      </fieldset>
      <fieldset className="card space-y-5 p-6">
        <legend className="float-left w-full font-serif text-2xl">Home address</legend>
        <TextField name="addressLine1" label="Address line 1" autoComplete="address-line1" required defaultValue={v.addressLine1} error={e.addressLine1} />
        <TextField name="addressLine2" label="Address line 2" autoComplete="address-line2" defaultValue={v.addressLine2} />
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField name="town" label="Town or city" autoComplete="address-level2" required defaultValue={v.town} error={e.town} />
          <TextField name="postcode" label="Postcode" autoComplete="postal-code" required defaultValue={v.postcode} error={e.postcode} />
        </div>
      </fieldset>
      <fieldset className="card space-y-5 p-6">
        <legend className="float-left w-full font-serif text-2xl">Your account</legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField name="password" type="password" label="Create a password" autoComplete="new-password" required error={e.password} hint="At least 10 characters, with a letter and a number." />
          <TextField name="confirmPassword" type="password" label="Confirm password" autoComplete="new-password" required error={e.confirmPassword} />
        </div>
      </fieldset>
      <fieldset className="card space-y-2 p-6">
        <legend className="float-left mb-2 w-full font-serif text-2xl">Confirm</legend>
        <Checkbox name="over18" required error={e.over18} label="I confirm I am aged 18 or over" />
        <Checkbox name="autoRenew" label="Renew my membership automatically each year (cancel any time)" />
        <Checkbox name="giftAid" label="Gift Aid my future donations: I am a UK taxpayer (the £20 fee itself is not Gift Aided)" />
        <Checkbox name="newsletter" label="Email me the newsletter" />
        <Checkbox name="sms" label="Send me occasional text or WhatsApp messages about events" />
        <Checkbox name="privacy" required error={e.privacy} label={<>I have read the <Link href="/privacy" target="_blank" className="font-semibold text-saffron-800 underline">privacy notice</Link></>} />
      </fieldset>
      <SubmitButton className="w-full sm:w-auto" pendingLabel="Creating your account…">Continue to pay £20</SubmitButton>
    </form>
  )
}
