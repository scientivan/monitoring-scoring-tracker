CREATE TABLE milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  payment_amount NUMERIC(12, 2) NOT NULL,
  description TEXT,
  deadline TIMESTAMPTZ NOT NULL,
  employer_id UUID NOT NULL REFERENCES users(id),
  student_id UUID NOT NULL REFERENCES users(id),
  status VARCHAR(20) NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_milestones_payment_amount
    CHECK (payment_amount > 0),
  CONSTRAINT chk_milestones_status
    CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled'))
);

CREATE INDEX idx_milestones_employer_created_at
  ON milestones(employer_id, created_at DESC);

CREATE INDEX idx_milestones_student_created_at
  ON milestones(student_id, created_at DESC);

CREATE INDEX idx_milestones_status
  ON milestones(status);

CREATE INDEX idx_milestones_deadline
  ON milestones(deadline);
