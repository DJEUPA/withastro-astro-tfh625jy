import type { APIRoute } from 'astro';
import { db, Article, eq } from 'astro:db';

export const GET: APIRoute = async ({ cookies }) => {
  // Check authentication
  const token = cookies.get('admin_token')?.value;
  if (!token) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    // Get article counts
    const architectureArticles = await db.select().from(Article)
      .where(eq(Article.category, 'architecture'));
    
    const constructionArticles = await db.select().from(Article)
      .where(eq(Article.category, 'construction'));
    
    const totalArticles = await db.select().from(Article);

    return new Response(JSON.stringify({
      architecture: architectureArticles.length,
      construction: constructionArticles.length,
      total: totalArticles.length
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};