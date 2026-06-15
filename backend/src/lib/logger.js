function log(action, details = {}) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${action}`, JSON.stringify(details));
}

module.exports = { log };
