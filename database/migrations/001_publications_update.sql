-- Migration: Update publications table for optional title and type
-- Run this on existing database

-- 1. Make title nullable (한글 제목 optional)
ALTER TABLE publications ALTER COLUMN title DROP NOT NULL;

-- 2. Add publication_type column (논문/보고서 구분)
ALTER TABLE publications ADD COLUMN IF NOT EXISTS publication_type VARCHAR(50) DEFAULT 'paper';

-- Add check constraint (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'publications_publication_type_check'
  ) THEN
    ALTER TABLE publications ADD CONSTRAINT publications_publication_type_check
      CHECK (publication_type IN ('paper', 'report'));
  END IF;
END $$;

-- 3. Add title constraint (title OR title_en must be present)
-- Note: This might fail if existing rows have both NULL. Check first.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'title_check'
  ) THEN
    -- First update any rows that have both NULL
    UPDATE publications SET title = title_en WHERE title IS NULL AND title_en IS NOT NULL;
    UPDATE publications SET title_en = title WHERE title_en IS NULL AND title IS NOT NULL;

    ALTER TABLE publications ADD CONSTRAINT title_check
      CHECK (title IS NOT NULL OR title_en IS NOT NULL);
  END IF;
END $$;

-- 4. Create publication_categories table
CREATE TABLE IF NOT EXISTS publication_categories (
  id SERIAL PRIMARY KEY,
  publication_id INTEGER REFERENCES publications(id) ON DELETE CASCADE,
  category VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(publication_id, category)
);

-- 5. Create indexes
CREATE INDEX IF NOT EXISTS idx_publications_type ON publications(publication_type);
CREATE INDEX IF NOT EXISTS idx_pub_categories_pub_id ON publication_categories(publication_id);
CREATE INDEX IF NOT EXISTS idx_pub_categories_category ON publication_categories(category);

-- Verify
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'publications'
ORDER BY ordinal_position;
