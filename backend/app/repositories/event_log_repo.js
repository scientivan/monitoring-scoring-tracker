const { pool } = require("../db/connection");

function mapEventLogRow(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    eventType: row.event_type,
    payload: row.payload,
    publishedAt: row.published_at,
    status: row.status,
  };
}

async function createEventLog(payload) {
  const query = `
    INSERT INTO event_log (
      event_type,
      payload,
      status
    )
    VALUES ($1, $2, $3)
    RETURNING *
  `;

  const values = [
    payload.eventType,
    JSON.stringify(payload.payload),
    payload.status || "pending",
  ];

  const result = await pool.query(query, values);
  return mapEventLogRow(result.rows[0]);
}

module.exports = {
  createEventLog,
};
