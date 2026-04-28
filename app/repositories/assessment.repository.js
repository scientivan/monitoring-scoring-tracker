const assessments = [];
let nextId = 1;

function createAssessment(payload) {
  const assessment = {
    id: nextId++,
    assessor: payload.assessor,
    score: payload.score,
    status: "draft",
  };

  assessments.push(assessment);

  return assessment;
}

function listAssessments() {
  return [...assessments];
}

module.exports = {
  createAssessment,
  listAssessments,
};
