CREATE TABLE IF NOT EXISTS thought_attachments (
  id SERIAL PRIMARY KEY,
  thought_id INTEGER NOT NULL REFERENCES thoughts(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL DEFAULT 'link',
  url TEXT NOT NULL,
  title VARCHAR(255),
  title_en VARCHAR(255),
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_thought_attachments_thought_id ON thought_attachments(thought_id);
