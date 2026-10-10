'use client'

import { Printer } from 'lucide-react'

export function PrintButton({ label = 'Print or save as PDF' }: { label?: string }) {
  return (
    <button type="button" onClick={() => window.print()} className="inline-flex min-h-12 cursor-pointer items-center gap-2 rounded-full bg-charcoal-900 px-6 font-semibold text-white hover:bg-charcoal-700">
      <Printer aria-hidden="true" className="h-5 w-5" /> {label}
    </button>
  )
}
