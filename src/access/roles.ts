import type { Access, FieldAccess, PayloadRequest } from 'payload'

/**
 * Staff roles (spec section 8, FR-41):
 *  - administrator: the approver; publishes content and manages users
 *  - editor: creates and edits content as drafts, cannot publish
 *  - treasurer: donations, Gift Aid, payments, refunds, service catalogue
 *  - membership-officer: member records and bookings
 */
export type StaffRole = 'administrator' | 'editor' | 'treasurer' | 'membership-officer'

export const STAFF_ROLES: { label: string; value: StaffRole }[] = [
  { label: 'Administrator (approver)', value: 'administrator' },
  { label: 'Editor', value: 'editor' },
  { label: 'Treasurer', value: 'treasurer' },
  { label: 'Membership officer', value: 'membership-officer' },
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
export const membershipTeam: Access = ({ req }) =>
  hasRole(req.user, 'administrator', 'membership-officer', 'treasurer')

/** Published content is public; staff can also see drafts. */
export const publishedOrStaff: Access = ({ req }) => {
  if (isStaff(req.user)) return true
  return { _status: { equals: 'published' } }
}

export const staffFieldOnly: FieldAccess = ({ req }) => isStaff(req.user)
export const adminFieldOnly: FieldAccess = ({ req }) => hasRole(req.user, 'administrator')
export const financeFieldOnly: FieldAccess = ({ req }) => hasRole(req.user, 'administrator', 'treasurer')
