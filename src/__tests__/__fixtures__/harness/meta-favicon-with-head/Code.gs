function doGet() {
  return HtmlService.createHtmlOutput('<html><head></head><body><p>hi</p></body></html>')
    .addMetaTag('viewport', 'width=device-width')
    .setFaviconUrl('https://example.com/icon.png');
}
