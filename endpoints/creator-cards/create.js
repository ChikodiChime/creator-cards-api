const { createHandler } = require('@app-core/server');
const { appLogger } = require('@app-core/logger');
const createCreatorCard = require('@app/services/creator-cards/create-creator-card');

/**
 * @openapi
 * /creator-cards:
 *   post:
 *     summary: Create a creator card
 *     tags: [Creator Cards]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, creator_reference, status]
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 100
 *               description:
 *                 type: string
 *                 maxLength: 500
 *               slug:
 *                 type: string
 *                 minLength: 5
 *                 maxLength: 50
 *                 description: Optional. Auto-generated from title when omitted.
 *               creator_reference:
 *                 type: string
 *                 minLength: 20
 *                 maxLength: 20
 *               links:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     title:
 *                       type: string
 *                     url:
 *                       type: string
 *               service_rates:
 *                 type: object
 *                 properties:
 *                   currency:
 *                     type: string
 *                     enum: [NGN, USD, GBP, GHS]
 *                   rates:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         name:
 *                           type: string
 *                         description:
 *                           type: string
 *                         amount:
 *                           type: number
 *               status:
 *                 type: string
 *                 enum: [draft, published]
 *               access_type:
 *                 type: string
 *                 enum: [public, private]
 *                 default: public
 *               access_code:
 *                 type: string
 *                 description: Required when access_type is private; forbidden when public.
 *     responses:
 *       200:
 *         description: Card created successfully.
 *       400:
 *         description: Validation error (e.g. AC01 missing access_code, AC05 unexpected access_code, SL02 slug taken).
 */
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
