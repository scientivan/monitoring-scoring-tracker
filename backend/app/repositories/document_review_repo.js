const { pool } = require("../db/connection");

function mapDocumentReviewRow(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    documentId: row.document_id,
    reviewerId: row.reviewer_id,
    status: row.status,
    notes: row.notes,
    createdAt: row.created_at,
  };
}

async function createDocumentReview(payload) {
  const query = `
    INSERT INTO document_reviews (
      document_id,
      reviewer_id,
      status,
      notes
    )
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `;

  const values = [
    payload.documentId,
    payload.reviewerId,
    payload.status,
    payload.notes,
  ];

  const result = await pool.query(query, values);
  return mapDocumentReviewRow(result.rows[0]);
}

async function listReviewsByDocumentId(documentId) {
  const query = `
    SELECT *
    FROM document_reviews
    WHERE document_id = $1
    ORDER BY created_at DESC
  `;

  const result = await pool.query(query, [documentId]);
  return result.rows.map(mapDocumentReviewRow);
}

async function getLatestReviewByDocumentId(documentId) {
  const query = `
    SELECT *
    FROM document_reviews
    WHERE document_id = $1
    ORDER BY created_at DESC
    LIMIT 1
  `;

  const result = await pool.query(query, [documentId]);
  return mapDocumentReviewRow(result.rows[0]);
}

module.exports = {
  createDocumentReview,
  listReviewsByDocumentId,
  getLatestReviewByDocumentId,
};
