-- Users table (email unique, PBKDF2 password)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  first_name TEXT,
  last_name TEXT,
  role TEXT DEFAULT 'user',
  password_hash TEXT NOT NULL, -- format: pbkdf2$iter$salt$b64hash
  created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

-- Documents table (optional metadata mirror; R2 is source of truth)
CREATE TABLE IF NOT EXISTS documents (
  id TEXT PRIMARY KEY,               -- use the R2 key as id for simplicity
  user_id TEXT NOT NULL,
  type TEXT NOT NULL,
  filename TEXT,
  mime TEXT,
  size INTEGER,
  upload_date TEXT,
  r2_key TEXT NOT NULL,
  year TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS documents_user_type ON documents (user_id, type, upload_date DESC);
CREATE INDEX IF NOT EXISTS users_email ON users (email);
