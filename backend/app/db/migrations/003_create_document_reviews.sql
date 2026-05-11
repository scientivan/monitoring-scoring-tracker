CREATE TABLE document_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE RESTRICT,
  reviewer_id UUID NOT NULL REFERENCES users(id),
  status VARCHAR(30) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_document_reviews_status
    CHECK (status IN ('pending', 'approved', 'rejected', 'needs_revision'))
);

CREATE INDEX idx_document_reviews_document_created_at
  ON document_reviews(document_id, created_at DESC);

CREATE INDEX idx_document_reviews_reviewer_id
  ON document_reviews(reviewer_id);
