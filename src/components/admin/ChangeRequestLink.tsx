'use client'

import { useFormFields } from '@payloadcms/ui'

/** Link from a change request to the draft it refers to. */
export function ChangeRequestLink() {
  const entity = useFormFields(([fields]) => fields.entity?.value as string | undefined)
  const entityId = useFormFields(([fields]) => fields.entityId?.value as string | undefined)
  const kind = useFormFields(([fields]) => fields.kind?.value as string | undefined)
  if (!entity) return null
  const href = kind === 'global' ? `/admin/globals/${entity}` : `/admin/collections/${entity}/${entityId}`
  return (
    <p style={{ margin: '8px 0 24px' }}>
      <a href={href} style={{ fontWeight: 600, textDecoration: 'underline' }}>
        Open the draft to review and publish →
      </a>
    </p>
  )
}
