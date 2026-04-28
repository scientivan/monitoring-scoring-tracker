const logbooks = [];
let nextId = 1;

function createLogbook(payload) {
  const logbook = {
    id: nextId++,
    week: payload.week,
    summary: payload.summary,
    status: "submitted",
  };

  logbooks.push(logbook);

  return logbook;
}

function listLogbooks() {
  return [...logbooks];
}

module.exports = {
  createLogbook,
  listLogbooks,
};
