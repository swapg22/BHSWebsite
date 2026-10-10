import type { CollectionAfterChangeHook, GlobalAfterChangeHook } from 'payload'

async function safeRevalidate(paths: string[]) {
  try {
    const { revalidatePath } = await import('next/cache')
    for (const p of paths) revalidatePath(p, 'layout')
  } catch {
    // Outside a Next.js request (seed scripts, tests): nothing to revalidate
  }
}

/** Refresh cached pages when published content changes. */
export function revalidateAfterChange(basePath?: string): CollectionAfterChangeHook {
  return async ({ doc, context }) => {
    if (context?.skipRevalidate) return doc
    const paths = ['/']
    if (basePath) paths.push(basePath)
    await safeRevalidate(paths)
    return doc
  }
}

export const revalidateGlobal: GlobalAfterChangeHook = async ({ doc, context }) => {
  if (context?.skipRevalidate) return doc
  await safeRevalidate(['/'])
  return doc
}
