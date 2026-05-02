CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL,
  uploader_id UUID NOT NULL REFERENCES users(id),
  file_url VARCHAR(255) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(50) NOT NULL,
  file_size BIGINT NOT NULL,
  file_hash VARCHAR(64) NOT NULL,
  description TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_documents_file_size
    CHECK (file_size > 0),
  CONSTRAINT chk_documents_file_hash
    CHECK (file_hash ~ '^[a-fA-F0-9]{64}$')
);

CREATE INDEX idx_documents_team_created_at
  ON documents(team_id, created_at DESC);

CREATE INDEX idx_documents_uploader_id
  ON documents(uploader_id);

CREATE INDEX idx_documents_file_hash
  ON documents(file_hash);
