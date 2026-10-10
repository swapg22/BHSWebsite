'use client'

import { useState, useTransition } from 'react'
import { requestDataDeletion } from '@/app/(frontend)/actions/membership'

export function DataRequest() {
  const [msg, setMsg] = useState<string | null>(null)
  const [pending, start] = useTransition()
  if (msg) return <p role="status" className="mt-4 text-sm text-charcoal-700">{msg}</p>
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!window.confirm('Ask the membership officer to delete your personal data? Your membership will end.')) return
        start(async () => setMsg((await requestDataDeletion()).message ?? null))
      }}
      className="mt-3 block min-h-11 cursor-pointer text-sm font-semibold text-[#b42318] underline"
    >
      Request deletion of my data
    </button>
  )
}
