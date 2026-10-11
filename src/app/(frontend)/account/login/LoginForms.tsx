'use client'

import { useActionState, useState } from 'react'
import { forgotPassword, loginMember, requestMagicLink } from '@/app/(frontend)/actions/membership'
import { FormMessage, SubmitButton, TextField } from '@/components/forms'
import type { FormState } from '@/lib/formGuard'

type Mode = 'password' | 'link' | 'forgot'

export function LoginForms({ next }: { next: string }) {
  const [mode, setMode] = useState<Mode>('password')
  const [loginState, loginAction] = useActionState<FormState, FormData>(loginMember, {})
  const [linkState, linkAction] = useActionState<FormState, FormData>(requestMagicLink, {})
  const [forgotState, forgotAction] = useActionState<FormState, FormData>(forgotPassword, {})
  const tabs: [Mode, string][] = [
    ['password', 'Password'],
    ['link', 'Email me a link'],
  ]
  return (
    <div className="mt-8">
      <div role="tablist" aria-label="Sign-in method" className="grid grid-cols-2 gap-1 rounded-full bg-ivory-200 p-1">
        {tabs.map(([m, l]) => (
          <button key={m} role="tab" type="button" aria-selected={mode === m || (m === 'password' && mode === 'forgot')} onClick={() => setMode(m)} className={`min-h-11 cursor-pointer rounded-full font-semibold ${mode === m || (m === 'password' && mode === 'forgot') ? 'bg-white text-kumkum-800 shadow' : 'text-charcoal-600'}`}>
            {l}
          </button>
        ))}
      </div>
      <div className="card mt-6 p-6">
        {mode === 'password' && (
          <form action={loginAction} className="space-y-5" noValidate>
            <input type="hidden" name="next" value={next} />
            <FormMessage state={loginState} />
            <TextField name="email" type="email" label="Email" autoComplete="email" required defaultValue={loginState.values?.email} error={loginState.errors?.email} />
            <TextField name="password" type="password" label="Password" autoComplete="current-password" required error={loginState.errors?.password} />
            <SubmitButton className="w-full" pendingLabel="Signing in…">Sign in</SubmitButton>
            <button type="button" onClick={() => setMode('forgot')} className="min-h-11 w-full cursor-pointer text-sm font-semibold text-kumkum-800 underline">Forgotten your password?</button>
          </form>
        )}
        {mode === 'link' && (
          <form action={linkAction} className="space-y-5" noValidate>
            <input type="hidden" name="next" value={next} />
            <p className="text-charcoal-600">We’ll email you a one-time link to sign in — no password needed.</p>
            <FormMessage state={linkState} />
            {!linkState.ok && (
              <>
                <TextField name="email" type="email" label="Email" autoComplete="email" required error={linkState.errors?.email} />
                <SubmitButton className="w-full" pendingLabel="Sending…">Email me a sign-in link</SubmitButton>
              </>
            )}
          </form>
        )}
        {mode === 'forgot' && (
          <form action={forgotAction} className="space-y-5" noValidate>
            <p className="text-charcoal-600">Enter your email and we’ll send a link to reset your password.</p>
            <FormMessage state={forgotState} />
            {!forgotState.ok && (
              <>
                <TextField name="email" type="email" label="Email" autoComplete="email" required error={forgotState.errors?.email} />
                <SubmitButton className="w-full" pendingLabel="Sending…">Send reset link</SubmitButton>
              </>
            )}
            <button type="button" onClick={() => setMode('password')} className="min-h-11 w-full cursor-pointer text-sm font-semibold text-kumkum-800 underline">Back to sign in</button>
          </form>
        )}
      </div>
    </div>
  )
}
