const { Pool } = require("pg");

function getRequiredEnv(name, fallbackValue) {
  const value = process.env[name];

  if (value !== undefined && value !== "") {
    return value;
  }

  if (fallbackValue !== undefined) {
    return fallbackValue;
  }

  throw new Error(`Missing required environment variable: ${name}`);
}

function parsePort(value) {
  const parsedPort = Number.parseInt(value, 10);

  if (Number.isNaN(parsedPort) || parsedPort <= 0) {
    throw new Error(`Invalid DB_PORT value: ${value}`);
  }

  return parsedPort;
}

function createPool() {
  return new Pool({
    host: getRequiredEnv("DB_HOST", "localhost"),
    port: parsePort(getRequiredEnv("DB_PORT", "5432")),
    user: getRequiredEnv("DB_USER", "postgres"),
    password: getRequiredEnv("DB_PASSWORD", "postgres"),
    database: getRequiredEnv("DB_NAME", "postgres"),
  });
}

const pool = createPool();

module.exports = {
  pool,
  createPool,
};
