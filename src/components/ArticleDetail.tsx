import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { getArticleImages } from '../lib/types';
import type { Article } from '../lib/types';

export default function ArticleDetail() {
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (!id) {
      setError('Article introuvable');
      setLoading(false);
      return;
    }

    supabase.from('articles').select('*').eq('id', id).maybeSingle().then(({ data, error: err }) => {
      if (err) {
        setError(err.message);
      } else if (!data) {
        setError('Article introuvable');
      } else {
        setArticle(data as Article);
      }
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400 text-xl mb-8">{error || 'Article introuvable'}</p>
        <a href="/" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors">
          Retour à l'accueil
        </a>
      </div>
    );
  }

  const images = getArticleImages(article);

  return (
    <article>
      <a href={`/${article.category}`} className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-6 mt-8 text-sm">
        <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Retour
      </a>

      <div className="mb-6">
        <span className="inline-block bg-blue-600 text-white text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full">
          {article.category}
        </span>
      </div>

      <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{article.title}</h1>

      {article.description && <p className="text-xl text-gray-400 mb-8">{article.description}</p>}

      {images.length > 0 && (
        <div className="mb-8">
          {images.length === 1 ? (
            <div className="rounded-2xl overflow-hidden bg-gray-800">
              <img src={images[0]} alt={article.title} className="w-full max-h-[600px] object-contain" />
            </div>
          ) : (
            <div className={`grid gap-3 ${images.length === 2 ? 'grid-cols-2' : images.length === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
              {images.map((img, index) => (
                <div key={index} className="rounded-xl overflow-hidden bg-gray-800 aspect-video">
                  <img src={img} alt={`${article.title} - photo ${index + 1}`} className="w-full h-full object-contain" />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {article.content && (
        <p className="text-gray-300 text-lg leading-relaxed whitespace-pre-wrap">{article.content}</p>
      )}
    </article>
  );
}
