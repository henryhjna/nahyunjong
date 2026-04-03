-- Create thoughts table for essays, columns, and writings
CREATE TABLE IF NOT EXISTS thoughts (
  id SERIAL PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  title_en VARCHAR(500),
  slug VARCHAR(255) UNIQUE NOT NULL,
  excerpt TEXT,
  excerpt_en TEXT,
  content TEXT,
  content_en TEXT,
  category VARCHAR(100),
  cover_image_url TEXT,
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_thoughts_slug ON thoughts(slug);
CREATE INDEX idx_thoughts_published_at ON thoughts(published_at DESC);
CREATE INDEX idx_thoughts_is_published ON thoughts(is_published);
CREATE INDEX idx_thoughts_category ON thoughts(category);

CREATE TRIGGER update_thoughts_updated_at BEFORE UPDATE ON thoughts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE thoughts IS 'Essays, columns, and writings by the professor';
