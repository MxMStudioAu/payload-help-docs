import type { CollectionConfig } from 'payload'

export const HelpCategories: CollectionConfig = {
  slug: 'help-categories',
  admin: {
    useAsTitle: 'title',
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
        description: 'Auto-generated from title — only change if you know what you\'re doing (client tier gating depends on these slugs)',
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
      name: 'description',
      type: 'text',
      admin: {
        description: 'Short summary shown on the category card',
      },
    },
    {
      name: 'order',
      type: 'number',
      required: true,
      defaultValue: 99,
      admin: {
        description: 'Display order — lower numbers appear first',
      },
    },
  ],
}
