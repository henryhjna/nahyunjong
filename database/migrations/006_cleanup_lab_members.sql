-- Migration: Clean up lab_members table (remove legacy fields)
-- Date: 2025-11-26
-- Description: Remove entrance_year and research_interest columns that are no longer used

-- Drop legacy columns
ALTER TABLE lab_members DROP COLUMN IF EXISTS entrance_year;
ALTER TABLE lab_members DROP COLUMN IF EXISTS research_interest;

-- Comment update
COMMENT ON TABLE lab_members IS 'Lab members organized by batch (기수)';
