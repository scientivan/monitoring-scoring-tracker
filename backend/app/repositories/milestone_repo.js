const { pool } = require("../db/connection");

function mapMilestoneRow(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    title: row.title,
    paymentAmount: Number(row.payment_amount),
    description: row.description,
    deadline: row.deadline,
    employerId: row.employer_id,
    studentId: row.student_id,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function createMilestone(payload) {
  const query = `
    INSERT INTO milestones (
      title,
      payment_amount,
      description,
      deadline,
      employer_id,
      student_id,
      status
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
  `;

  const values = [
    payload.title,
    payload.paymentAmount,
    payload.description,
    payload.deadline,
    payload.employerId,
    payload.studentId,
    payload.status || "open",
  ];

  const result = await pool.query(query, values);
  return mapMilestoneRow(result.rows[0]);
}

async function listMilestones(filters = {}) {
  const conditions = [];
  const values = [];

  if (filters.employerId) {
    values.push(filters.employerId);
    conditions.push(`employer_id = $${values.length}`);
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
    FROM milestones
    ${whereClause}
    ORDER BY created_at DESC
  `;

  const result = await pool.query(query, values);
  return result.rows.map(mapMilestoneRow);
}

async function getMilestoneById(id) {
  const query = `
    SELECT *
    FROM milestones
    WHERE id = $1
    LIMIT 1
  `;

  const result = await pool.query(query, [id]);
  return mapMilestoneRow(result.rows[0]);
}

async function updateMilestone(id, payload) {
  const fields = [];
  const values = [];

  if (payload.title !== undefined) {
    values.push(payload.title);
    fields.push(`title = $${values.length}`);
  }

  if (payload.paymentAmount !== undefined) {
    values.push(payload.paymentAmount);
    fields.push(`payment_amount = $${values.length}`);
  }

  if (payload.description !== undefined) {
    values.push(payload.description);
    fields.push(`description = $${values.length}`);
  }

  if (payload.deadline !== undefined) {
    values.push(payload.deadline);
    fields.push(`deadline = $${values.length}`);
  }

  if (payload.status !== undefined) {
    values.push(payload.status);
    fields.push(`status = $${values.length}`);
  }

  fields.push(`updated_at = NOW()`);
  values.push(id);

  const query = `
    UPDATE milestones
    SET ${fields.join(", ")}
    WHERE id = $${values.length}
      AND status <> 'completed'
    RETURNING *
  `;

  const result = await pool.query(query, values);
  return mapMilestoneRow(result.rows[0]);
}

module.exports = {
  createMilestone,
  listMilestones,
  getMilestoneById,
  updateMilestone,
};
