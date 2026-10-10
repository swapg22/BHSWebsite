import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, CollectionConfig, GlobalAfterChangeHook } from 'payload'

/** Audit log (FR-45): every change is recorded with who made it. */

function actor(req: Parameters<CollectionAfterChangeHook>[0]['req']) {
  const u = req.user as { id?: number | string; email?: string; collection?: string } | null
  return {
    actorEmail: u?.email ?? 'system',
    actorType: (u?.collection === 'users' ? 'staff' : u?.collection === 'members' ? 'member' : 'system') as 'staff' | 'member' | 'system',
  }
}

export const auditAfterChange: CollectionAfterChangeHook = async ({ collection, doc, operation, previousDoc, req, context }) => {
  if (context?.skipAudit || collection.slug === 'audit-log') return doc
  const status = (doc as { _status?: string })._status
  const prevStatus = (previousDoc as { _status?: string } | undefined)?._status
  let action: string = operation
  if (status === 'published' && prevStatus !== 'published') action = 'publish'
  else if ((doc as { deletedAt?: string }).deletedAt && !(previousDoc as { deletedAt?: string })?.deletedAt) action = 'trash'
  try {
    await req.payload.create({
      collection: 'audit-log',
      data: {
        ...actor(req),
        action,
        entity: collection.slug,
        entityId: String(doc.id),
        summary: summarise(doc),
      },
      req,
      overrideAccess: true,
      context: { skipAudit: true },
    })
  } catch (err) {
    req.payload.logger.error({ err, msg: 'Failed to write audit log' })
  }
  return doc
}

export const auditAfterDelete: CollectionAfterDeleteHook = async ({ collection, doc, req }) => {
  try {
    await req.payload.create({
      collection: 'audit-log',
      data: { ...actor(req), action: 'delete', entity: collection.slug, entityId: String(doc.id), summary: summarise(doc) },
      req,
      overrideAccess: true,
      context: { skipAudit: true },
    })
  } catch (err) {
    req.payload.logger.error({ err, msg: 'Failed to write audit log' })
  }
  return doc
}

export const auditGlobalAfterChange: GlobalAfterChangeHook = async ({ global, doc, req }) => {
  try {
    await req.payload.create({
      collection: 'audit-log',
      data: { ...actor(req), action: 'update', entity: `global:${global.slug}`, entityId: global.slug, summary: global.slug },
      req,
      overrideAccess: true,
      context: { skipAudit: true },
    })
  } catch (err) {
    req.payload.logger.error({ err, msg: 'Failed to write audit log' })
  }
  return doc
}

function summarise(doc: Record<string, unknown>): string {
  const label = doc.title ?? doc.name ?? doc.reference ?? doc.email ?? doc.filename ?? doc.id
  return String(label ?? '').slice(0, 200)
}

/** Adds audit hooks to a collection without replacing hooks it already has. */
export function withAudit(config: CollectionConfig): CollectionConfig {
  return {
    ...config,
    hooks: {
      ...config.hooks,
      afterChange: [...(config.hooks?.afterChange ?? []), auditAfterChange],
      afterDelete: [...(config.hooks?.afterDelete ?? []), auditAfterDelete],
    },
  }
}
