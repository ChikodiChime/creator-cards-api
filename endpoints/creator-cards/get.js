const { createHandler } = require('@app-core/server');
const { appLogger } = require('@app-core/logger');
const getCreatorCard = require('@app/services/creator-cards/get-creator-card');

/**
 * @openapi
 * /creator-cards/{slug}:
 *   get:
 *     summary: Retrieve a creator card by slug
 *     tags: [Creator Cards]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         example: test-slug
 *       - in: query
 *         name: access_code
 *         required: false
 *         schema:
 *           type: string
 *         example: SEC123
 *         description: Required when the card's access_type is private.
 *     responses:
 *       200:
 *         description: Card found and accessible. access_code is never included in the response.
 *       404:
 *         description: NF01 slug not found, or NF02 card is a draft.
 *       403:
 *         description: AC03 access_code missing for a private card, or AC04 access_code incorrect.
 */
module.exports = createHandler({
  path: '/creator-cards/:slug',
  method: 'get',
  middlewares: [],
  async handler(rc, helpers) {
    const payload = {
      slug: rc.params.slug,
      access_code: rc.query.access_code,
    };

    const result = await getCreatorCard(payload);
    return {
      status: helpers.http_statuses.HTTP_200_OK,
      data: result,
    };
  },
  async onResponseEnd(rc, rs) {
    appLogger.info({ requestContext: rc, response: rs }, 'get-creator-card-completed');
  },
});
