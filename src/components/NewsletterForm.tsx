'use client'

import { useActionState } from 'react'
import { subscribeNewsletter } from '@/app/(frontend)/actions/community'
import { FormGuardFields } from '@/components/forms'
import type { FormState } from '@/lib/formGuard'

export function NewsletterForm({ token, source = 'footer', tone = 'dark' }: { token: string; source?: string; tone?: 'dark' | 'light' }) {
  const [state, action, pending] = useActionState<FormState, FormData>(subscribeNewsletter, {})
  const dark = tone === 'dark'
  if (state.ok) {
    return (
      <p role="status" className={`rounded-xl px-4 py-3 text-sm ${dark ? 'bg-white/10 text-ivory-50' : 'bg-[#ecf7ef] text-[#14532d]'}`}>
        {state.message}
      </p>
    )
  }
  return (
    <form action={action} className="relative space-y-3" noValidate>
      <FormGuardFields token={token} />
      <input type="hidden" name="source" value={source} />
      <label htmlFor={`nl-email-${source}`} className={dark ? 'sr-only' : 'field-label'}>
        Email address
      </label>
      <div className="flex gap-2">
        <input
          id={`nl-email-${source}`}
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder={dark ? 'Your email address' : undefined}
          defaultValue={state.values?.email}
          aria-invalid={state.errors?.email ? true : undefined}
          className={`min-h-12 w-full rounded-full px-4 text-base ${dark ? 'border border-white/20 bg-white/10 text-white placeholder:text-ivory-300 focus:border-gold-400 focus:outline-none' : 'field-input !rounded-full'}`}
        />
        <button type="submit" disabled={pending} className="min-h-12 shrink-0 cursor-pointer rounded-full bg-saffron-700 px-5 font-semibold text-white hover:bg-saffron-600 disabled:opacity-60">
          {pending ? '…' : 'Sign up'}
        </button>
      </div>
      <label className={`flex cursor-pointer items-start gap-2.5 text-sm ${dark ? 'text-ivory-300' : 'text-charcoal-600'}`}>
        <input type="checkbox" name="consent" required className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer accent-saffron-600" />
        <span>Yes, email me the newsletter. I can unsubscribe at any time.</span>
      </label>
      {state.message && !state.ok && (
        <p role="alert" className={`text-sm font-medium ${dark ? 'text-saffron-200' : 'text-[#b42318]'}`}>
          {state.message}
        </p>
      )}
    </form>
  )
}
