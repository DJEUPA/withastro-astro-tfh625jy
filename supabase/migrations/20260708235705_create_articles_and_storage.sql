/*
# Create articles table and image storage

## Summary
Creates the core data infrastructure for the WFA & Partners website:
1. An `articles` table to store architecture/construction project articles with image references.
2. A Supabase Storage bucket `article-images` for uploading article images.
3. Row Level Security policies allowing public read access to articles and images,
   and authenticated write access for admin users.

## New Tables
- `articles`
  - `id` (uuid, primary key)
  - `title` (text, not null) — article title
  - `description` (text, not null) — short summary shown on cards
  - `content` (text, not null) — full article body
  - `image_url` (text, not null) — URL to the article image (stored in Supabase Storage or external URL)
  - `category` (text, not null) — 'architecture' or 'construction'
  - `published` (boolean, default false) — whether the article is visible publicly
  - `created_at` (timestamptz, default now())
  - `updated_at` (timestamptz, default now())

## Storage
- Bucket `article-images` created for uploading article images.
  - Public read access (anyone can view article images).
  - Authenticated write access (only logged-in admin can upload/update/delete).

## Security (RLS)
### articles table
- SELECT: public (anon + authenticated) — anyone can read published articles.
  Note: for simplicity, all articles are readable; the `published` flag is
  enforced at the application level for public pages.
- INSERT/UPDATE/DELETE: authenticated only — admin must be logged in.

### article-images storage bucket
- SELECT (read): public — anyone can view images.
- INSERT/UPDATE/DELETE: authenticated only — admin must be logged in.
*/

-- Create articles table
CREATE TABLE IF NOT EXISTS articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  content text NOT NULL,
  image_url text NOT NULL,
  category text NOT NULL CHECK (category IN ('architecture', 'construction')),
  published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Index for category-based queries
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);
CREATE INDEX IF NOT EXISTS idx_articles_published ON articles(published);
CREATE INDEX IF NOT EXISTS idx_articles_created_at ON articles(created_at DESC);

-- Enable RLS
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- Articles: public read (anon + authenticated can read all articles)
DROP POLICY IF EXISTS "public_read_articles" ON articles;
CREATE POLICY "public_read_articles" ON articles FOR SELECT
  TO anon, authenticated USING (true);

-- Articles: authenticated insert (admin creates articles)
DROP POLICY IF EXISTS "auth_insert_articles" ON articles;
CREATE POLICY "auth_insert_articles" ON articles FOR INSERT
  TO authenticated WITH CHECK (true);

-- Articles: authenticated update (admin edits articles)
DROP POLICY IF EXISTS "auth_update_articles" ON articles;
CREATE POLICY "auth_update_articles" ON articles FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

-- Articles: authenticated delete (admin deletes articles)
DROP POLICY IF EXISTS "auth_delete_articles" ON articles;
CREATE POLICY "auth_delete_articles" ON articles FOR DELETE
  TO authenticated USING (true);

-- Auto-update updated_at on row change
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS articles_updated_at ON articles;
CREATE TRIGGER articles_updated_at
  BEFORE UPDATE ON articles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Create storage bucket for article images
INSERT INTO storage.buckets (id, name, public)
VALUES ('article-images', 'article-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies: public read, authenticated write
DROP POLICY IF EXISTS "public_read_article_images" ON storage.objects;
CREATE POLICY "public_read_article_images" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'article-images');

DROP POLICY IF EXISTS "auth_insert_article_images" ON storage.objects;
CREATE POLICY "auth_insert_article_images" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'article-images');

DROP POLICY IF EXISTS "auth_update_article_images" ON storage.objects;
CREATE POLICY "auth_update_article_images" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'article-images');

DROP POLICY IF EXISTS "auth_delete_article_images" ON storage.objects;
CREATE POLICY "auth_delete_article_images" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'article-images');
