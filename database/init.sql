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

-- Indexes for performance
CREATE INDEX idx_lectures_course_id ON lectures(course_id);
CREATE INDEX idx_lectures_week ON lectures(week);
CREATE INDEX idx_resources_lecture_id ON resources(lecture_id);
CREATE INDEX idx_quizzes_lecture_id ON quizzes(lecture_id);

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
