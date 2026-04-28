function publish(eventName, payload) {
  return {
    eventName,
    payload,
    status: "not_implemented",
  };
}

module.exports = {
  publish,
};
