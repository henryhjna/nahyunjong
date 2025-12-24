-- Initialize Database Schema for Nahyunjong Educational Platform

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Admins Table
CREATE TABLE IF NOT EXISTS admins (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Courses Table
CREATE TABLE IF NOT EXISTS courses (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  code VARCHAR(50),                 -- Course code (e.g., 'BUS3001')
  semester VARCHAR(50),              -- Semester (e.g., '2025-1')
  thumbnail_url TEXT,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Lectures Table
CREATE TABLE IF NOT EXISTS lectures (
  id SERIAL PRIMARY KEY,
  course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
  week INTEGER NOT NULL,             -- Week number
  title VARCHAR(255) NOT NULL,
  subtitle VARCHAR(255),
  mdx_file_path TEXT,                -- Path to MDX file
  mdx_content TEXT,                  -- Optional: store content in DB
  order_index INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Resources Table (files attached to lectures)
CREATE TABLE IF NOT EXISTS resources (
  id SERIAL PRIMARY KEY,
  lecture_id INTEGER REFERENCES lectures(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  file_type VARCHAR(50),             -- 'pdf', 'pptx', 'xlsx', etc.
  file_size BIGINT,                  -- in bytes
  download_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Quizzes Table
CREATE TABLE IF NOT EXISTS quizzes (
  id SERIAL PRIMARY KEY,
  lecture_id INTEGER REFERENCES lectures(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  type VARCHAR(50) NOT NULL,         -- 'multiple_choice', 'short_answer', 'essay'
  options JSONB,                     -- For multiple choice: ["A", "B", "C", "D"]
  correct_answer TEXT,
  explanation TEXT,
  points INTEGER DEFAULT 1,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- News Table (언론 보도)
CREATE TABLE IF NOT EXISTS news (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  content TEXT,                         -- 요약/설명
  source VARCHAR(100),                  -- 출처 (조선일보, KBS 등)
  source_url TEXT,                      -- 원문 링크
  image_url TEXT,                       -- 썸네일
  published_at DATE NOT NULL,           -- 보도일
  is_published BOOLEAN DEFAULT false,
  group_id INTEGER,                     -- 대표 뉴스 ID (NULL이면 자신이 대표 또는 독립)
  is_representative BOOLEAN DEFAULT true, -- true면 대표 뉴스, false면 그룹 내 하위 뉴스
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Books Table (출판 도서)
CREATE TABLE IF NOT EXISTS books (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  subtitle VARCHAR(255),
  authors VARCHAR(255) NOT NULL,
  publisher VARCHAR(100),
  published_date DATE,
  isbn VARCHAR(20),
  cover_image_url TEXT,
  description TEXT,
  table_of_contents TEXT,
  purchase_url TEXT,
  is_published BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Publications Table (학술 논문 및 보고서)
CREATE TABLE IF NOT EXISTS publications (
  id SERIAL PRIMARY KEY,
  title VARCHAR(500),                 -- 한글 제목 (optional)
  title_en VARCHAR(500),              -- 영문 제목 (optional, 둘 중 하나는 필수)
  authors VARCHAR(500) NOT NULL,
  journal VARCHAR(255),
  journal_tier VARCHAR(50),           -- 'SSCI', 'KCI', 'SCI' 등
  publication_type VARCHAR(50) DEFAULT 'paper' CHECK (publication_type IN ('paper', 'report')),
  year INTEGER NOT NULL,
  volume VARCHAR(50),
  issue VARCHAR(50),
  pages VARCHAR(50),
  doi VARCHAR(255),
  abstract TEXT,
  pdf_url TEXT,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT title_check CHECK (title IS NOT NULL OR title_en IS NOT NULL)
);

-- Publication Categories Table (연구 분야 카테고리, 다대다)
CREATE TABLE IF NOT EXISTS publication_categories (
  id SERIAL PRIMARY KEY,
  publication_id INTEGER REFERENCES publications(id) ON DELETE CASCADE,
  category VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(publication_id, category)
);

-- Lab Members Table (연구실 구성원)
CREATE TABLE IF NOT EXISTS lab_members (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  name_en VARCHAR(100),
  batch INTEGER,                       -- 기수 번호 (1, 2, 3..., NULL for professor)
  is_professor BOOLEAN DEFAULT false,  -- 지도교수 여부
  email VARCHAR(255),
  photo_url TEXT,
  graduation_year INTEGER,             -- NULL if current member
  current_position TEXT,               -- Alumni: 현재 직장
  linkedin_url TEXT,
  is_active BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Self-referencing foreign key for news grouping (must be added after table creation)
ALTER TABLE news ADD CONSTRAINT fk_news_group FOREIGN KEY (group_id) REFERENCES news(id) ON DELETE SET NULL;

-- Indexes for performance
CREATE INDEX idx_lectures_course_id ON lectures(course_id);
CREATE INDEX idx_lectures_week ON lectures(week);
CREATE INDEX idx_resources_lecture_id ON resources(lecture_id);
CREATE INDEX idx_quizzes_lecture_id ON quizzes(lecture_id);
CREATE INDEX idx_news_published_at ON news(published_at DESC);
CREATE INDEX idx_news_slug ON news(slug);
CREATE INDEX idx_news_group_id ON news(group_id);
CREATE INDEX idx_news_is_representative ON news(is_representative);
CREATE INDEX idx_books_order ON books(order_index);
CREATE INDEX idx_publications_year ON publications(year DESC);
CREATE INDEX idx_publications_journal_tier ON publications(journal_tier);
CREATE INDEX idx_publications_type ON publications(publication_type);
CREATE INDEX idx_pub_categories_pub_id ON publication_categories(publication_id);
CREATE INDEX idx_pub_categories_category ON publication_categories(category);
CREATE INDEX idx_lab_members_batch ON lab_members(batch);
CREATE INDEX idx_lab_members_is_professor ON lab_members(is_professor);
CREATE INDEX idx_lab_members_order ON lab_members(order_index);

-- Additional indexes for frequently filtered columns (is_published, is_active)
CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);
CREATE INDEX IF NOT EXISTS idx_admins_username ON admins(username);
CREATE INDEX IF NOT EXISTS idx_courses_is_published ON courses(is_published);
CREATE INDEX IF NOT EXISTS idx_lectures_is_published ON lectures(is_published);
CREATE INDEX IF NOT EXISTS idx_news_is_published ON news(is_published);
CREATE INDEX IF NOT EXISTS idx_books_is_published ON books(is_published);
CREATE INDEX IF NOT EXISTS idx_publications_is_published ON publications(is_published);
CREATE INDEX IF NOT EXISTS idx_lab_members_is_active ON lab_members(is_active);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_admins_updated_at BEFORE UPDATE ON admins
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lectures_updated_at BEFORE UPDATE ON lectures
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_news_updated_at BEFORE UPDATE ON news
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_books_updated_at BEFORE UPDATE ON books
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_publications_updated_at BEFORE UPDATE ON publications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lab_members_updated_at BEFORE UPDATE ON lab_members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default admin (password: 'admin123' - CHANGE THIS!)
-- Password hash for 'admin123' using bcrypt
INSERT INTO admins (username, email, password_hash)
VALUES (
  'nahyunjong',
  'na.hyunjong@gmail.com',
  '$2b$10$rKvVPx6xH8yqFQJXF5qZOeYYZN8Z7X1pYqKVvXJ5qZOeYYZN8Z7X1.' -- Placeholder, will be replaced
) ON CONFLICT (email) DO NOTHING;

COMMENT ON TABLE admins IS 'Administrator accounts for managing the platform';
COMMENT ON TABLE courses IS 'Courses offered by the professor';
COMMENT ON TABLE lectures IS 'Individual lecture materials within courses';
COMMENT ON TABLE resources IS 'Downloadable resources attached to lectures';
COMMENT ON TABLE quizzes IS 'Quiz questions for lectures';
COMMENT ON TABLE news IS 'Media coverage and press mentions';
COMMENT ON TABLE books IS 'Published books by the professor';
COMMENT ON TABLE publications IS 'Academic publications and research papers';
COMMENT ON TABLE lab_members IS 'Lab members organized by batch (기수)';

-- Lab Projects Table (기수별 프로젝트)
CREATE TABLE IF NOT EXISTS lab_projects (
  id SERIAL PRIMARY KEY,
  batch INTEGER NOT NULL,              -- 기수 번호 (1, 2, 3...)
  title VARCHAR(255) NOT NULL,         -- 프로젝트 제목
  description TEXT,                    -- 프로젝트 설명
  is_published BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Lab Project Links Table (프로젝트별 링크)
CREATE TABLE IF NOT EXISTS lab_project_links (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES lab_projects(id) ON DELETE CASCADE,
  link_type VARCHAR(50) NOT NULL,      -- 'website', 'youtube', 'github', 'paper', 'presentation', 'other'
  url TEXT NOT NULL,
  title VARCHAR(100),                  -- 링크 표시 텍스트 (optional)
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Lab projects indexes
CREATE INDEX IF NOT EXISTS idx_lab_projects_batch ON lab_projects(batch);
CREATE INDEX IF NOT EXISTS idx_lab_projects_is_published ON lab_projects(is_published);
CREATE INDEX IF NOT EXISTS idx_lab_project_links_project_id ON lab_project_links(project_id);

-- Trigger for lab_projects updated_at
CREATE TRIGGER update_lab_projects_updated_at BEFORE UPDATE ON lab_projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE lab_projects IS 'Lab projects organized by batch/cohort';
COMMENT ON TABLE lab_project_links IS 'Links associated with lab projects';

-- Lab Batch Meta Table (기수별 메타데이터)
CREATE TABLE IF NOT EXISTS lab_batch_meta (
  batch INTEGER PRIMARY KEY,
  hero_image_url TEXT,              -- 대표 이미지 URL
  year INTEGER,                     -- 기수 시작 연도
  description TEXT,                 -- 기수 설명 (선택)
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Trigger for lab_batch_meta updated_at
CREATE TRIGGER update_lab_batch_meta_updated_at BEFORE UPDATE ON lab_batch_meta
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE lab_batch_meta IS 'Metadata for lab batches including hero images and year';

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
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
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
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Professor profile indexes
CREATE INDEX IF NOT EXISTS idx_professor_education_profile ON professor_education(profile_id);
CREATE INDEX IF NOT EXISTS idx_professor_education_order ON professor_education(sort_order);
CREATE INDEX IF NOT EXISTS idx_professor_career_profile ON professor_career(profile_id);
CREATE INDEX IF NOT EXISTS idx_professor_career_order ON professor_career(sort_order);
CREATE INDEX IF NOT EXISTS idx_professor_awards_profile ON professor_awards(profile_id);
CREATE INDEX IF NOT EXISTS idx_professor_awards_order ON professor_awards(sort_order);

-- Trigger for professor_profile updated_at
CREATE TRIGGER update_professor_profile_updated_at BEFORE UPDATE ON professor_profile
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for professor_career updated_at
CREATE TRIGGER update_professor_career_updated_at BEFORE UPDATE ON professor_career
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for professor_awards updated_at
CREATE TRIGGER update_professor_awards_updated_at BEFORE UPDATE ON professor_awards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE professor_profile IS 'Professor basic profile information';
COMMENT ON TABLE professor_education IS 'Professor education history';
COMMENT ON TABLE professor_career IS 'Professor career history';
COMMENT ON TABLE professor_awards IS 'Professor awards and honors';

-- Book Chapters Table (Storybook feature)
CREATE TABLE IF NOT EXISTS book_chapters (
  id SERIAL PRIMARY KEY,
  book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  cover_image_url TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Book Pages Table (Storybook feature)
CREATE TABLE IF NOT EXISTS book_pages (
  id SERIAL PRIMARY KEY,
  chapter_id INTEGER REFERENCES book_chapters(id) ON DELETE CASCADE,
  image_url TEXT,
  text_content TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Book Storybook indexes
CREATE INDEX IF NOT EXISTS idx_book_chapters_book_id ON book_chapters(book_id);
CREATE INDEX IF NOT EXISTS idx_book_chapters_order ON book_chapters(order_index);
CREATE INDEX IF NOT EXISTS idx_book_pages_chapter_id ON book_pages(chapter_id);
CREATE INDEX IF NOT EXISTS idx_book_pages_order ON book_pages(order_index);

-- Triggers for book_chapters and book_pages
CREATE TRIGGER update_book_chapters_updated_at BEFORE UPDATE ON book_chapters
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_book_pages_updated_at BEFORE UPDATE ON book_pages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE book_chapters IS 'Chapters for book storybook preview feature';
COMMENT ON TABLE book_pages IS 'Pages within book chapters for storybook viewing';

-- Insert default professor profile
INSERT INTO professor_profile (name, name_en, title, affiliation)
VALUES ('나현종', 'Hyunjong Na', '회계학과 교수', '홍익대학교')
ON CONFLICT DO NOTHING;
