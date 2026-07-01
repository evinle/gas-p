import { run } from 'gas-p';

await run(() => {
  const res = UrlFetchApp.fetch('https://www.google.com');
  Logger.log(res.getResponseCode());
  Logger.log(res.getContentText());
});
