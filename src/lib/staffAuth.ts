import { redirect } from 'next/navigation'
import type { User } from '@/payload-types'
import { getCurrentStaff } from '@/lib/data'
import { hasRole, isStaff, type StaffRole } from '@/access/roles'

/** Server-side guard for /staff pages and exports: signed-in staff with one of the roles. */
export async function requireStaff(...roles: StaffRole[]): Promise<User> {
  const user = (await getCurrentStaff()) as (User & { collection: 'users' }) | null
  if (!user) redirect('/staff/login')
  if (!isStaff(user)) redirect('/staff/2fa')
  if (roles.length && !hasRole(user, ...roles)) redirect('/admin')
  return user
}
