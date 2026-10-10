import type { CollectionConfig } from 'payload'
import { contentEditors, anyone, hasRole } from '@/access/roles'
import { withAudit } from '@/hooks/audit'

/** Photos and documents (FR-07, FR-44, FR-50). Images are resized automatically on upload. */
export const Media: CollectionConfig = withAudit({
  slug: 'media',
  admin: { group: 'Content', defaultColumns: ['filename', 'alt', 'credit', 'updatedAt'] },
  access: {
    read: anyone,
    create: contentEditors,
    update: contentEditors,
    delete: ({ req }) => hasRole(req.user, 'administrator'),
  },
  trash: true,
  upload: {
    staticDir: 'media',
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'application/pdf'],
    imageSizes: [
      { name: 'thumb', width: 480, height: 360, position: 'centre' },
      { name: 'card', width: 960 },
      { name: 'hero', width: 2000 },
    ],
    adminThumbnail: 'thumb',
    focalPoint: true,
    resizeOptions: { width: 2400, withoutEnlargement: true },
    formatOptions: { format: 'webp', options: { quality: 82 } },
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      label: 'Alt text',
      admin: { description: 'Describe the image for people using screen readers. Required for accessibility.' },
    },
    { name: 'caption', type: 'text' },
    { name: 'credit', type: 'text', admin: { description: 'Photographer or source.' } },
    {
      name: 'isConceptVisual',
      type: 'checkbox',
      label: "Artist's impression",
      admin: { description: 'Concept visuals of the new Mandir are always labelled "artist\'s impression, not final design".' },
    },
    {
      name: 'deityImage',
      type: 'checkbox',
      label: 'Contains deity image',
      admin: { description: 'Deity images need approval from the priests and committee, and are never placed behind text.' },
    },
  ],
})
