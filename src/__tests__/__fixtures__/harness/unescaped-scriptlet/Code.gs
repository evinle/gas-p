var greeting = '<b>World</b>';

function doGet(e) {
  return HtmlService.createTemplateFromFile('index').evaluate();
}
