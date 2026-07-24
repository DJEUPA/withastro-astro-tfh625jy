import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Article } from '../lib/types';
import { getArticleImages } from '../lib/types';

const MAX_IMAGES = 4;

interface EditModalProps {
  article: Article;
  onClose: () => void;
  onSave: (updated: Article) => void;
}

function EditModal({ article, onClose, onSave }: EditModalProps) {
  const [title, setTitle] = useState(article.title);
  const [description, setDescription] = useState(article.description || '');
  const [content, setContent] = useState(article.content || '');
  const [category, setCategory] = useState<'architecture' | 'construction'>(article.category);
  const [published, setPublished] = useState(article.published);
  const [images, setImages] = useState<string[]>(getArticleImages(article));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleFileUpload = async (files: FileList, index: number) => {
    setError('');
    const file = files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('L\'image ne doit pas dépasser 5 MB');
      return;
    }

    const fileName = `${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from('article-images')
      .upload(fileName, file);

    if (uploadError) {
      setError('Erreur lors du téléversement: ' + uploadError.message);
      return;
    }

    const { data: urlData } = supabase.storage
      .from('article-images')
      .getPublicUrl(fileName);

    const newImages = [...images];
    if (index < newImages.length) {
      newImages[index] = urlData.publicUrl;
    } else {
      newImages.push(urlData.publicUrl);
    }
    setImages(newImages);
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');

    const { data, error: updateError } = await supabase
      .from('articles')
      .update({
        title,
        description,
        content,
        category,
        published,
        images: images.length > 0 ? images : null,
        image_url: images[0] || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', article.id)
      .select()
      .single();

    setSaving(false);
    if (updateError) {
      setError('Erreur: ' + updateError.message);
      return;
    }
    onSave(data as Article);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-gray-800 rounded-2xl border border-gray-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Modifier l'article</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 bg-red-900/50 border border-red-700 text-red-300 rounded-lg p-3 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Titre</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Contenu</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
              className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Catégorie</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as 'architecture' | 'construction')}
                className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="architecture">Architecture</option>
                <option value="construction">Construction</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Statut</label>
              <label className="flex items-center gap-3 px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={published}
                  onChange={(e) => setPublished(e.target.checked)}
                  className="w-5 h-5 rounded accent-blue-500"
                />
                <span className="text-white">Publié</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Images (1 à {MAX_IMAGES})
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Array.from({ length: MAX_IMAGES }).map((_, index) => (
                <div key={index} className="relative">
                  {images[index] ? (
                    <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-700 group">
                      <img src={images[index]} alt={`Image ${index + 1}`} className="w-full h-full object-cover" />
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                      >
                        <span className="text-red-400 text-sm font-medium">Supprimer</span>
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center aspect-square rounded-lg border-2 border-dashed border-gray-600 hover:border-blue-500 cursor-pointer transition-colors">
                      <svg className="w-6 h-6 text-gray-500 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <span className="text-xs text-gray-500">Ajouter</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => e.target.files && handleFileUpload(e.target.files, index)}
                      />
                    </label>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition-colors"
          >
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
          <button
            onClick={onClose}
            className="px-6 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2.5 rounded-lg transition-colors"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Admin() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [filter, setFilter] = useState<'all' | 'architecture' | 'construction'>('all');
  const [search, setSearch] = useState('');

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    let query = supabase.from('articles').select('*').order('created_at', { ascending: false });
    if (filter !== 'all') {
      query = query.eq('category', filter);
    }
    const { data, error: fetchError } = await query;
    if (fetchError) {
      setError(fetchError.message);
    } else {
      setArticles((data || []) as Article[]);
    }
    setLoading(false);
  }, [filter]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const handleSave = (updated: Article) => {
    setArticles(articles.map((a) => (a.id === updated.id ? updated : a)));
    setEditingArticle(null);
  };

  const filteredArticles = articles.filter((a) =>
    a.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="pt-24 pb-24 min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-white mb-2">Administration</h1>
        <p className="text-gray-400 mb-8">Gérez vos articles et projets</p>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <input
            type="text"
            placeholder="Rechercher un article..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
          />
          <div className="flex gap-2">
            {(['all', 'architecture', 'construction'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2.5 rounded-lg font-medium transition-colors ${
                  filter === f
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                {f === 'all' ? 'Tous' : f === 'architecture' ? 'Architecture' : 'Construction'}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-4 bg-red-900/50 border border-red-700 text-red-300 rounded-lg p-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
            <p className="text-gray-400 mt-4">Chargement des articles...</p>
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">Aucun article trouvé.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map((article) => {
              const imgs = getArticleImages(article);
              return (
                <div key={article.id} className="bg-gray-800 rounded-2xl overflow-hidden border border-gray-700">
                  <div className="relative aspect-video bg-gray-700">
                    {imgs[0] && (
                      <img src={imgs[0]} alt={article.title} className="w-full h-full object-cover" />
                    )}
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className="bg-blue-600 text-white text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full">
                        {article.category}
                      </span>
                      {imgs.length > 1 && (
                        <span className="bg-black/70 text-white text-xs font-medium px-2.5 py-1 rounded-full">
                          {imgs.length} photos
                        </span>
                      )}
                    </div>
                    {!article.published && (
                      <div className="absolute top-3 right-3">
                        <span className="bg-yellow-600 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                          Brouillon
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">{article.title}</h3>
                    {article.description && (
                      <p className="text-gray-400 text-sm line-clamp-2 mb-4">{article.description}</p>
                    )}
                    <button
                      onClick={() => setEditingArticle(article)}
                      className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Modifier
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {editingArticle && (
        <EditModal
          article={editingArticle}
          onClose={() => setEditingArticle(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
