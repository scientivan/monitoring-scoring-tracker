const fs = require("fs");
const path = require("path");
const { pool } = require("../app/db/connection");

const migrationsDirectory = path.join(__dirname, "..", "app", "db", "migrations");

async function ensureSchemaMigrationsTable(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id SERIAL PRIMARY KEY,
      filename VARCHAR(255) NOT NULL UNIQUE,
      applied_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);
}

function getMigrationFiles() {
  return fs
    .readdirSync(migrationsDirectory)
    .filter((fileName) => fileName.endsWith(".sql"))
    .sort((left, right) => left.localeCompare(right));
}

async function hasMigrationBeenApplied(client, fileName) {
  const result = await client.query(
    "SELECT 1 FROM schema_migrations WHERE filename = $1 LIMIT 1",
    [fileName],
  );

  return result.rowCount > 0;
}

async function recordAppliedMigration(client, fileName) {
  await client.query("INSERT INTO schema_migrations (filename) VALUES ($1)", [fileName]);
}

async function runMigrationFile(client, fileName) {
  const filePath = path.join(migrationsDirectory, fileName);
  const sql = fs.readFileSync(filePath, "utf8").trim();

  if (!sql) {
    console.log(`Skipping empty migration: ${fileName}`);
    return;
  }

  const alreadyApplied = await hasMigrationBeenApplied(client, fileName);

  if (alreadyApplied) {
    console.log(`Skipping already applied migration: ${fileName}`);
    return;
  }

  console.log(`Applying migration: ${fileName}`);

  await client.query("BEGIN");

  try {
    await client.query(sql);
    await recordAppliedMigration(client, fileName);
    await client.query("COMMIT");
    console.log(`Applied migration successfully: ${fileName}`);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  }
}

async function runMigrations() {
  const client = await pool.connect();

  try {
    await ensureSchemaMigrationsTable(client);

    const migrationFiles = getMigrationFiles();

    if (migrationFiles.length === 0) {
      console.log("No SQL migration files found.");
      return;
    }

    for (const fileName of migrationFiles) {
      await runMigrationFile(client, fileName);
    }

    console.log("Migration run completed.");
  } finally {
    client.release();
    await pool.end();
  }
}

runMigrations().catch((error) => {
  console.error("Migration failed.");
  console.error(error);
  process.exitCode = 1;
});
