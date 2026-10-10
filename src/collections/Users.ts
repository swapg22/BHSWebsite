import { APIError, type CollectionConfig } from 'payload'
import { verifySync } from 'otplib'
import { adminFieldOnly, adminOnly, hasRole, isStaff, STAFF_ROLES } from '@/access/roles'
import { auditAfterChange } from '@/hooks/audit'
import { sendTemplate } from '@/lib/email'

/**
 * Staff accounts for the CMS (FR-41, FR-42). Members use the separate `members` collection.
 * Two-factor sign-in (TOTP) is required for administrators; anyone with 2FA enabled must
 * sign in through /staff/login, which sends the 6-digit code with the password.
 */
export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'Staff user', plural: 'Staff users' },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['name', 'email', 'roles', 'twoFactorEnabled', 'suspended', 'lastLoginAt'],
    group: 'Admin',
    description: 'People who can sign in to the CMS. Invite by creating a user: they receive an email to set their password.',
  },
  auth: {
    tokenExpiration: 60 * 60 * 8, // 8 hours
    maxLoginAttempts: 5,
    lockTime: 15 * 60 * 1000,
    cookies: { sameSite: 'Lax', secure: process.env.NODE_ENV === 'production' },
    forgotPassword: {
      generateEmailSubject: () => 'Reset your Bharat Hindu Samaj CMS password',
      generateEmailHTML: (args) => {
        const url = `${process.env.NEXT_PUBLIC_SITE_URL}/admin/reset/${args?.token}`
        return `<p>Someone asked to reset the password for your Bharat Hindu Samaj CMS account.</p><p><a href="${url}">Choose a new password</a></p><p>If this wasn't you, you can ignore this email.</p>`
      },
    },
  },
  access: {
    admin: ({ req }) => isStaff(req.user),
    read: ({ req }) => {
      if (hasRole(req.user, 'administrator')) return true
      if (isStaff(req.user)) return { id: { equals: req.user!.id } }
      return false
    },
    create: adminOnly,
    update: ({ req }) => {
      if (hasRole(req.user, 'administrator')) return true
      if (isStaff(req.user)) return { id: { equals: req.user!.id } }
      return false
    },
    delete: adminOnly,
    unlock: adminOnly,
  },
  hooks: {
    beforeLogin: [
      ({ req, user }) => {
        if (user.suspended) throw new APIError('This account is suspended. Contact the administrator.', 403, null, true)
        if (user.twoFactorEnabled) {
          const code = String((req.data as { totp?: string } | undefined)?.totp ?? '').replace(/\s/g, '')
          if (!/^\d{6}$/.test(code)) {
            throw new APIError('Two-factor code required. Sign in at /staff/login.', 401, null, true)
          }
          const result = verifySync({ secret: user.twoFactorSecret, token: code, epochTolerance: 30 })
          if (!result.valid) throw new APIError('That two-factor code is not valid. Try the latest code.', 401, null, true)
        }
        return user
      },
    ],
    afterLogin: [
      async ({ req, user }) => {
        await req.payload.update({
          collection: 'users',
          id: user.id,
          data: { lastLoginAt: new Date().toISOString() },
          overrideAccess: true,
          context: { skipAudit: true },
          req,
        })
        return user
      },
    ],
    afterChange: [
      async ({ doc, operation, req, context }) => {
        // Invitation: new staff get a "set your password" email (FR-42)
        if (operation === 'create' && !context?.skipInvite) {
          try {
            const token = await req.payload.forgotPassword({
              collection: 'users',
              data: { email: doc.email },
              disableEmail: true,
              req,
            })
            await sendTemplate(req.payload, {
              to: doc.email,
              template: 'staff-invite',
              data: {
                name: doc.name,
                roles: (doc.roles ?? []).join(', '),
                url: `${process.env.NEXT_PUBLIC_SITE_URL}/admin/reset/${token}`,
              },
            })
          } catch (err) {
            req.payload.logger.error({ err, msg: 'Failed to send staff invitation' })
          }
        }
        return doc
      },
      auditAfterChange,
    ],
    beforeChange: [
      ({ data, originalDoc, req }) => {
        // Never let someone remove the last administrator role from themselves by accident
        if (originalDoc && req.user && String(originalDoc.id) === String(req.user.id)) {
          const wasAdmin = (originalDoc.roles ?? []).includes('administrator')
          const isAdmin = (data.roles ?? originalDoc.roles ?? []).includes('administrator')
          if (wasAdmin && !isAdmin) throw new APIError('You cannot remove your own administrator role.', 400, null, true)
          if (data.suspended) throw new APIError('You cannot suspend your own account.', 400, null, true)
        }
        return data
      },
    ],
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    {
      name: 'roles',
      type: 'select',
      hasMany: true,
      required: true,
      defaultValue: ['editor'],
      options: STAFF_ROLES,
      saveToJWT: true,
      access: { update: adminFieldOnly, create: adminFieldOnly },
      admin: { description: 'Administrator = approver. Editors draft content but cannot publish.' },
    },
    {
      name: 'suspended',
      type: 'checkbox',
      defaultValue: false,
      access: { update: adminFieldOnly, create: adminFieldOnly },
      admin: { position: 'sidebar', description: 'Suspended users cannot sign in.' },
    },
    {
      name: 'twoFactorEnabled',
      type: 'checkbox',
      defaultValue: false,
      label: 'Two-factor sign-in enabled',
      access: { create: () => false, update: adminFieldOnly },
      admin: {
        position: 'sidebar',
        description: 'Required for administrators. Set up at /staff/2fa. An administrator can untick this to reset a lost device.',
      },
    },
    { name: 'twoFactorSecret', type: 'text', hidden: true },
    { name: 'twoFactorPendingSecret', type: 'text', hidden: true },
    {
      name: 'lastLoginAt',
      type: 'date',
      admin: { readOnly: true, position: 'sidebar', date: { pickerAppearance: 'dayAndTime' } },
    },
  ],
}
