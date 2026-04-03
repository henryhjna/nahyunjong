-- Add author note fields to books table
ALTER TABLE books ADD COLUMN IF NOT EXISTS author_note TEXT;
ALTER TABLE books ADD COLUMN IF NOT EXISTS author_note_en TEXT;
