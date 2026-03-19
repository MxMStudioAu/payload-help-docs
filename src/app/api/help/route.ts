import configPromise from '@payload-config'
import { getPayload } from 'payload'

export const GET = async () => {
  const payload = await getPayload({ config: configPromise })

  // Fetch all categories sorted by order
  const categoriesResult = await payload.find({
    collection: 'help-categories',
    sort: 'order',
    limit: 100,
    overrideAccess: true,
  })

  // For each category, fetch its articles sorted by order
  const categoriesWithArticles = await Promise.all(
    categoriesResult.docs.map(async (category) => {
      const articlesResult = await payload.find({
        collection: 'help-articles',
        where: {
          category: {
            equals: category.id,
          },
        },
        sort: 'order',
        limit: 100,
        overrideAccess: true,
      })

      return {
        id: category.id,
        title: category.title,
        slug: category.slug,
        description: category.description,
        order: category.order,
        articles: articlesResult.docs.map((article) => ({
          id: article.id,
          title: article.title,
          slug: article.slug,
          excerpt: article.excerpt,
          order: article.order,
          body: article.body,
        })),
      }
    }),
  )

  return Response.json(categoriesWithArticles)
}
