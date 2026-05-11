const { pool } = require("../db/connection");

function mapDocumentRow(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    teamId: row.team_id,
    uploaderId: row.uploader_id,
    fileUrl: row.file_url,
    fileName: row.file_name,
    fileType: row.file_type,
    fileSize: Number(row.file_size),
    fileHash: row.file_hash,
    description: row.description,
    createdAt: row.created_at,
  };
}

async function createDocument(payload) {
  const query = `
    INSERT INTO documents (
      team_id,
      uploader_id,
      file_url,
      file_name,
      file_type,
      file_size,
      file_hash,
      description
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *
  `;

  const values = [
    payload.teamId,
    payload.uploaderId,
    payload.fileUrl,
    payload.fileName,
    payload.fileType,
    payload.fileSize,
    payload.fileHash,
    payload.description,
  ];

  const result = await pool.query(query, values);
  return mapDocumentRow(result.rows[0]);
}

async function listDocumentsByTeam(teamId) {
  const query = `
    SELECT *
    FROM documents
    WHERE team_id = $1
    ORDER BY created_at DESC
  `;

  const result = await pool.query(query, [teamId]);
  return result.rows.map(mapDocumentRow);
}

async function getDocumentById(id) {
  const query = `
    SELECT *
    FROM documents
    WHERE id = $1
    LIMIT 1
  `;

  const result = await pool.query(query, [id]);
  return mapDocumentRow(result.rows[0]);
}

module.exports = {
  createDocument,
  listDocumentsByTeam,
  getDocumentById,
};
