-- Add subcategory to thoughts for two-level categorization
-- category: 대분류 (e.g., 연재, 에세이, 칼럼)
-- subcategory: 중분류 (e.g., AI시대 대학교육은 어디로 가나)
ALTER TABLE thoughts ADD COLUMN IF NOT EXISTS subcategory VARCHAR(255);
CREATE INDEX IF NOT EXISTS idx_thoughts_subcategory ON thoughts(subcategory);
