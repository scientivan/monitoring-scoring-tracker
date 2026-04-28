const assessmentRepository = require("../repositories/assessment_repo");
const eventPublisher = require("./event_publisher");
const nftService = require("./nft_service");
const { notFoundError, validationError } = require("../core/api_error");

function requireString(value, fieldName) {
  if (!value || typeof value !== "string" || !value.trim()) {
    throw validationError(`Field '${fieldName}' is required`);
  }
}

function createAssessment(payload = {}) {
  requireString(payload.teamId, "teamId");
  requireString(payload.graderId, "graderId");

  if (typeof payload.finalScore !== "number" || payload.finalScore < 0) {
    throw validationError("Field 'finalScore' must be a number greater than or equal to 0");
  }

  return assessmentRepository.createAssessment({
    teamId: payload.teamId.trim(),
    graderId: payload.graderId.trim(),
    scoreArchitecture: payload.scoreArchitecture,
    scoreImplementation: payload.scoreImplementation,
    scoreDocumentation: payload.scoreDocumentation,
    scorePresentation: payload.scorePresentation,
    finalScore: payload.finalScore,
    notes: typeof payload.notes === "string" ? payload.notes.trim() : null,
    walletAddress:
      typeof payload.walletAddress === "string" ? payload.walletAddress.trim() : null,
  });
}

function listAssessmentsByTeam(teamId) {
  requireString(teamId, "teamId");
  return assessmentRepository.listAssessmentsByTeam(teamId.trim());
}

function lockAssessment(id) {
  requireString(id, "id");

  const lockedAssessment = assessmentRepository.lockAssessment(id.trim());

  if (!lockedAssessment) {
    throw notFoundError(`Assessment with id '${id}' was not found`);
  }

  const publishedEvent = eventPublisher.publish("nilai_final_dikunci", {
    assessmentId: lockedAssessment.id,
    teamId: lockedAssessment.teamId,
    finalScore: lockedAssessment.finalScore,
  });

  const nftRecord = nftService.createMockNftFromAssessment(lockedAssessment);

  return {
    assessment: lockedAssessment,
    event: publishedEvent,
    nft: nftRecord,
  };
}

module.exports = {
  createAssessment,
  listAssessmentsByTeam,
  lockAssessment,
};
