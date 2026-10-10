'use client'

import { useActionState } from 'react'
import { resetPassword } from '@/app/(frontend)/actions/membership'
import { FormMessage, SubmitButton, TextField } from '@/components/forms'
import type { FormState } from '@/lib/formGuard'

export function ResetForm({ token }: { token: string }) {
  const [state, action] = useActionState<FormState, FormData>(resetPassword, {})
  return (
    <form action={action} className="card mt-6 space-y-5 p-6" noValidate>
      <input type="hidden" name="token" value={token} />
      <FormMessage state={state} />
      <TextField name="password" type="password" label="New password" autoComplete="new-password" required error={state.errors?.password} hint="At least 10 characters, with a letter and a number." />
      <TextField name="confirmPassword" type="password" label="Confirm new password" autoComplete="new-password" required error={state.errors?.confirmPassword} />
      <SubmitButton className="w-full" pendingLabel="Saving…">Save and sign in</SubmitButton>
    </form>
  )
}
