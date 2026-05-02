# SQL Migrations

Store migration files in this directory using a sortable filename format:

- `001_create_users.sql`
- `002_create_documents.sql`
- `003_create_document_reviews.sql`

Rules:

1. Use `.sql` files only.
2. Prefix filenames with zero-padded numbers so lexical ordering matches execution order.
3. Each migration should be safe to run exactly once.
4. Applied migrations are tracked in the `schema_migrations` table.
