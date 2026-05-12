ALTER TABLE milestone_submissions
  ADD COLUMN approved_by UUID REFERENCES users(id),
  ADD COLUMN approved_at TIMESTAMPTZ;

UPDATE milestone_submissions submission
SET approved_by = milestone.employer_id,
    approved_at = submission.updated_at
FROM milestones milestone
WHERE submission.milestone_id = milestone.id
  AND submission.status = 'approved'
  AND submission.approved_by IS NULL
  AND submission.approved_at IS NULL;

ALTER TABLE milestone_submissions
  ADD CONSTRAINT chk_milestone_submissions_approval_audit
    CHECK (
      (status = 'approved' AND approved_by IS NOT NULL AND approved_at IS NOT NULL)
      OR
      (status <> 'approved' AND approved_by IS NULL AND approved_at IS NULL)
    );

CREATE TABLE milestone_submission_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES milestone_submissions(id) ON DELETE RESTRICT,
  reviewer_id UUID NOT NULL REFERENCES users(id),
  status VARCHAR(30) NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_milestone_submission_reviews_status
    CHECK (status IN ('approved', 'rejected', 'needs_revision'))
);

CREATE INDEX idx_milestone_submission_reviews_submission_created_at
  ON milestone_submission_reviews(submission_id, created_at DESC);

CREATE INDEX idx_milestone_submission_reviews_reviewer_id
  ON milestone_submission_reviews(reviewer_id);

CREATE OR REPLACE FUNCTION prevent_append_only_review_mutation()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Review records are append-only and cannot be updated or deleted';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_document_reviews_append_only
BEFORE UPDATE OR DELETE ON document_reviews
FOR EACH ROW EXECUTE FUNCTION prevent_append_only_review_mutation();

CREATE TRIGGER trg_milestone_submission_reviews_append_only
BEFORE UPDATE OR DELETE ON milestone_submission_reviews
FOR EACH ROW EXECUTE FUNCTION prevent_append_only_review_mutation();
