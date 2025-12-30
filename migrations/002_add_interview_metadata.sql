-- Migration: Add interview metadata columns
-- Description: Adds fields to capture interview context (date, interviewee info, department)

-- Add interview metadata columns
ALTER TABLE interviews ADD COLUMN IF NOT EXISTS interview_date DATE;
ALTER TABLE interviews ADD COLUMN IF NOT EXISTS interviewee_name VARCHAR(255);
ALTER TABLE interviews ADD COLUMN IF NOT EXISTS interviewee_role VARCHAR(255);
ALTER TABLE interviews ADD COLUMN IF NOT EXISTS department VARCHAR(255);

-- Add index for filtering by department (common filter use case)
CREATE INDEX IF NOT EXISTS idx_interviews_department ON interviews(department);

-- Add index for filtering by interview date
CREATE INDEX IF NOT EXISTS idx_interviews_interview_date ON interviews(interview_date);
