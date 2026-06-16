const { createHandler } = require('@app-core/server');
const { appLogger } = require('@app-core/logger');
const deleteCreatorCard = require('@app/services/creator-cards/delete-creator-card');

/**
 * @openapi
 * /creator-cards/{slug}:
 *   delete:
 *     summary: Soft-delete a creator card
 *     tags: [Creator Cards]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [creator_reference]
 *             properties:
 *               creator_reference:
 *                 type: string
 *                 minLength: 20
 *                 maxLength: 20
 *     responses:
 *       200:
 *         description: Card soft-deleted; response includes a deleted timestamp.
 *       400:
 *         description: Validation error (e.g. creator_reference missing or wrong length).
 *       404:
 *         description: NF01 slug not found, or creator_reference does not match the card's owner.
 */
module.exports = createHandler({
  path: '/creator-cards/:slug',
  method: 'delete',
  middlewares: [],
  async handler(rc, helpers) {
    const payload = {
      slug: rc.params.slug,
      creator_reference: rc.body.creator_reference,
    };

    const result = await deleteCreatorCard(payload);
    return {
      status: helpers.http_statuses.HTTP_200_OK,
      data: result,
    };
  },
  async onResponseEnd(rc, rs) {
    appLogger.info({ requestContext: rc, response: rs }, 'delete-creator-card-completed');
  },
});
