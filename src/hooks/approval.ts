import { APIError, type CollectionBeforeChangeHook, type GlobalBeforeChangeHook } from 'payload'
import { hasRole } from '@/access/roles'

const PUBLISH_MESSAGE =
  'Only the administrator (approver) can publish. Use "Save draft" and tick "Ready for review"; the approver will publish it.'

/**
 * Approval workflow (FR-43, FR-50): editors save drafts, only the administrator publishes.
 * Staff with other roles cannot publish content either.
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
