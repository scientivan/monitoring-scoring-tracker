const projectCompletionRepository = require("../repositories/project_completion_repo");
const { acquireLock, releaseLock } = require("../core/redis");
const eventPublisher = require("./event_publisher");
const {
  conflictError,
  forbiddenError,
  notFoundError,
  unprocessableEntityError,
  validationError,
} = require("../core/api_error");

const DEFAULT_LOCK_TTL_MS = 10_000;

function requireString(value, fieldName) {
  if (!value || typeof value !== "string" || !value.trim()) {
    throw validationError(`Field '${fieldName}' is required`);
  }
}

function normalizeOptionalNotes(value) {
  if (value === undefined) {
    return null;
  }

  if (value === null) {
    return null;
  }

  if (typeof value !== "string") {
    throw validationError("Field 'notes' must be a string");
  }

  return value.trim() ? value.trim() : null;
}

function parsePositiveInteger(value, fallbackValue) {
  const parsedValue = Number.parseInt(value, 10);

  if (Number.isNaN(parsedValue) || parsedValue <= 0) {
    return fallbackValue;
  }

  return parsedValue;
}

function getLockTtlMs() {
  return parsePositiveInteger(process.env.PROJECT_COMPLETION_LOCK_TTL_MS, DEFAULT_LOCK_TTL_MS);
}

function buildLockKey(clientId, studentId) {
  return `lock:project-completion:${clientId}:${studentId}`;
}

async function validateProjectCompletionRequest(payload) {
  requireString(payload.clientId, "clientId");
  requireString(payload.studentId, "studentId");
  requireString(payload.completedBy, "completedBy");

  const clientId = payload.clientId.trim();
  const studentId = payload.studentId.trim();
  const completedBy = payload.completedBy.trim();

  const [clientUser, studentUser, actorUser] = await Promise.all([
    projectCompletionRepository.getUserById(clientId),
    projectCompletionRepository.getUserById(studentId),
    projectCompletionRepository.getUserById(completedBy),
  ]);

  if (!clientUser) {
    throw notFoundError(`User with id '${clientId}' was not found`);
  }

  if (!studentUser) {
    throw notFoundError(`User with id '${studentId}' was not found`);
  }

  if (!actorUser) {
    throw notFoundError(`User with id '${completedBy}' was not found`);
  }

  if (clientUser.role !== "client") {
    throw forbiddenError("Only users with role 'client' can complete a project");
  }

  if (completedBy !== clientId) {
    throw forbiddenError("Only the assigned client can complete this project");
  }

  const milestoneCount =
    await projectCompletionRepository.countMilestonesByProject(clientId, studentId);

  if (milestoneCount === 0) {
    throw notFoundError("No project milestones were found for this client and student");
  }

  const completedMilestoneCount =
    await projectCompletionRepository.countCompletedMilestonesByProject(clientId, studentId);

  if (completedMilestoneCount !== milestoneCount) {
    throw unprocessableEntityError("All project milestones must be completed first");
  }

  const existingCompletion = await projectCompletionRepository.findCompletionByProject(
    clientId,
    studentId,
  );

  if (existingCompletion) {
    throw conflictError("This project has already been completed");
  }

  return {
    clientId,
    studentId,
    completedBy,
    notes: normalizeOptionalNotes(payload.notes),
  };
}

async function completeProject(payload = {}) {
  const normalizedPayload = {
    clientId: payload.clientId,
    studentId: payload.studentId,
    completedBy: payload.completedBy,
    notes: payload.notes,
  };

  requireString(normalizedPayload.clientId, "clientId");
  requireString(normalizedPayload.studentId, "studentId");

  const lockKey = buildLockKey(
    normalizedPayload.clientId.trim(),
    normalizedPayload.studentId.trim(),
  );
  const lockValue = await acquireLock(lockKey, getLockTtlMs());

  if (!lockValue) {
    throw conflictError("This project completion is already being processed");
  }

  try {
    const validatedPayload = await validateProjectCompletionRequest(normalizedPayload);
    let completion;

    try {
      completion = await projectCompletionRepository.createCompletion(validatedPayload);
    } catch (error) {
      if (error && error.code === "23505") {
        throw conflictError("This project has already been completed");
      }

      throw error;
    }

    await eventPublisher.publishToEventLog("project_selesai", {
      clientId: completion.clientId,
      studentId: completion.studentId,
      completedBy: completion.completedBy,
      status: completion.status,
      completedAt: completion.completedAt,
    });

    return completion;
  } finally {
    try {
      await releaseLock(lockKey, lockValue);
    } catch (error) {
      console.warn(
        `[project-completion] failed to release redis lock ${lockKey}: ${error.message}`,
      );
    }
  }
}

module.exports = {
  completeProject,
};
