import { FileDown } from 'lucide-react'
import { FESTIVAL_TABLE_2026 } from '../../seed/content'

/** Year-at-a-glance festival dates, kept as a page per spec section 14 (Events). */
export function FestivalTable({ pdfUrl }: { pdfUrl: string | null }) {
  return (
    <div className="mb-16">
      <div className="overflow-hidden rounded-3xl border border-ivory-300 bg-white">
        <table className="w-full text-left">
          <caption className="sr-only">Bharat Hindu Samaj festival calendar 2026</caption>
          <thead className="bg-ivory-200/70 text-sm uppercase tracking-wider text-charcoal-600">
            <tr>
              <th scope="col" className="px-5 py-3 font-semibold">
                Month
              </th>
              <th scope="col" className="px-5 py-3 font-semibold">
                Festivals and dates
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ivory-300">
            {FESTIVAL_TABLE_2026.map(([month, items]) => (
              <tr key={month} className="align-top">
                <th scope="row" className="w-36 px-5 py-4 font-serif text-xl font-medium text-saffron-800">
                  {month}
                </th>
                <td className="px-5 py-4">
                  <ul className="flex flex-wrap gap-x-5 gap-y-1.5 text-charcoal-700">
                    {items.split(' · ').map((it) => (
                      <li key={it}>{it}</li>
                    ))}
                  </ul>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pdfUrl && (
        <a href={pdfUrl} download className="mt-5 inline-flex min-h-12 items-center gap-2 rounded-full border border-charcoal-400 px-5 font-semibold hover:bg-ivory-200">
          <FileDown aria-hidden="true" className="h-5 w-5" /> Download the festival calendar (PDF)
        </a>
      )}
    </div>
  )
}
