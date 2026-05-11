const events = [];
const eventLogRepository = require("../repositories/event_log_repo");

function publish(eventName, payload) {
  const event = {
    id: `event-${events.length + 1}`,
    eventName,
    payload,
    status: "pending",
    publishedAt: new Date().toISOString(),
  };

  events.push(event);

  return event;
}

function listEvents() {
  return [...events];
}

async function publishToEventLog(eventType, payload) {
  return eventLogRepository.createEventLog({
    eventType,
    payload,
    status: "pending",
  });
}

module.exports = {
  publish,
  listEvents,
  publishToEventLog,
};
