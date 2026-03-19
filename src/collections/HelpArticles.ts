import type { CollectionConfig } from 'payload'

export const HelpArticles: CollectionConfig = {
  slug: 'help-articles',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'order'],
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
      name: 'order',
      type: 'number',
      required: true,
      defaultValue: 99,
      admin: {
        description: 'Display order within the category — lower numbers appear first',
      },
    },
    {
      name: 'body',
      type: 'richText',
    },
  ],
}
