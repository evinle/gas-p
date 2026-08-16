import { defineGasPFixtures } from '../../../../core/fixtures.js';

export default defineGasPFixtures({
  Sheets: {
    Spreadsheets: {
      Values: {
        get: () => ({ values: [['fixture']] }),
      },
    },
  },
});
