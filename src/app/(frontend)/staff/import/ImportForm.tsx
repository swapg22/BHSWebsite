'use client'

import { useActionState } from 'react'
import { importMembers, type ImportState } from '../actions'

export function ImportForm() {
  const [state, action, pending] = useActionState<ImportState, FormData>(importMembers, {})
  const r = state.report
  return (
    <div className="mt-8 space-y-8">
      <form action={action} className="card flex flex-col gap-4 p-6 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label htmlFor="file" className="field-label">Member list (.xlsx or .csv)</label>
          <input id="file" name="file" type="file" accept=".xlsx,.csv" required className="field-input cursor-pointer" />
        </div>
        <button name="mode" value="check" disabled={pending} className="min-h-12 cursor-pointer rounded-full border border-charcoal-400 px-6 font-semibold hover:bg-ivory-100">Check file</button>
        <button name="mode" value="import" disabled={pending || !r} className="min-h-12 cursor-pointer rounded-full bg-saffron-700 px-6 font-semibold text-white hover:bg-saffron-800 disabled:opacity-50">Import</button>
      </form>
      {state.message && <p role="status" className="rounded-2xl border border-ivory-400 bg-white p-4">{state.message}</p>}
      {r && (
        <section aria-labelledby="rep">
          <h2 id="rep" className="text-2xl">{state.dryRun ? 'Check results' : 'Import report'}</h2>
          <p className="mt-2 text-charcoal-600">{r.valid.length} rows ready · {r.issues.filter((i) => i.severity === 'error').length} errors · {r.issues.filter((i) => i.severity === 'warning').length} warnings · {r.skipped} blank rows skipped · {r.valid.filter((v) => !v.email).length} without email (not imported)</p>
          {r.issues.length > 0 && (
            <div className="mt-4 overflow-x-auto rounded-2xl border border-ivory-300 bg-white">
              <table className="w-full text-left text-sm">
                <thead className="bg-ivory-200 text-charcoal-600"><tr><th className="px-4 py-2">Row</th><th className="px-4 py-2">Type</th><th className="px-4 py-2">Field</th><th className="px-4 py-2">Problem</th></tr></thead>
                <tbody className="divide-y divide-ivory-300">
                  {r.issues.map((i, n) => (
                    <tr key={n}>
                      <td className="px-4 py-2">{i.rowNumber}</td>
                      <td className={`px-4 py-2 font-semibold ${i.severity === 'error' ? 'text-[#b42318]' : 'text-saffron-800'}`}>{i.severity}</td>
                      <td className="px-4 py-2">{i.field}</td>
                      <td className="px-4 py-2">{i.message}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </div>
  )
}
