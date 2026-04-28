const events = [];

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

module.exports = {
  publish,
  listEvents,
};
