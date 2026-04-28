const assessments = [];
let nextId = 1;

function createAssessment(payload) {
  const assessment = {
    id: `assessment-${nextId++}`,
    teamId: payload.teamId,
    graderId: payload.graderId,
    scoreArchitecture: payload.scoreArchitecture || null,
    scoreImplementation: payload.scoreImplementation || null,
    scoreDocumentation: payload.scoreDocumentation || null,
    scorePresentation: payload.scorePresentation || null,
    finalScore: payload.finalScore,
    notes: payload.notes || null,
    walletAddress: payload.walletAddress || null,
    isLocked: false,
    createdAt: new Date().toISOString(),
  };

  assessments.push(assessment);

  return assessment;
}

function getAssessmentById(id) {
  return assessments.find((assessment) => assessment.id === id) || null;
}

function listAssessmentsByTeam(teamId) {
  return assessments.filter((assessment) => assessment.teamId === teamId);
}

function lockAssessment(id) {
  const assessment = getAssessmentById(id);

  if (!assessment) {
    return null;
  }

  assessment.isLocked = true;

  return assessment;
}

module.exports = {
  createAssessment,
  getAssessmentById,
  listAssessmentsByTeam,
  lockAssessment,
};
