CREATE TABLE event_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type VARCHAR(50) NOT NULL,
  payload JSONB NOT NULL,
  published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  CONSTRAINT chk_event_log_status
    CHECK (status IN ('pending', 'sent', 'failed'))
);

CREATE INDEX idx_event_log_type_published_at
  ON event_log(event_type, published_at DESC);

CREATE INDEX idx_event_log_status_published_at
  ON event_log(status, published_at DESC);
