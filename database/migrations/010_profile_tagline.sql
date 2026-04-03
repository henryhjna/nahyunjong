-- Add tagline fields to professor_profile for landing page
ALTER TABLE professor_profile ADD COLUMN IF NOT EXISTS tagline TEXT;
ALTER TABLE professor_profile ADD COLUMN IF NOT EXISTS tagline_en TEXT;
