ALTER TABLE users
  DROP CONSTRAINT IF EXISTS chk_users_role;

UPDATE users
SET role = CASE
  WHEN role = 'mahasiswa' THEN 'talent'
  WHEN role IN ('mitra', 'panitia', 'dosen') THEN 'client'
  ELSE role
END;

ALTER TABLE users
  ADD CONSTRAINT chk_users_role
  CHECK (role IN ('talent', 'client'));
