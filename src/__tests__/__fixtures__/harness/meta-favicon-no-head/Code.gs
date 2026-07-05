function doGet() {
  return HtmlService.createHtmlOutput('<p>hi</p>').addMetaTag('viewport', 'width=device-width');
}
