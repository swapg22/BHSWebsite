import type { Metadata } from 'next'
import { requireStaff } from '@/lib/staffAuth'

export const metadata: Metadata = { title: 'Editor guide', robots: { index: false } }

const STEPS: [string, string[]][] = [
  ['Signing in', ['Go to /staff/login. Administrators enter the 6-digit code from their authenticator app.', 'Lost your phone? Another administrator can reset your two-factor sign-in on your user record.']],
  ['Posting an event', ['CMS → Content → Events → Create new.', 'Fill in title, start and end, description, picture, and tick “Take bookings online” if needed (prices are in pence: £5 = 500).', 'Click “Save draft”, tick “Ready for review”, and save again. The administrator publishes it.', 'Deleting moves the event to the bin for 30 days; it can be restored from the Trash view.']],
  ['Uploading photos', ['CMS → Content → Media: drag in images and write alt text describing each one.', 'Content → Albums: create an album and add photos with captions. Only name people who have given consent.', 'Images are resized automatically. Deity images need approval from the priests and committee.']],
  ['Changing opening and aarti times', ['CMS → Settings → Site settings & times. Change the times once; the header, home page and footer all update.', 'For festivals add a seasonal override with start and end dates.']],
  ['Updating the appeal', ['CMS → Settings → New Mandir appeal → Progress: enter money raised offline and add milestones with photos.', 'Online gifts to the New Mandir fund are added automatically. The administrator publishes the change.']],
  ['Editing pages', ['CMS → Content → Pages. Change text and images within the fixed layouts — you cannot break the design.', 'Every save is kept in Versions; open a version and click “Restore” to go back.']],
  ['Bookings (office)', ['CMS → Bookings → Bookings, filter “Pending approval”.', 'For price-on-request hall hire, set the Amount (pence) first, then change status to “Awaiting payment” — the booker is emailed a payment link.', 'Set “Confirmed” for free bookings, or “Rejected” with a note to the booker.']],
  ['Service catalogue', ['CMS → Bookings → Service catalogue. Add, change, pause or remove services. Removing hides a service but keeps its past bookings.', 'Only the administrator and treasurer can change prices.']],
  ['Users', ['CMS → Admin → Staff users → Create new: enter name, email and role. They receive an email to set their password.', 'Tick “Suspended” to remove access; the audit log shows who changed what.']],
]

export default async function GuidePage() {
  await requireStaff()
  return (
    <div className="container-page py-12">
      <p className="eyebrow">Staff tools</p>
      <h1 className="mt-2 text-4xl">Editor guide</h1>
      <p className="mt-3 max-w-2xl text-charcoal-600">A short guide to keeping the website up to date. Editors save drafts; the administrator reviews and publishes.</p>
      <div className="mt-10 grid gap-5 md:grid-cols-2">
        {STEPS.map(([title, items]) => (
          <section key={title} className="card p-6">
            <h2 className="font-serif text-2xl">{title}</h2>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-charcoal-700">{items.map((i) => <li key={i}>{i}</li>)}</ol>
          </section>
        ))}
      </div>
    </div>
  )
}
