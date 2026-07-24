import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Article } from '../lib/types';
import { getArticleImages } from '../lib/types';

interface ArticleGridProps {
  category?: 'architecture' | 'construction';
  limit?: number;
  showTitle?: boolean;
}

export default function ArticleGrid({ category, limit, showTitle = true }: ArticleGridProps) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let query = supabase.from('articles').select('*').eq('published', true).order('created_at', { ascending: false });
    if (category) query = query.eq('category', category);
    if (limit) query = query.limit(limit);

    query.then(({ data, error: err }) => {
      if (err) {
        setError(err.message);
      } else {
        setArticles((data || []) as Article[]);
      }
      setLoading(false);
    });
  }, [category, limit]);

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
        <p className="text-gray-400 mt-4">Chargement...</p>
      </div>
    );
  }

  if (error) {
    return <div className="text-center py-20 text-red-400">{error}</div>;
  }

  if (articles.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400 text-lg">Aucun projet publié pour le moment.</p>
      </div>
    );
  }

  return (
    <>
      {showTitle && category && (
        <h2 className="text-4xl font-bold text-white mb-8 mt-8">
          {category.charAt(0).toUpperCase() + category.slice(1)}
        </h2>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article) => {
          const imgs = getArticleImages(article);
          return (
            <a
              key={article.id}
              href={`/article?id=${article.id}`}
              className="group block rounded-2xl overflow-hidden bg-gray-800 border border-gray-700 hover:border-blue-500 transition-all duration-300"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-gray-700">
                {imgs[0] && (
                  <img src={imgs[0]} alt={article.title} className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105" />
                )}
                {imgs.length > 1 && (
                  <div className="absolute top-3 right-3 bg-black/70 text-white text-xs font-medium px-2.5 py-1 rounded-full">
                    {imgs.length} photos
                  </div>
                )}
                <div className="absolute top-3 left-3">
                  <span className="inline-block bg-blue-600 text-white text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full">
                    {article.category}
                  </span>
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors">
                  {article.title}
                </h3>
                {article.description && <p className="text-gray-400 text-sm">{article.description}</p>}
              </div>
            </a>
          );
        })}
      </div>
    </>
  );
}
