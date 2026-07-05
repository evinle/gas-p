function doGet() {
  return HtmlService.createTemplate('<p>Hello, <?= "World" ?>!</p>').evaluate();
}
