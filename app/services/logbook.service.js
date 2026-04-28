const logbookRepository = require("../repositories/logbook.repository");

function createValidationError(message) {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
}

function createLogbook(payload = {}) {
  if (payload.week === undefined || payload.week === null || payload.week === "") {
    throw createValidationError("week is required");
  }

  if (typeof payload.week !== "number" || payload.week <= 0) {
    throw createValidationError("week must be a positive number");
  }

  if (!payload.summary || typeof payload.summary !== "string" || !payload.summary.trim()) {
    throw createValidationError("summary is required");
  }

  return logbookRepository.createLogbook({
    week: payload.week,
    summary: payload.summary.trim(),
  });
}

function listLogbooks() {
  return logbookRepository.listLogbooks();
}

module.exports = {
  createLogbook,
  listLogbooks,
};
