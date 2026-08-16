import { defineGasPFixtures } from '../../../../core/fixtures.js';

export default defineGasPFixtures({
  Calendar: {
    Events: {
      patch: () => ({ id: 'evt-fixture' }),
    },
  },
});
