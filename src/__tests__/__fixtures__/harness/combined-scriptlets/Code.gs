var title = 'gas-p & friends';
var rawBadge = '<b>NEW</b>';

function doGet(e) {
  return HtmlService.createTemplateFromFile('index').evaluate();
}
