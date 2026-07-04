function decodeGreeting(encoded) {
  const bytes = Utilities.base64Decode(encoded);
  return String.fromCharCode.apply(null, bytes);
}

function getMyTimeZone() {
  return Session.getScriptTimeZone();
}
