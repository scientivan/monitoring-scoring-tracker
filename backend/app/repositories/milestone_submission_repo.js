const { pool } = require("../db/connection");

function mapSubmissionRow(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    milestoneId: row.milestone_id,
    studentId: row.student_id,
    description: row.description,
    fileUrl: row.file_url,
    fileName: row.file_name,
    fileType: row.file_type,
    fileSize: row.file_size === null ? null : Number(row.file_size),
    fileHash: row.file_hash,
    links: row.links || [],
    status: row.status,
    submittedAt: row.submitted_at,
    updatedAt: row.updated_at,
  };
}

async function createSubmission(payload) {
  const query = `
    INSERT INTO milestone_submissions (
      milestone_id,
      student_id,
      description,
      file_url,
      file_name,
      file_type,
      file_size,
      file_hash,
      links,
      status
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *
  `;

  const values = [
    payload.milestoneId,
    payload.studentId,
    payload.description,
    payload.fileUrl,
    payload.fileName,
    payload.fileType,
    payload.fileSize,
    payload.fileHash,
    JSON.stringify(payload.links || []),
    payload.status || "submitted",
  ];

  const result = await pool.query(query, values);
  return mapSubmissionRow(result.rows[0]);
}

async function listSubmissions(filters = {}) {
  const conditions = [];
  const values = [];

  if (filters.milestoneId) {
    values.push(filters.milestoneId);
    conditions.push(`milestone_id = $${values.length}`);
  }

  if (filters.studentId) {
    values.push(filters.studentId);
    conditions.push(`student_id = $${values.length}`);
  }

  if (filters.status) {
    values.push(filters.status);
    conditions.push(`status = $${values.length}`);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const query = `
    SELECT *
    FROM milestone_submissions
    ${whereClause}
    ORDER BY submitted_at DESC
  `;

  const result = await pool.query(query, values);
  return result.rows.map(mapSubmissionRow);
}

async function getSubmissionById(id) {
  const query = `
    SELECT *
    FROM milestone_submissions
    WHERE id = $1
    LIMIT 1
  `;

  const result = await pool.query(query, [id]);
  return mapSubmissionRow(result.rows[0]);
}

module.exports = {
  createSubmission,
  listSubmissions,
  getSubmissionById,
};
