var counter = 0;

function doGet(e) {
  counter++;
  return HtmlService.createTemplateFromFile('index').evaluate();
}
