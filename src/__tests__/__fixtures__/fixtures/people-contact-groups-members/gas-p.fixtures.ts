import { defineGasPFixtures } from '../../../../core/fixtures.js';

export default defineGasPFixtures({
  People: {
    ContactGroups: {
      Members: {
        modify: () => ({ resourceNames: ['people/fixture'] }),
      },
    },
  },
});
