/**
 * migrate-from-sanity.mjs
 *
 * One-time migration script: reads all categories and articles from Sanity,
 * converts article body content from Portable Text to Lexical format,
 * and creates everything in the live Payload CMS via its REST API.
 *
 * Run from the payload-help-docs project root:
 *   node scripts/migrate-from-sanity.mjs
 *
 * Requires Node 18+ (uses built-in fetch).
 */

// ── Config ─────────────────────────────────────────────────────────────────────

const SANITY_PROJECT_ID = 'pmqulxnm'
const SANITY_DATASET = 'production'
const SANITY_TOKEN =
  'skp9RbiFoXUlGEgvvDtwf1GAT5FvlP9Ijwt2H78gBfmwa5OLsCmvjqw9ZpYG3qS7pEFKK5Di2TtUafiBxT84qXgWiWw8EJEofCr0oLAqaXvQurS4IT80C7tZhmda8YNvyeokLGDFb2jPOGFkiC3qvEUZvHepcdxZbyjATUhRckfQQ6NUmNee'

const PAYLOAD_URL = 'https://payload-help-docs.vercel.app'
const PAYLOAD_EMAIL = 'mish.ryan@outlook.com'
const PAYLOAD_PASSWORD = 'ZAQ1rivcotzo'

// ── Sanity helpers ─────────────────────────────────────────────────────────────

async function sanityQuery(groq) {
  const url = `https://${SANITY_PROJECT_ID}.api.sanity.io/v2024-01-01/data/query/${SANITY_DATASET}?query=${encodeURIComponent(groq)}`
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${SANITY_TOKEN}` },
  })
  if (!res.ok) {
    throw new Error(`Sanity query failed: ${res.status} ${await res.text()}`)
  }
  const json = await res.json()
  return json.result
}

// ── Portable Text → Lexical converter ─────────────────────────────────────────
//
// Sanity uses "Portable Text" (an array of block objects).
// Payload uses "Lexical" (a tree of nodes with a root).
// This converter handles: paragraphs, h2, h3, h4, blockquote,
// bold, italic, inline code, links, bullet lists, numbered lists.

const FORMAT_BOLD = 1
const FORMAT_ITALIC = 2
const FORMAT_CODE = 16

/**
 * Given an array of mark keys (e.g. ["strong", "abc123"]) and the block's
 * markDefs array, returns the combined text format bitmask and any link def found.
 */
function resolveMarks(marks, markDefs) {
  let format = 0
  let linkDef = null
  for (const mark of marks) {
    if (mark === 'strong') format |= FORMAT_BOLD
    else if (mark === 'em') format |= FORMAT_ITALIC
    else if (mark === 'code') format |= FORMAT_CODE
    else {
      // It's a key referencing a markDef (e.g. a link annotation)
      const def = markDefs?.find((d) => d._key === mark)
      if (def?._type === 'link') linkDef = def
    }
  }
  return { format, linkDef }
}

function makeTextNode(text, format = 0) {
  return {
    type: 'text',
    format,
    style: '',
    mode: 'normal',
    detail: 0,
    text,
    version: 1,
  }
}

function makeLinkNode(children, url) {
  return {
    type: 'link',
    version: 1,
    format: '',
    indent: 0,
    direction: 'ltr',
    children,
    fields: {
      linkType: 'custom',
      url,
      newTab: false,
    },
  }
}

/**
 * Converts an array of Portable Text span objects into Lexical inline nodes
 * (text nodes and link wrapper nodes).
 */
function convertSpans(spans, markDefs) {
  const nodes = []
  for (const span of spans) {
    if (span._type !== 'span') continue
    const { format, linkDef } = resolveMarks(span.marks || [], markDefs)
    const textNode = makeTextNode(span.text, format)
    if (linkDef) {
      nodes.push(makeLinkNode([textNode], linkDef.href))
    } else {
      nodes.push(textNode)
    }
  }
  return nodes
}

/**
 * Converts a single non-list Portable Text block into a Lexical block node.
 */
function convertBlock(block) {
  const children = convertSpans(block.children || [], block.markDefs || [])
  const style = block.style || 'normal'

  if (style === 'h2' || style === 'h3' || style === 'h4') {
    return {
      type: 'heading',
      tag: style,
      format: '',
      indent: 0,
      version: 1,
      direction: 'ltr',
      children,
    }
  }

  // 'normal' and 'blockquote' both become paragraphs
  // (Payload's base Lexical config doesn't include a blockquote node by default)
  return {
    type: 'paragraph',
    format: '',
    indent: 0,
    version: 1,
    direction: 'ltr',
    textFormat: 0,
    textStyle: '',
    children,
  }
}

/**
 * Converts a full Portable Text array into a Payload Lexical JSON object.
 * Returns null if blocks is empty or missing (body will be left unset).
 */
function portableTextToLexical(blocks) {
  if (!blocks || !Array.isArray(blocks) || blocks.length === 0) {
    return null
  }

  const lexicalChildren = []
  let i = 0

  while (i < blocks.length) {
    const block = blocks[i]

    // Skip non-block types (images, custom types, etc.)
    if (block._type !== 'block') {
      i++
      continue
    }

    if (block.listItem) {
      // Collect all consecutive list items of the same type into one list node
      const listType = block.listItem // 'bullet' or 'number'
      const listItems = []
      while (i < blocks.length && blocks[i].listItem === listType) {
        listItems.push(blocks[i])
        i++
      }

      lexicalChildren.push({
        type: 'list',
        listType: listType === 'number' ? 'number' : 'bullet',
        tag: listType === 'number' ? 'ol' : 'ul',
        format: '',
        indent: 0,
        version: 1,
        start: 1,
        direction: 'ltr',
        children: listItems.map((item, idx) => ({
          type: 'listitem',
          value: idx + 1,
          format: '',
          indent: 0,
          version: 1,
          direction: 'ltr',
          children: convertSpans(item.children || [], item.markDefs || []),
        })),
      })
    } else {
      lexicalChildren.push(convertBlock(block))
      i++
    }
  }

  return {
    root: {
      type: 'root',
      format: '',
      indent: 0,
      version: 1,
      direction: 'ltr',
      children: lexicalChildren,
    },
  }
}

// ── Payload helpers ────────────────────────────────────────────────────────────

async function payloadGetAll(collection, token) {
  const res = await fetch(`${PAYLOAD_URL}/api/${collection}?limit=100&depth=0`, {
    headers: { Authorization: `JWT ${token}` },
  })
  if (!res.ok) throw new Error(`Failed to fetch ${collection}: ${res.status}`)
  const json = await res.json()
  return json.docs ?? []
}

async function payloadDelete(collection, id, token) {
  const res = await fetch(`${PAYLOAD_URL}/api/${collection}/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `JWT ${token}` },
  })
  if (!res.ok) throw new Error(`Failed to delete ${id} from ${collection}: ${res.status}`)
}

