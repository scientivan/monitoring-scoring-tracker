const assessmentRepository = require("../repositories/assessment.repository");

function createValidationError(message) {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
}

function createAssessment(payload = {}) {
  if (!payload.assessor || typeof payload.assessor !== "string" || !payload.assessor.trim()) {
    throw createValidationError("assessor is required");
  }

  if (payload.score === undefined || payload.score === null || payload.score === "") {
    throw createValidationError("score is required");
  }

  if (typeof payload.score !== "number" || payload.score < 0) {
    throw createValidationError("score must be a number greater than or equal to 0");
  }

  return assessmentRepository.createAssessment({
    assessor: payload.assessor.trim(),
    score: payload.score,
  });
}

function listAssessments() {
  return assessmentRepository.listAssessments();
}

module.exports = {
  createAssessment,
  listAssessments,
};
