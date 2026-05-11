CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  role VARCHAR(20) NOT NULL,
  team_id UUID,
  wallet_address VARCHAR(42),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_users_role
    CHECK (role IN ('talent', 'client')),
  CONSTRAINT chk_users_wallet_address
    CHECK (wallet_address IS NULL OR wallet_address ~ '^0x[a-fA-F0-9]{40}$')
);

CREATE INDEX idx_users_team_id ON users(team_id);
CREATE INDEX idx_users_role ON users(role);
