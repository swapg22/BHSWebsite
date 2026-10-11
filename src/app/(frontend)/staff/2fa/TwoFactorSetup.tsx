'use client'

import { useActionState, useState, useTransition } from 'react'
import { beginTwoFactor, confirmTwoFactor } from '../actions'
import { FormMessage, SubmitButton, TextField } from '@/components/forms'
import type { FormState } from '@/lib/formGuard'

export function TwoFactorSetup() {
  const [setup, setSetup] = useState<{ qr: string; secret: string } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pending, start] = useTransition()
  const [state, action] = useActionState<FormState, FormData>(confirmTwoFactor, {})

  if (state.ok)
    return (
      <div className="mt-6 space-y-4">
        <FormMessage state={state} />
        <a href="/staff/login" className="inline-flex min-h-12 items-center rounded-full bg-kumkum-700 px-6 font-semibold text-white">Sign in again</a>
      </div>
    )

  return (
    <div className="card mt-6 space-y-5 p-6">
      {!setup ? (
        <button
          type="button"
          disabled={pending}
          onClick={() => start(async () => { const r = await beginTwoFactor(); if ('error' in r) setError(r.error); else setSetup(r) })}
          className="min-h-12 w-full cursor-pointer rounded-full bg-kumkum-700 font-semibold text-white hover:bg-kumkum-800 disabled:opacity-60"
        >
          {pending ? 'Generating…' : 'Show my QR code'}
        </button>
      ) : (
        <>
          <ol className="list-decimal space-y-2 pl-5 text-charcoal-700">
            <li>Open your authenticator app and scan this code.</li>
            <li>Enter the 6-digit code it shows.</li>
          </ol>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={setup.qr} alt="QR code to add Bharat Hindu Samaj to your authenticator app" width={240} height={240} className="mx-auto rounded-xl border border-ivory-300" />
          <details className="text-sm"><summary className="cursor-pointer font-semibold">Can’t scan? Enter this key</summary><code className="mt-2 block break-all rounded bg-ivory-200 p-3">{setup.secret}</code></details>
          <form action={action} className="space-y-4">
            <FormMessage state={state} />
            <TextField name="totp" label="6-digit code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} required error={state.errors?.totp} />
            <SubmitButton className="w-full" pendingLabel="Checking…">Turn on two-factor sign-in</SubmitButton>
          </form>
        </>
      )}
      {error && <p role="alert" className="field-error">{error}</p>}
    </div>
  )
}
