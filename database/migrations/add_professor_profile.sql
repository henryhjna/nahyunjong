-- Migration: Add Professor Profile Tables
-- Run this migration on existing databases

-- Professor Profile Table (교수 기본 프로필)
CREATE TABLE IF NOT EXISTS professor_profile (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  name_en VARCHAR(100),
  title VARCHAR(200),                   -- 직함 (예: 경영대학 회계학과 교수)
  affiliation VARCHAR(200),             -- 소속 (예: 홍익대학교)
  email VARCHAR(255),
  photo_url TEXT,
  bio TEXT,                             -- 간단한 소개 (랜딩용)
  bio_detail TEXT,                      -- 상세 소개 (About용)
  research_interests TEXT[],            -- 연구 관심사 배열
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Professor Education Table (학력)
CREATE TABLE IF NOT EXISTS professor_education (
  id SERIAL PRIMARY KEY,
  profile_id INTEGER REFERENCES professor_profile(id) ON DELETE CASCADE,
  degree VARCHAR(50) NOT NULL,          -- 박사, 석사, 학사
  field VARCHAR(200),                   -- 전공
  institution VARCHAR(200) NOT NULL,
  institution_en VARCHAR(200),
  year_start INTEGER,
  year_end INTEGER,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Professor Career Table (경력)
CREATE TABLE IF NOT EXISTS professor_career (
  id SERIAL PRIMARY KEY,
  profile_id INTEGER REFERENCES professor_profile(id) ON DELETE CASCADE,
  position VARCHAR(200) NOT NULL,       -- 직위
  organization VARCHAR(200) NOT NULL,
  organization_en VARCHAR(200),
  year_start INTEGER,
  year_end INTEGER,                     -- NULL이면 현재
  is_current BOOLEAN DEFAULT FALSE,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Professor Awards Table (수상/명예)
CREATE TABLE IF NOT EXISTS professor_awards (
  id SERIAL PRIMARY KEY,
  profile_id INTEGER REFERENCES professor_profile(id) ON DELETE CASCADE,
  title VARCHAR(300) NOT NULL,
  organization VARCHAR(200),
  year INTEGER,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Professor profile indexes
CREATE INDEX IF NOT EXISTS idx_professor_education_profile ON professor_education(profile_id);
CREATE INDEX IF NOT EXISTS idx_professor_education_order ON professor_education(sort_order);
CREATE INDEX IF NOT EXISTS idx_professor_career_profile ON professor_career(profile_id);
CREATE INDEX IF NOT EXISTS idx_professor_career_order ON professor_career(sort_order);
CREATE INDEX IF NOT EXISTS idx_professor_awards_profile ON professor_awards(profile_id);
CREATE INDEX IF NOT EXISTS idx_professor_awards_order ON professor_awards(sort_order);

-- Trigger for professor_profile updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_professor_profile_updated_at ON professor_profile;
CREATE TRIGGER update_professor_profile_updated_at BEFORE UPDATE ON professor_profile
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default professor profile
INSERT INTO professor_profile (name, name_en, title, affiliation)
VALUES ('나현종', 'Hyunjong Na', '회계학과 교수', '홍익대학교')
ON CONFLICT DO NOTHING;
