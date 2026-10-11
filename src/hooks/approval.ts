import { APIError, type CollectionAfterChangeHook, type CollectionBeforeChangeHook, type GlobalAfterChangeHook, type GlobalBeforeChangeHook, type PayloadRequest } from 'payload'
import { hasRole } from '@/access/roles'

const PUBLISH_MESSAGE =
  'Only the administrator (approver) can publish. Use "Save draft" and tick "Ready for review"; the approver will publish it.'

/**
 * Approval workflow (FR-43, FR-50, FR-52, section 15): editors save drafts, only the
 * administrator publishes. Every draft submitted for review is recorded as a change request.
 */
export const requireApproverToPublish: CollectionBeforeChangeHook = ({ data, req }) => {
  if (data?._status === 'published' && req.user && !hasRole(req.user, 'administrator')) {
    throw new APIError(PUBLISH_MESSAGE, 403, null, true)
  }
  if (data?._status === 'published') data.readyForReview = false
  return data
}

export const requireApproverToPublishGlobal: GlobalBeforeChangeHook = ({ data, req }) => {
  if (data?._status === 'published' && req.user && !hasRole(req.user, 'administrator')) {
    throw new APIError(PUBLISH_MESSAGE, 403, null, true)
  }
  if (data?._status === 'published') data.readyForReview = false
  return data
}

export const readyForReviewField = {
  name: 'readyForReview',
  type: 'checkbox' as const,
  label: 'Ready for review',
  defaultValue: false,
  admin: {
    position: 'sidebar' as const,
    description: 'Editors: tick this when the draft is ready for the approver to publish.',
  },
}

/** Content types the administrator has marked as "major" (approval settings). */
export const MAJOR_DEFAULTS = ['home-page', 'appeal', 'services']

async function isMajor(req: PayloadRequest, entity: string): Promise<boolean> {
  try {
    const settings = await req.payload.findGlobal({ slug: 'approval-settings', req, overrideAccess: true })
    return (settings.majorChanges ?? MAJOR_DEFAULTS).includes(entity as never)
  } catch {
    return MAJOR_DEFAULTS.includes(entity)
  }
}

async function recordChange(
  req: PayloadRequest,
  entity: string,
  entityId: string,
  title: string,
  doc: { _status?: string | null; readyForReview?: boolean | null },
  kind: 'collection' | 'global',
) {
  if (entity === 'change-requests') return
  const open = await req.payload.find({
    collection: 'change-requests',
    where: { and: [{ entity: { equals: entity } }, { entityId: { equals: entityId } }, { status: { equals: 'awaiting-approval' } }] },
    limit: 1,
    req,
    overrideAccess: true,
  })
  const existing = open.docs[0]
  const userId = req.user?.collection === 'users' ? (req.user.id as number) : undefined

  if (doc._status === 'published') {
    if (existing) {
      await req.payload.update({
        collection: 'change-requests',
        id: existing.id,
        data: { status: 'approved', decidedBy: userId, decidedAt: new Date().toISOString() },
        req,
        overrideAccess: true,
        context: { skipAudit: true },
      })
    }
    return
  }
  if (!doc.readyForReview) return
  const major = await isMajor(req, entity)
  const data = { entity, entityId, title: title.slice(0, 200), kind, major, status: 'awaiting-approval' as const, proposedBy: userId, proposedAt: new Date().toISOString() }
  if (existing) await req.payload.update({ collection: 'change-requests', id: existing.id, data, req, overrideAccess: true, context: { skipAudit: true } })
  else await req.payload.create({ collection: 'change-requests', data, req, overrideAccess: true, context: { skipAudit: true } })
}

/** Keeps the change_requests table in step with drafts submitted for review and their publication. */
export const trackChangeRequest: CollectionAfterChangeHook = async ({ collection, doc, req, context }) => {
  if (context?.skipChangeRequests) return doc
  try {
    const title = String(doc.title ?? doc.name ?? doc.id)
    await recordChange(req, collection.slug, String(doc.id), title, doc, 'collection')
  } catch (err) {
    req.payload.logger.error({ err, msg: 'Failed to record change request' })
  }
  return doc
}

export const trackGlobalChangeRequest: GlobalAfterChangeHook = async ({ global, doc, req, context }) => {
  if (context?.skipChangeRequests) return doc
  try {
    await recordChange(req, global.slug, global.slug, typeof global.label === 'string' ? global.label : global.slug, doc, 'global')
  } catch (err) {
    req.payload.logger.error({ err, msg: 'Failed to record change request' })
  }
  return doc
}
