function doGet() {
  return HtmlService.createTemplateFromFile('index').evaluate();
}

function getGreeting(name) {
  return 'Hello, ' + name + '! The time is ' + new Date().toISOString();
}
