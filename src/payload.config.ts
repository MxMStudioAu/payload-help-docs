import { postgresAdapter } from '@payloadcms/db-postgres'
import {
  lexicalEditor,
  FixedToolbarFeature,
  InlineToolbarFeature,
  HeadingFeature,
  BoldFeature,
  ItalicFeature,
  UnderlineFeature,
  StrikethroughFeature,
  InlineCodeFeature,
  LinkFeature,
  UnorderedListFeature,
  OrderedListFeature,
  ChecklistFeature,
  BlockquoteFeature,
  HorizontalRuleFeature,
  IndentFeature,
  AlignFeature,
  UploadFeature,
} from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { HelpCategories } from './collections/HelpCategories'
import { HelpArticles } from './collections/HelpArticles'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// Neon adds channel_binding=require to connection strings which breaks the Postgres adapter
const rawDbUrl = new URL(process.env.DATABASE_URL || 'postgres://localhost')
rawDbUrl.searchParams.delete('channel_binding')
const connectionString = rawDbUrl.toString()

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    livePreview: {
      collections: ['help-articles'],
    },
  },
  collections: [Users, Media, HelpCategories, HelpArticles],
  editor: lexicalEditor({
    features: [
      FixedToolbarFeature(),
      InlineToolbarFeature(),
      HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
      BoldFeature(),
      ItalicFeature(),
      UnderlineFeature(),
      StrikethroughFeature(),
      InlineCodeFeature(),
      LinkFeature(),
      UnorderedListFeature(),
      OrderedListFeature(),
      ChecklistFeature(),
      BlockquoteFeature(),
      HorizontalRuleFeature(),
      IndentFeature(),
      AlignFeature(),
      UploadFeature(),
    ],
  }),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString,
    },
  }),
  sharp,
  plugins: [],
})
