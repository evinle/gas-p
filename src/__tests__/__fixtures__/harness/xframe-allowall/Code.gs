function doGet() {
  return HtmlService.createHtmlOutput('<p>hi</p>').setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
