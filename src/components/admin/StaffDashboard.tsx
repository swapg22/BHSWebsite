import React from 'react'
import { getPayload } from 'payload'
import config from '@payload-config'
import { headers } from 'next/headers'
import { hasRole } from '@/access/roles'
import { getDashboardStats } from '@/lib/reports'
import { formatGBP } from '@/lib/money'

/** Shown at the top of the CMS dashboard: key numbers, items waiting for action, and staff tools (FR-46). */
export async function StaffDashboard() {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await headers() })
  if (!user) return null
  const stats = await getDashboardStats(payload)
  const isAdmin = hasRole(user, 'administrator')
  const isFinance = hasRole(user, 'administrator', 'treasurer')
  const isMembership = hasRole(user, 'administrator', 'membership-officer', 'treasurer')

  const card: React.CSSProperties = { background: 'var(--theme-elevation-50)', borderRadius: 12, padding: '16px 18px', border: '1px solid var(--theme-elevation-150)' }
  const label: React.CSSProperties = { fontSize: 13, opacity: 0.75, marginBottom: 4 }
  const value: React.CSSProperties = { fontSize: 26, fontWeight: 600 }
  const link: React.CSSProperties = { display: 'inline-block', padding: '8px 14px', borderRadius: 999, border: '1px solid var(--theme-elevation-250)', textDecoration: 'none', marginRight: 8, marginBottom: 8 }

  return (
    <div style={{ marginBottom: 32 }}>
      <h2 style={{ marginBottom: 4 }}>Namaste{(user as { name?: string }).name ? `, ${String((user as { name?: string }).name).split(' ')[0]}` : ''}</h2>
      <p style={{ opacity: 0.75, marginTop: 0 }}>Here is what needs attention today.</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, margin: '16px 0 20px' }}>
        <div style={card}><div style={label}>New Mandir appeal</div><div style={value}>{formatGBP(stats.appealRaised)}</div><div style={label}>of {formatGBP(stats.appealTarget)}</div></div>
        {isFinance && <div style={card}><div style={label}>Gifts this month</div><div style={value}>{formatGBP(stats.giftsThisMonth)}</div><div style={label}>{stats.giftsThisMonthCount} gifts · {stats.giftAidEligibleCount} Gift Aid eligible</div></div>}
        {isMembership && <div style={card}><div style={label}>Active members</div><div style={value}>{stats.activeMembers}</div><div style={label}>{stats.dueSoon} due for renewal in 30 days</div></div>}
        {isMembership && <div style={card}><div style={label}>Bookings awaiting approval</div><div style={value}>{stats.pendingBookings}</div><div style={label}>{stats.upcomingBookings} confirmed in next 30 days</div></div>}
        {isAdmin && <div style={card}><div style={label}>Drafts ready for review</div><div style={value}>{stats.readyForReview}</div><div style={label}>events, news, pages, albums</div></div>}
      </div>
      <div>
        {isAdmin && <a style={link} href="/admin/collections/events?where[readyForReview][equals]=true">Review drafts</a>}
        {isMembership && <a style={link} href="/admin/collections/bookings?where[status][equals]=pending-approval">Approve bookings</a>}
        {isFinance && <a style={link} href="/staff/reports">Reports & HMRC Gift Aid export</a>}
        {isMembership && <a style={link} href="/staff/import">Import member list</a>}
        {isMembership && <a style={link} href="/staff/registers">Class registers</a>}
        <a style={link} href="/staff/2fa">Two-factor sign-in</a>
        <a style={link} href="/staff/guide">Editor guide</a>
        <a style={link} href="/" target="_blank" rel="noreferrer">View website</a>
      </div>
    </div>
  )
}
