'use client'

import { useFormStatus } from 'react-dom'
import type { ComponentProps, ReactNode } from 'react'
import { buttonClass, Diya } from '@/components/ui'

/** Accessible form building blocks: labels tied to inputs, errors announced and linked with aria-describedby. */

export function Field({
  name,
  label,
  hint,
  error,
  required,
  className = '',
  children,
}: {
  name: string
  label: ReactNode
  hint?: ReactNode
  error?: string
  required?: boolean
  className?: string
  children: (props: { id: string; 'aria-invalid'?: boolean; 'aria-describedby'?: string; required?: boolean; name: string }) => ReactNode
}) {
  const id = `f-${name}`
  const describedBy = [hint ? `${id}-hint` : '', error ? `${id}-error` : ''].filter(Boolean).join(' ') || undefined
  return (
    <div className={className}>
      <label htmlFor={id} className="field-label">
        {label}
        {required ? <span className="text-kumkum-700"> *</span> : <span className="font-normal text-charcoal-500"> (optional)</span>}
      </label>
      {children({ id, name, required, 'aria-invalid': error ? true : undefined, 'aria-describedby': describedBy })}
      {hint && (
        <p id={`${id}-hint`} className="field-hint">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="field-error">
          {error}
        </p>
      )}
    </div>
  )
}

export function TextField({ name, label, hint, error, required, className, defaultValue, ...rest }: { name: string; label: ReactNode; hint?: ReactNode; error?: string; className?: string } & ComponentProps<'input'>) {
  return (
    <Field name={name} label={label} hint={hint} error={error} required={required} className={className}>
      {(p) => <input {...p} {...rest} defaultValue={defaultValue} className="field-input" />}
    </Field>
  )
}

export function TextArea({ name, label, hint, error, required, className, defaultValue, rows = 5, ...rest }: { name: string; label: ReactNode; hint?: ReactNode; error?: string; className?: string } & ComponentProps<'textarea'>) {
  return (
    <Field name={name} label={label} hint={hint} error={error} required={required} className={className}>
      {(p) => <textarea {...p} {...rest} rows={rows} defaultValue={defaultValue} className="field-input min-h-28" />}
    </Field>
  )
}

export function Select({ name, label, hint, error, required, className, options, defaultValue, ...rest }: { name: string; label: ReactNode; hint?: ReactNode; error?: string; className?: string; options: { label: string; value: string }[] } & ComponentProps<'select'>) {
  return (
    <Field name={name} label={label} hint={hint} error={error} required={required} className={className}>
      {(p) => (
        <select {...p} {...rest} defaultValue={defaultValue} className="field-input cursor-pointer">
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      )}
    </Field>
  )
}

export function Checkbox({ name, label, hint, error, required, defaultChecked, value = 'on', ...rest }: { name: string; label: ReactNode; hint?: ReactNode; error?: string } & ComponentProps<'input'>) {
  const id = `f-${name}${value !== 'on' ? `-${value}` : ''}`
  return (
    <div>
      <label htmlFor={id} className="flex cursor-pointer items-start gap-3 rounded-xl py-1.5">
        <input
          id={id}
          type="checkbox"
          name={name}
          value={value}
          required={required}
          defaultChecked={defaultChecked}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
          className="mt-0.5 h-6 w-6 shrink-0 cursor-pointer rounded-md border-2 border-charcoal-400 accent-kumkum-700"
          {...rest}
        />
        <span className="text-[0.98rem] text-charcoal-800">{label}</span>
      </label>
      {hint && (
        <p id={`${id}-hint`} className="field-hint ml-9">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="field-error ml-9">
          {error}
        </p>
      )}
    </div>
  )
}

export function SubmitButton({ children, pendingLabel = 'Please wait…', className = '', size = 'lg' }: { children: ReactNode; pendingLabel?: string; className?: string; size?: 'md' | 'lg' }) {
  const { pending } = useFormStatus()
  return (
    <button type="submit" disabled={pending} aria-disabled={pending} className={buttonClass('primary', size, className)}>
      {pending ? (
        <>
          <Diya className="h-5 w-5 text-ivory-50" />
          {pendingLabel}
        </>
      ) : (
        children
      )}
    </button>
  )
}

/** Honeypot and timestamp fields used by guardForm(). */
export function FormGuardFields({ token }: { token: string }) {
  return (
    <>
      <input type="hidden" name="form_started" value={token} />
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="company_website">Leave this field empty</label>
        <input id="company_website" name="company_website" type="text" tabIndex={-1} autoComplete="off" />
      </div>
    </>
  )
}

export function FormMessage({ state }: { state: { ok?: boolean; message?: string } | undefined }) {
  if (!state?.message) return null
  return (
    <div role={state.ok ? 'status' : 'alert'} className={`rounded-2xl border px-5 py-4 ${state.ok ? 'border-tulsi-300 bg-tulsi-50 text-tulsi-900' : 'border-[#f0a3a3] bg-[#fdecec] text-[#7f1d1d]'}`}>
      {state.message}
    </div>
  )
}
