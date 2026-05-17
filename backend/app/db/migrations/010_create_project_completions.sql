CREATE TABLE project_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES users(id),
  client_id UUID NOT NULL REFERENCES users(id),
  completed_by UUID NOT NULL REFERENCES users(id),
  status VARCHAR(30) NOT NULL DEFAULT 'completed',
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_project_completions_client_student UNIQUE (student_id, client_id),
  CONSTRAINT chk_project_completions_status
    CHECK (status IN ('completed'))
);

CREATE INDEX idx_project_completions_client_student
  ON project_completions(client_id, student_id);
