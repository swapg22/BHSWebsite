import type { Access, FieldAccess, PayloadRequest } from 'payload'

/**
 * Profiles (spec section 15, FR-51/52). Visitors and members are not staff; members use the
 * `members` collection. Staff hold exactly one role:
 *  - administrator: approves and publishes every change, manages members, editors and bookings
 *  - editor: creates and edits content, timings, services and prices as drafts; cannot publish
 *    and never sees members' personal details
 *  - treasurer: the limited finance view (donations, Gift Aid, payments) and co-approves bookings
 *    (section 15 leaves this "to confirm" with the trustees)
 */
export type StaffRole = 'administrator' | 'editor' | 'treasurer'

export const STAFF_ROLES: { label: string; value: StaffRole }[] = [
  { label: 'Administrator (approver)', value: 'administrator' },
  { label: 'Editor', value: 'editor' },
  { label: 'Treasurer (finance view)', value: 'treasurer' },
]

type AnyUser = PayloadRequest['user']

/**
 * A signed-in, non-suspended staff user. Administrators only count as staff once they have
 * two-factor sign-in enabled (NFR-03); until then they can only reach /staff/2fa to set it up.
 */
export function isStaff(user: AnyUser): boolean {
  if (!user || user.collection !== 'users') return false
  const u = user as { suspended?: boolean; roles?: StaffRole[]; twoFactorEnabled?: boolean }
  if (u.suspended) return false
  if ((u.roles ?? []).includes('administrator') && !u.twoFactorEnabled) return false
  return true
}

/** Signed-in staff user regardless of 2FA status (used only by the 2FA setup flow). */
export function isStaffAccount(user: AnyUser): boolean {
  return Boolean(user && user.collection === 'users' && !(user as { suspended?: boolean }).suspended)
}

export function hasRole(user: AnyUser, ...roles: StaffRole[]): boolean {
  if (!isStaff(user)) return false
  const userRoles = ((user as { roles?: StaffRole[] }).roles ?? []) as StaffRole[]
  return roles.some((r) => userRoles.includes(r))
}

export function isMember(user: AnyUser): boolean {
  return Boolean(user && user.collection === 'members')
}

export const anyone: Access = () => true
export const staffOnly: Access = ({ req }) => isStaff(req.user)
export const adminOnly: Access = ({ req }) => hasRole(req.user, 'administrator')
export const contentEditors: Access = ({ req }) => hasRole(req.user, 'administrator', 'editor')
export const finance: Access = ({ req }) => hasRole(req.user, 'administrator', 'treasurer')
/** Booking requests are approved by the administrator, with the treasurer (section 15). */
export const bookingApprovers: Access = ({ req }) => hasRole(req.user, 'administrator', 'treasurer')

/** Published content is public; staff can also see drafts. */
export const publishedOrStaff: Access = ({ req }) => {
  if (isStaff(req.user)) return true
  return { _status: { equals: 'published' } }
}

export const staffFieldOnly: FieldAccess = ({ req }) => isStaff(req.user)
export const adminFieldOnly: FieldAccess = ({ req }) => hasRole(req.user, 'administrator')
export const financeFieldOnly: FieldAccess = ({ req }) => hasRole(req.user, 'administrator', 'treasurer')
