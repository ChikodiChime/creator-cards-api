const { createHandler } = require('@app-core/server');
const { appLogger } = require('@app-core/logger');
const createCreatorCard = require('@app/services/creator-cards/create-creator-card');

module.exports = createHandler({
  path: '/creator-cards',
  method: 'post',
  middlewares: [],
  async handler(rc, helpers) {
    const result = await createCreatorCard(rc.body);
    return {
      status: helpers.http_statuses.HTTP_200_OK,
      data: result,
    };
  },
  async onResponseEnd(rc, rs) {
    appLogger.info({ requestContext: rc, response: rs }, 'create-creator-card-completed');
  },
});
