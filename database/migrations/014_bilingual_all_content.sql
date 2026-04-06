-- Books bilingual fields
ALTER TABLE books ADD COLUMN IF NOT EXISTS title_en VARCHAR(255);
ALTER TABLE books ADD COLUMN IF NOT EXISTS subtitle_en VARCHAR(255);
ALTER TABLE books ADD COLUMN IF NOT EXISTS description_en TEXT;
ALTER TABLE books ADD COLUMN IF NOT EXISTS table_of_contents_en TEXT;

-- Publications bilingual fields
ALTER TABLE publications ADD COLUMN IF NOT EXISTS authors_en VARCHAR(500);
ALTER TABLE publications ADD COLUMN IF NOT EXISTS journal_en VARCHAR(255);
ALTER TABLE publications ADD COLUMN IF NOT EXISTS abstract_en TEXT;

-- Professor profile bilingual fields
ALTER TABLE professor_profile ADD COLUMN IF NOT EXISTS title_en VARCHAR(200);
ALTER TABLE professor_profile ADD COLUMN IF NOT EXISTS affiliation_en VARCHAR(200);
ALTER TABLE professor_profile ADD COLUMN IF NOT EXISTS bio_en TEXT;
ALTER TABLE professor_profile ADD COLUMN IF NOT EXISTS bio_detail_en TEXT;

-- Professor education bilingual fields
ALTER TABLE professor_education ADD COLUMN IF NOT EXISTS degree_en VARCHAR(50);
ALTER TABLE professor_education ADD COLUMN IF NOT EXISTS field_en VARCHAR(200);
ALTER TABLE professor_education ADD COLUMN IF NOT EXISTS description_en TEXT;

-- Professor career bilingual fields
ALTER TABLE professor_career ADD COLUMN IF NOT EXISTS position_en VARCHAR(200);
ALTER TABLE professor_career ADD COLUMN IF NOT EXISTS description_en TEXT;

-- Professor awards bilingual fields
ALTER TABLE professor_awards ADD COLUMN IF NOT EXISTS title_en VARCHAR(300);
ALTER TABLE professor_awards ADD COLUMN IF NOT EXISTS organization_en VARCHAR(200);
ALTER TABLE professor_awards ADD COLUMN IF NOT EXISTS description_en TEXT;

-- News bilingual fields
ALTER TABLE news ADD COLUMN IF NOT EXISTS title_en VARCHAR(255);
ALTER TABLE news ADD COLUMN IF NOT EXISTS content_en TEXT;
