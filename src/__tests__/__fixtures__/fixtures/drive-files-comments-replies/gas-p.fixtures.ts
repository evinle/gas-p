import { defineGasPFixtures } from '../../../../core/fixtures.js';

export default defineGasPFixtures({
  Drive: {
    Files: {
      Comments: {
        Replies: {
          get: () => ({ id: 'reply-fixture' }),
        },
      },
    },
  },
});
