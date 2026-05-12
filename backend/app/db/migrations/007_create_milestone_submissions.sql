CREATE TABLE milestone_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  milestone_id UUID NOT NULL REFERENCES milestones(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES users(id),
  description TEXT NOT NULL,
  file_url VARCHAR(500),
  file_name VARCHAR(255),
  file_type VARCHAR(100),
  file_size BIGINT,
  file_hash VARCHAR(64),
  links JSONB NOT NULL DEFAULT '[]'::jsonb,
  status VARCHAR(20) NOT NULL DEFAULT 'submitted',
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_milestone_submissions_file_metadata
    CHECK (
      (file_url IS NULL AND file_name IS NULL AND file_type IS NULL AND file_size IS NULL AND file_hash IS NULL)
      OR
      (file_url IS NOT NULL AND file_name IS NOT NULL AND file_type IS NOT NULL AND file_size > 0 AND file_hash ~ '^[a-fA-F0-9]{64}$')
    ),
  CONSTRAINT chk_milestone_submissions_links_array
    CHECK (jsonb_typeof(links) = 'array'),
  CONSTRAINT chk_milestone_submissions_status
    CHECK (status IN ('submitted', 'approved', 'rejected', 'needs_revision'))
);

CREATE INDEX idx_milestone_submissions_milestone_submitted_at
  ON milestone_submissions(milestone_id, submitted_at DESC);

CREATE INDEX idx_milestone_submissions_student_submitted_at
  ON milestone_submissions(student_id, submitted_at DESC);

CREATE INDEX idx_milestone_submissions_status
  ON milestone_submissions(status);
