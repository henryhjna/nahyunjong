-- Migration: Change lab members from role-based to batch-based system
-- Date: 2025-11-25

-- Add new columns
ALTER TABLE lab_members ADD COLUMN IF NOT EXISTS batch INTEGER;
ALTER TABLE lab_members ADD COLUMN IF NOT EXISTS is_professor BOOLEAN DEFAULT false;

-- Migrate existing data:
-- - professor -> is_professor = true, batch = NULL
-- - phd/master -> batch = entrance_year (기수는 입학년도 기준)
-- - alumni -> batch = entrance_year
UPDATE lab_members SET is_professor = true, batch = NULL WHERE role = 'professor';
UPDATE lab_members SET is_professor = false, batch = entrance_year WHERE role IN ('phd', 'master', 'alumni');

-- Drop the old role column and index
DROP INDEX IF EXISTS idx_lab_members_role;
ALTER TABLE lab_members DROP COLUMN IF EXISTS role;

-- Add index for batch
CREATE INDEX IF NOT EXISTS idx_lab_members_batch ON lab_members(batch);
CREATE INDEX IF NOT EXISTS idx_lab_members_is_professor ON lab_members(is_professor);

-- Add comment
COMMENT ON COLUMN lab_members.batch IS 'Batch number (기수), based on entrance year';
COMMENT ON COLUMN lab_members.is_professor IS 'Whether this member is a professor';
