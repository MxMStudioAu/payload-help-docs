export const dynamic = 'force-dynamic'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { notFound } from 'next/navigation'
import RefreshOnSave from './RefreshOnSave'

type Props = {
  params: Promise<{ slug: string }>
}

export default async function ArticlePreview({ params }: Props) {
  const { slug } = await params

  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'help-articles',
    where: { slug: { equals: slug } },
    limit: 1,
    overrideAccess: true,
  })

  const article = result.docs[0]

  if (!article) return notFound()

  return (
    <>
    <RefreshOnSave />
    <div style={{
      maxWidth: '720px',
      margin: '0 auto',
      padding: '2rem',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      color: '#1a1a1a',
      lineHeight: '1.7',
      backgroundColor: '#ffffff',
      minHeight: '100vh',
    }}>
      <div style={{
        fontSize: '0.75rem',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        color: '#888',
        marginBottom: '0.5rem',
      }}>
        Preview
      </div>

      <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>
        {article.title}
      </h1>

      {article.excerpt && (
        <p style={{ fontSize: '1rem', color: '#555', marginBottom: '2rem', borderBottom: '1px solid #eee', paddingBottom: '1.5rem' }}>
          {article.excerpt}
        </p>
      )}

      <div style={{ fontSize: '1rem' }}>
        {article.body && <RichText data={article.body} />}
      </div>
    </div>
    </>
  )
}