async function cleanupExistingData(token) {
  console.log('🧹 Cleaning up any existing data in Payload...')

  const articles = await payloadGetAll('help-articles', token)
  if (articles.length > 0) {
    console.log(`   Deleting ${articles.length} existing article(s)...`)
    for (const doc of articles) {
      await payloadDelete('help-articles', doc.id, token)
    }
    console.log(`   ✅ Articles cleared`)
  } else {
    console.log(`   No existing articles found`)
  }

  const categories = await payloadGetAll('help-categories', token)
  if (categories.length > 0) {
    console.log(`   Deleting ${categories.length} existing category/categories...`)
    for (const doc of categories) {
      await payloadDelete('help-categories', doc.id, token)
    }
    console.log(`   ✅ Categories cleared`)
  } else {
    console.log(`   No existing categories found`)
  }

  console.log()
}

async function payloadLogin() {
  const res = await fetch(`${PAYLOAD_URL}/api/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: PAYLOAD_EMAIL, password: PAYLOAD_PASSWORD }),
  })
  if (!res.ok) {
    throw new Error(`Payload login failed: ${res.status} ${await res.text()}`)
  }
  const json = await res.json()
  return json.token
}

async function payloadCreate(collection, data, token) {
  const res = await fetch(`${PAYLOAD_URL}/api/${collection}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `JWT ${token}`,
    },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Failed to create in ${collection}: ${res.status} ${body}`)
  }
  const json = await res.json()
  return json.doc
}

// ── Main migration ─────────────────────────────────────────────────────────────

async function migrate() {
  console.log('🔐 Logging in to Payload...')
  const token = await payloadLogin()
  console.log('✅ Logged in\n')

  await cleanupExistingData(token)

  console.log('📦 Fetching categories from Sanity...')
  const categories = await sanityQuery(
    `*[_type == "helpCategory"] | order(order asc) { _id, title, "slug": slug.current, description, order }`,
  )
  console.log(`   Found ${categories.length} categories\n`)

  let totalArticles = 0
  const usedSlugs = new Set() // track slugs used this run to catch duplicates

  for (const cat of categories) {
    console.log(`📁 Creating category: "${cat.title}"`)

    const createdCat = await payloadCreate(
      'help-categories',
      {
        title: cat.title,
        slug: cat.slug,
        description: cat.description ?? null,
        order: cat.order ?? 99,
      },
      token,
    )

    console.log(`   ✅ Category created (Payload ID: ${createdCat.id})`)

    // Fetch all articles belonging to this category
    const articles = await sanityQuery(
      `*[_type == "helpArticle" && references("${cat._id}")] | order(order asc) { _id, title, "slug": slug.current, excerpt, order, body }`,
    )

    console.log(`   📄 Found ${articles.length} articles`)

    for (const article of articles) {
      const body = portableTextToLexical(article.body)

      // Deduplicate slugs — if this slug was already used, append -2, -3, etc.
      let slug = article.slug
      if (usedSlugs.has(slug)) {
        let counter = 2
        while (usedSlugs.has(`${slug}-${counter}`)) counter++
        const newSlug = `${slug}-${counter}`
        console.log(`      ⚠️  Duplicate slug "${slug}" — using "${newSlug}" instead`)
        slug = newSlug
      }
      usedSlugs.add(slug)

      await payloadCreate(
        'help-articles',
        {
          title: article.title,
          slug,
          excerpt: article.excerpt ?? null,
          category: createdCat.id,
          order: article.order ?? 99,
          ...(body ? { body } : {}),
        },
        token,
      )

      console.log(`      ✅ "${article.title}"`)
      totalArticles++
    }

    console.log()
  }

  console.log(`🎉 Migration complete! Created ${categories.length} categories and ${totalArticles} articles.`)
}

migrate().catch((err) => {
  console.error('\n❌ Migration failed:', err.message)
  process.exit(1)
})
