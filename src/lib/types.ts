export interface Article {
  id: string;
  title: string;
  description: string;
  content: string;
  image_url: string | null;
  images: string[] | null;
  category: 'architecture' | 'construction';
  published: boolean;
  created_at: string;
  updated_at: string;
}

export function getArticleImages(article: Pick<Article, 'image_url' | 'images'>): string[] {
  if (article.images && Array.isArray(article.images) && article.images.length > 0) {
    return article.images.slice(0, 4);
  }
  if (article.image_url) {
    return [article.image_url];
  }
  return [];
}
