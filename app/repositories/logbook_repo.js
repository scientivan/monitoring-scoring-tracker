const logbooks = [];
let nextId = 1;

function createLogbook(payload) {
  const logbook = {
    id: `logbook-${nextId++}`,
    teamId: payload.teamId,
    authorId: payload.authorId,
    sprintNumber: payload.sprintNumber || null,
    status: payload.status,
    description: payload.description,
    blockers: payload.blockers || null,
    createdAt: new Date().toISOString(),
  };

  logbooks.push(logbook);

  return logbook;
}

function listLogbooksByTeam(teamId) {
  return logbooks.filter((logbook) => logbook.teamId === teamId);
}

function getLatestLogbookByTeam(teamId) {
  const teamLogbooks = listLogbooksByTeam(teamId);
  return teamLogbooks[teamLogbooks.length - 1] || null;
}

module.exports = {
  createLogbook,
  listLogbooksByTeam,
  getLatestLogbookByTeam,
};
