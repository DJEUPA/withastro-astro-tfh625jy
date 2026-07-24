/*
# Add multiple images support to articles

## Purpose
Support 1-4 images per article instead of a single image, while preserving
all existing article data (71 articles currently use the single image_url column).

## Changes
1. New column: `images` (jsonb, nullable)
   - Stores an array of image URLs, e.g. ["url1", "url2", "url3"]
   - Allows 1 to 4 images per article.
   - The existing `image_url` column is KEPT (data safety: never drop columns).
   - Existing rows are backfilled: `images` is set to a single-element array
     containing the existing `image_url` value, so all current articles
     immediately have their image available in the new column.

2. Backfill
   - UPDATE articles SET images = jsonb_build_array(image_url)
     WHERE image_url IS NOT NULL AND images IS NULL;
   - This ensures every existing article with an image_url now also has
     a valid `images` array, so the frontend can read from the new column
     uniformly.

## Security
- RLS already enabled on articles (from the original migration).
- No policy changes needed; the new column inherits existing policies.
*/

ALTER TABLE articles
  ADD COLUMN IF NOT EXISTS images jsonb;

-- Backfill existing rows so the new column is populated from image_url
UPDATE articles
SET images = jsonb_build_array(image_url)
WHERE image_url IS NOT NULL AND images IS NULL;