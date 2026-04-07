CREATE TABLE IF NOT EXISTS analytics_excluded_ips (
  id SERIAL PRIMARY KEY,
  ip_hash VARCHAR(64) UNIQUE NOT NULL,
  label VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);
