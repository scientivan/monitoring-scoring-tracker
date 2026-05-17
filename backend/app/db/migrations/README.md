# SQL Migrations

Store migration files in this directory using a sortable filename format:

- `001_create_users.sql`
- `002_create_documents.sql`
- `003_create_document_reviews.sql`
- `004_create_milestones.sql`
- `005_create_event_log.sql`
- `006_update_users_role_for_freelance.sql`
- `007_create_milestone_submissions.sql`
- `008_create_milestone_submission_reviews.sql`
- `009_prevent_duplicate_milestone_submissions.sql`
- `010_create_project_completions.sql`

Rules:

1. Use `.sql` files only.
2. Prefix filenames with zero-padded numbers so lexical ordering matches execution order.
3. Each migration should be safe to run exactly once.
4. Applied migrations are tracked in the `schema_migrations` table.
