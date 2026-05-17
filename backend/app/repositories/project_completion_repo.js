const { pool } = require("../db/connection");

function mapProjectCompletionRow(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    studentId: row.student_id,
    clientId: row.client_id,
    completedBy: row.completed_by,
    status: row.status,
    completedAt: row.completed_at,
    notes: row.notes,
    createdAt: row.created_at,
  };
}

function mapUserRow(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    role: row.role,
  };
}

async function findCompletionByProject(clientId, studentId) {
  const query = `
    SELECT *
    FROM project_completions
    WHERE client_id = $1
      AND student_id = $2
    LIMIT 1
  `;

  const result = await pool.query(query, [clientId, studentId]);
  return mapProjectCompletionRow(result.rows[0]);
}

async function createCompletion(payload) {
  const query = `
    INSERT INTO project_completions (
      student_id,
      client_id,
      completed_by,
      status,
      notes
    )
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `;

  const values = [
    payload.studentId,
    payload.clientId,
    payload.completedBy,
    payload.status || "completed",
    payload.notes,
  ];

  const result = await pool.query(query, values);
  return mapProjectCompletionRow(result.rows[0]);
}

async function countMilestonesByProject(clientId, studentId) {
  const query = `
    SELECT COUNT(*)::int AS count
    FROM milestones
    WHERE employer_id = $1
      AND student_id = $2
  `;

  const result = await pool.query(query, [clientId, studentId]);
  return result.rows[0]?.count || 0;
}

async function countCompletedMilestonesByProject(clientId, studentId) {
  const query = `
    SELECT COUNT(*)::int AS count
    FROM milestones
    WHERE employer_id = $1
      AND student_id = $2
      AND status = 'completed'
  `;

  const result = await pool.query(query, [clientId, studentId]);
  return result.rows[0]?.count || 0;
}

async function getUserById(id) {
  const query = `
    SELECT id, role
    FROM users
    WHERE id = $1
    LIMIT 1
  `;

  const result = await pool.query(query, [id]);
  return mapUserRow(result.rows[0]);
}

module.exports = {
  findCompletionByProject,
  createCompletion,
  countMilestonesByProject,
  countCompletedMilestonesByProject,
  getUserById,
};
