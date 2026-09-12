function doGet() {
  return HtmlService.createHtmlOutput('<body><header class="site-header">Nav</header><p>hi</p></body>').addMetaTag('viewport', 'width=device-width');
}
