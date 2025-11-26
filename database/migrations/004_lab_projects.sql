-- Migration: Add lab_projects and lab_project_links tables
-- Date: 2025-01-25
-- Description: Add project system for batch-based lab page

-- lab_projects: 기수별 프로젝트 (기수당 여러 프로젝트 가능)
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

-- lab_project_links: 프로젝트별 링크 (여러 개 가능)
CREATE TABLE IF NOT EXISTS lab_project_links (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES lab_projects(id) ON DELETE CASCADE,
  link_type VARCHAR(50) NOT NULL,      -- 'website', 'youtube', 'github', 'paper', 'presentation', 'other'
  url TEXT NOT NULL,
  title VARCHAR(100),                  -- 링크 표시 텍스트 (optional)
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_lab_projects_batch ON lab_projects(batch);
CREATE INDEX IF NOT EXISTS idx_lab_project_links_project_id ON lab_project_links(project_id);
