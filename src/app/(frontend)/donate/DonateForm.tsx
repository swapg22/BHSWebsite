'use client'

import Link from 'next/link'
import { useActionState, useState } from 'react'
import { Lock } from 'lucide-react'
import { startDonation } from '@/app/(frontend)/actions/donate'
import { Checkbox, FormGuardFields, FormMessage, SubmitButton, TextArea, TextField, Select } from '@/components/forms'
import type { FormState } from '@/lib/formGuard'
import { FUND_LABELS, FUND_DESCRIPTIONS, SUPPORTED_CURRENCIES, type FundKey } from '@/lib/labels'
import { GIFT_AID_DECLARATION_TEXT } from '@/lib/giftaid'
import { formatMoney, parseAmountToPence } from '@/lib/money'

const PRESETS = [2500, 5100, 10100, 25100, 50100]
const IMPACT: Record<number, string> = {
  2500: 'Lights the diyas for a week of aarti',
  5100: 'Lays a brick in the new Mandir',
  10100: 'Feeds the lunch club for a day',
  25100: 'Sponsors a day of seva and bhog',
  50100: 'Furnishes part of a new classroom',
}

export interface DonateDefaults {
  frequency?: 'one-off' | 'monthly'
  fund?: FundKey
  campaign?: string
  sponsorship?: { id: number; name: string; amount: number; plaque: boolean } | null
  name?: { first: string; last: string; email: string; house?: string; postcode?: string }
}

