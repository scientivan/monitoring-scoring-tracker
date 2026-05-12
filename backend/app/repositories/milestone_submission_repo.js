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
    approvedBy: row.approved_by,
    approvedAt: row.approved_at,
    submittedAt: row.submitted_at,
    updatedAt: row.updated_at,
  };
}

function mapSubmissionReviewRow(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    submissionId: row.submission_id,
    reviewerId: row.reviewer_id,
    status: row.status,
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

async function updateSubmissionStatus(id, status, approvedBy = null) {
  const query = `
    UPDATE milestone_submissions
    SET status = $1,
        approved_by = CASE WHEN $1 = 'approved' THEN $3 ELSE NULL END,
        approved_at = CASE WHEN $1 = 'approved' THEN NOW() ELSE NULL END,
        updated_at = NOW()
    WHERE id = $2
    RETURNING *
  `;

  const result = await pool.query(query, [status, id, approvedBy]);
  return mapSubmissionRow(result.rows[0]);
}

async function createSubmissionReview(payload) {
  const query = `
    INSERT INTO milestone_submission_reviews (
      submission_id,
      reviewer_id,
      status,
      notes
    )
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `;

  const values = [
    payload.submissionId,
    payload.reviewerId,
    payload.status,
    payload.notes,
  ];

  const result = await pool.query(query, values);
  return mapSubmissionReviewRow(result.rows[0]);
}

async function createSubmissionReviewAndUpdateStatus(payload) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const reviewResult = await client.query(
      `
        INSERT INTO milestone_submission_reviews (
          submission_id,
          reviewer_id,
          status,
          notes
        )
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `,
      [
        payload.submissionId,
        payload.reviewerId,
        payload.status,
        payload.notes,
      ],
    );

    const submissionResult = await client.query(
      `
        UPDATE milestone_submissions
        SET status = $1,
            approved_by = CASE WHEN $1 = 'approved' THEN $3 ELSE NULL END,
            approved_at = CASE WHEN $1 = 'approved' THEN NOW() ELSE NULL END,
            updated_at = NOW()
        WHERE id = $2
        RETURNING *
      `,
      [
        payload.status,
        payload.submissionId,
        payload.status === "approved" ? payload.reviewerId : null,
      ],
    );

    await client.query("COMMIT");

    return {
      review: mapSubmissionReviewRow(reviewResult.rows[0]),
      submission: mapSubmissionRow(submissionResult.rows[0]),
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function listReviewsBySubmissionId(submissionId) {
  const query = `
    SELECT *
    FROM milestone_submission_reviews
    WHERE submission_id = $1
    ORDER BY created_at DESC
  `;

  const result = await pool.query(query, [submissionId]);
  return result.rows.map(mapSubmissionReviewRow);
}

async function getLatestReviewBySubmissionId(submissionId) {
  const query = `
    SELECT *
    FROM milestone_submission_reviews
    WHERE submission_id = $1
    ORDER BY created_at DESC
    LIMIT 1
  `;

  const result = await pool.query(query, [submissionId]);
  return mapSubmissionReviewRow(result.rows[0]);
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
  createSubmission,
  listSubmissions,
  getSubmissionById,
  updateSubmissionStatus,
  createSubmissionReview,
  createSubmissionReviewAndUpdateStatus,
  listReviewsBySubmissionId,
  getLatestReviewBySubmissionId,
  getUserById,
};
