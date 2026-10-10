'use client'

import { useActionState } from 'react'
import { staffLogin } from '../actions'
import { FormMessage, SubmitButton, TextField } from '@/components/forms'
import type { FormState } from '@/lib/formGuard'

export function StaffLoginForm() {
  const [state, action] = useActionState<FormState, FormData>(staffLogin, {})
  return (
    <form action={action} className="card mt-8 space-y-5 p-6" noValidate>
      <FormMessage state={state} />
      <TextField name="email" type="email" label="Email" autoComplete="username" required defaultValue={state.values?.email} />
      <TextField name="password" type="password" label="Password" autoComplete="current-password" required />
      <TextField name="totp" label="6-digit code" inputMode="numeric" autoComplete="one-time-code" pattern="\d{6}" maxLength={6} error={state.errors?.totp} hint="From your authenticator app, if two-factor sign-in is on (required for administrators)." />
      <SubmitButton className="w-full" pendingLabel="Signing in…">Sign in</SubmitButton>
    </form>
  )
}
