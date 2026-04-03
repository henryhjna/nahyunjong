-- Drop education-related tables (courses, lectures, resources, quizzes)
-- Run this migration on existing databases to clean up education tables

DROP TABLE IF EXISTS quizzes CASCADE;
DROP TABLE IF EXISTS resources CASCADE;
DROP TABLE IF EXISTS lectures CASCADE;
DROP TABLE IF EXISTS courses CASCADE;