export function DonateForm({ token, defaults, directDebitDemo }: { token: string; defaults: DonateDefaults; directDebitDemo: boolean }) {
  const [state, action] = useActionState<FormState, FormData>(startDonation, {})
  const v = state.values ?? {}
  const sp = defaults.sponsorship
  const [frequency, setFrequency] = useState<'one-off' | 'monthly'>((v.frequency as 'one-off') ?? defaults.frequency ?? 'one-off')
  const [amount, setAmount] = useState<string>(v.amount ?? '5100')
  const [custom, setCustom] = useState(v.customAmount ?? '')
  const [currency, setCurrency] = useState(v.currency ?? 'GBP')
  const [method, setMethod] = useState(v.method ?? 'card')
  const [giftAid, setGiftAid] = useState(false)
  const [overseas, setOverseas] = useState(false)
  const [company, setCompany] = useState(v.source === 'company')
  const [wall, setWall] = useState(false)

  const pence = sp ? sp.amount : amount === 'other' ? parseAmountToPence(custom) : Number(amount)
  const gbp = currency === 'GBP'
  const label = pence ? `Give ${formatMoney(pence, currency).replace(/\.00$/, "")}${frequency === 'monthly' && !sp ? ' a month' : ''}` : 'Give now'
  const err = state.errors ?? {}

  return (
    <form action={action} className="relative space-y-6" noValidate>
      <FormGuardFields token={token} />
      {defaults.campaign && <input type="hidden" name="campaign" value={defaults.campaign} />}
      {sp && <input type="hidden" name="sponsorshipId" value={sp.id} />}
      <input type="hidden" name="source" value={company ? 'company' : 'personal'} />
      <FormMessage state={state} />

      {sp ? (
        <div className="card p-6">
          <p className="eyebrow">Your sponsorship</p>
          <p className="mt-2 font-serif text-3xl">{sp.name}</p>
          <p className="text-xl font-semibold text-saffron-800">{formatMoney(sp.amount)}</p>
          {sp.plaque && <TextField className="mt-4" name="plaqueName" label="Name or dedication for the plaque" maxLength={60} defaultValue={v.plaqueName} hint="e.g. In loving memory of …" />}
          <input type="hidden" name="frequency" value="one-off" />
        </div>
      ) : (
        <fieldset className="card space-y-5 p-6">
          <legend className="float-left w-full font-serif text-2xl">Your gift</legend>
          <div role="radiogroup" aria-label="How often" className="grid grid-cols-2 gap-1 rounded-full bg-ivory-200 p-1">
            {(['one-off', 'monthly'] as const).map((f) => (
              <label key={f} className={`flex min-h-11 cursor-pointer items-center justify-center rounded-full font-semibold transition-colors ${frequency === f ? 'bg-white text-saffron-800 shadow' : 'text-charcoal-600'}`}>
                <input type="radio" name="frequency" value={f} checked={frequency === f} onChange={() => { setFrequency(f); if (f === 'one-off' && method === 'direct-debit') setMethod('card') }} className="sr-only" />
                {f === 'one-off' ? 'One-off' : 'Monthly'}
              </label>
            ))}
          </div>
          <div role="radiogroup" aria-label="Amount" className="grid grid-cols-3 gap-2">
            {PRESETS.map((p) => (
              <label key={p} className={`flex min-h-14 cursor-pointer items-center justify-center rounded-2xl border-2 text-lg font-semibold transition-colors ${amount === String(p) ? 'border-saffron-700 bg-saffron-50 text-saffron-900' : 'border-ivory-300 bg-white hover:border-charcoal-400'}`}>
                <input type="radio" name="amount" value={p} checked={amount === String(p)} onChange={() => setAmount(String(p))} className="sr-only" />
                {formatMoney(p, currency).replace(/\.00$/, '')}
              </label>
            ))}
            <label className={`flex min-h-14 cursor-pointer items-center justify-center rounded-2xl border-2 text-lg font-semibold ${amount === 'other' ? 'border-saffron-700 bg-saffron-50' : 'border-ivory-300 bg-white hover:border-charcoal-400'}`}>
              <input type="radio" name="amount" value="other" checked={amount === 'other'} onChange={() => setAmount('other')} className="sr-only" />
              Other
            </label>
          </div>
          {amount === 'other' ? (
            <TextField name="customAmount" label="Amount" inputMode="decimal" autoFocus value={custom} onChange={(e) => setCustom(e.target.value)} required error={err.amount} />
          ) : (
            <p className="text-charcoal-600" aria-live="polite">{IMPACT[Number(amount)]}</p>
          )}
          {err.amount && amount !== 'other' && <p className="field-error">{err.amount}</p>}
          <Select
            name="fund"
            label="Give to"
            required
            defaultValue={v.fund ?? defaults.fund ?? 'new-mandir'}
            options={(Object.keys(FUND_LABELS) as FundKey[]).map((k) => ({ value: k, label: `${FUND_LABELS[k]} — ${FUND_DESCRIPTIONS[k]}` }))}
          />
        </fieldset>
      )}

      <fieldset className="card space-y-5 p-6">
        <legend className="float-left w-full font-serif text-2xl">Your details</legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField name="firstName" label="First name" autoComplete="given-name" required defaultValue={v.firstName ?? defaults.name?.first} error={err.firstName} />
          <TextField name="lastName" label="Last name" autoComplete="family-name" required defaultValue={v.lastName ?? defaults.name?.last} error={err.lastName} />
        </div>
        <TextField name="email" type="email" label="Email" autoComplete="email" required defaultValue={v.email ?? defaults.name?.email} error={err.email} hint="For your receipt." />
        <Checkbox name="company_toggle" label="This is a gift from a company" checked={company} onChange={(e) => setCompany(e.target.checked)} />
        {company && <TextField name="company" label="Company name" required defaultValue={v.company} error={err.company} />}
      </fieldset>

      {!company && gbp && (
        <fieldset className="rounded-3xl border-2 border-gold-300 bg-gradient-to-br from-ivory-50 to-gold-300/20 p-6">
          <legend className="sr-only">Gift Aid</legend>
          <p className="font-serif text-2xl">Add 25% with Gift Aid</p>
          <p className="mt-1 text-charcoal-700">
            {pence ? <>Your {formatMoney(pence)} becomes <strong>{formatMoney(Math.floor(pence * 1.25))}</strong> at no extra cost to you.</> : 'Boost your gift by 25p for every £1, at no cost to you.'}
          </p>
          <div className="mt-4">
            <Checkbox name="giftAid" checked={giftAid} onChange={(e) => setGiftAid(e.target.checked)} error={err.giftAid} label={<span className="text-[0.95rem]">{GIFT_AID_DECLARATION_TEXT}</span>} />
          </div>
          {giftAid && (
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <TextField name="houseNameOrNumber" label="House name or number" autoComplete="address-line1" required defaultValue={v.houseNameOrNumber ?? defaults.name?.house} error={err.houseNameOrNumber} />
              <TextField name="addressLine1" label="Street" autoComplete="address-line2" defaultValue={v.addressLine1} />
              <TextField name="town" label="Town or city" autoComplete="address-level2" defaultValue={v.town} />
              {!overseas && <TextField name="postcode" label="Postcode" autoComplete="postal-code" required defaultValue={v.postcode ?? defaults.name?.postcode} error={err.postcode} />}
              <div className="sm:col-span-2">
                <Checkbox name="overseas" label="I live outside the UK (but pay UK tax)" checked={overseas} onChange={(e) => setOverseas(e.target.checked)} />
                {overseas && <TextField className="mt-3" name="country" label="Country" defaultValue={v.country} />}
              </div>
              <p className="text-sm text-charcoal-600 sm:col-span-2">
                HMRC needs your home address. <Link href="/gift-aid" className="underline">About Gift Aid</Link>
              </p>
            </div>
          )}
        </fieldset>
      )}

      <fieldset className="card space-y-4 p-6">
        <legend className="float-left w-full font-serif text-2xl">Pay by</legend>
        <div role="radiogroup" className="grid gap-2">
          {[
            { v: 'card', l: 'Card, Apple Pay or Google Pay', d: 'Secure payment on Stripe. Instant receipt.', show: true },
            { v: 'direct-debit', l: 'Direct Debit', d: 'Monthly, from your UK bank account, via GoCardless.', show: frequency === 'monthly' && gbp && !sp },
            { v: 'standing-order', l: 'Standing order', d: 'Set it up with your bank using our reference.', show: frequency === 'monthly' && gbp && !sp },
            { v: 'bank-transfer', l: 'Bank transfer', d: 'We will show our bank details and your reference.', show: frequency === 'one-off' && gbp },
          ]
            .filter((o) => o.show)
            .map((o) => (
              <label key={o.v} className={`flex min-h-14 cursor-pointer items-start gap-3 rounded-2xl border-2 p-4 ${method === o.v ? 'border-saffron-700 bg-saffron-50' : 'border-ivory-300 bg-white hover:border-charcoal-400'}`}>
                <input type="radio" name="method" value={o.v} checked={method === o.v} onChange={() => setMethod(o.v)} className="mt-1 h-5 w-5 accent-saffron-700" />
                <span>
                  <span className="block font-semibold">{o.l}</span>
                  <span className="block text-sm text-charcoal-600">{o.d}</span>
                </span>
              </label>
            ))}
        </div>
        {err.method && <p className="field-error">{err.method}</p>}
        {method === 'direct-debit' && directDebitDemo && <p className="text-sm text-charcoal-500">Demo mode: Direct Debit is simulated until GoCardless keys are added.</p>}
        {!sp && (
          <details className="text-sm">
            <summary className="min-h-11 cursor-pointer py-2 font-semibold text-saffron-800">Giving from overseas? Change currency</summary>
            <Select name="currency" label="Currency" value={currency} onChange={(e) => { setCurrency(e.target.value); if (e.target.value !== 'GBP') { setMethod('card'); setGiftAid(false) } }} options={SUPPORTED_CURRENCIES.map((c) => ({ value: c, label: c }))} hint="Gift Aid is only available on UK taxpayers’ gifts in pounds. Please check any tax relief available in your own country." />
          </details>
        )}
        {sp && <input type="hidden" name="currency" value="GBP" />}
      </fieldset>

      <fieldset className="card space-y-3 p-6">
        <legend className="float-left w-full font-serif text-2xl">Optional</legend>
        <Checkbox name="donorWall" label="Show my name on the donor wall" checked={wall} onChange={(e) => setWall(e.target.checked)} />
        {wall && (
          <div className="grid gap-4 pl-9">
            <TextField name="displayName" label="Name to show" maxLength={60} required defaultValue={v.displayName} error={err.displayName} />
            <TextArea name="wallMessage" label="Short message" rows={2} maxLength={200} defaultValue={v.wallMessage} />
          </div>
        )}
        <Checkbox name="marketing" label="Email me updates about the new Mandir appeal. I can unsubscribe at any time." />
      </fieldset>

      <div className="sticky bottom-3 z-10 rounded-3xl bg-charcoal-900 p-4 shadow-2xl sm:static sm:p-6">
        <SubmitButton className="w-full" pendingLabel="Connecting securely…">
          <Lock aria-hidden="true" className="h-5 w-5" /> {label}
        </SubmitButton>
        <p className="mt-2 text-center text-xs text-ivory-300">Payments are processed securely by Stripe or GoCardless. We never see or store your card details. Registered charity 274404.</p>
      </div>
    </form>
  )
}
