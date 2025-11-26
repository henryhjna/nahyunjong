-- Migration: Add lab_batch_meta table
-- Date: 2025-11-25
-- Description: Add batch metadata for hero images and year info

-- lab_batch_meta: 기수별 메타데이터 (대표 이미지, 연도 등)
CREATE TABLE IF NOT EXISTS lab_batch_meta (
  batch INTEGER PRIMARY KEY,
  hero_image_url TEXT,              -- 대표 이미지 URL
  year INTEGER,                     -- 기수 시작 연도
  description TEXT,                 -- 기수 설명 (선택)
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Trigger for updated_at
CREATE TRIGGER update_lab_batch_meta_updated_at
  BEFORE UPDATE ON lab_batch_meta
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comment
COMMENT ON TABLE lab_batch_meta IS 'Metadata for lab batches including hero images and year';
