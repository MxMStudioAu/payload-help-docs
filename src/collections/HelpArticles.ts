import type { CollectionConfig } from 'payload'

export const HelpArticles: CollectionConfig = {
  slug: 'help-articles',
  orderable: true,
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category'],
    livePreview: {
      url: ({ data }) =>
        `${process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'}/preview/articles/${data?.slug}`,
    },
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'Auto-generated from title',
      },
      hooks: {
        beforeValidate: [
          ({ value, data }) => {
            if (!value && data?.title) {
              return data.title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '')
            }
            return value
          },
        ],
      },
    },
    {
      name: 'excerpt',
      type: 'text',
      maxLength: 200,
      admin: {
        description: 'One-liner shown on the article listing card (max 200 characters)',
      },
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'help-categories',
      required: true,
      admin: {
        description: 'The category this article belongs to',
      },
    },
    {
      name: 'helpRefs',
      type: 'array',
      admin: {
        description:
          'Tooltip reference keys — used to link this article to "?" icons in the client admin. Use a section.field pattern, e.g. gallery.sortOrder, media.photoEditor',
      },
      fields: [
        {
          name: 'ref',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'body',
      type: 'richText',
    },
  ],
}
