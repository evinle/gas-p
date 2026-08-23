import { defineGasPFixtures } from '../../../../core/fixtures.js';

export default defineGasPFixtures({
  UrlFetchApp: {
    fetch: (url) => ({ getContentText: () => `fixture:${url}`, getResponseCode: () => 200 }),
    fetchAll: (requests) => requests.map((r) => ({
      getContentText: () => `fixture:${typeof r === 'string' ? r : r.url}`,
      getResponseCode: () => 200,
    })),
  },
});
