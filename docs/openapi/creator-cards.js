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
 *           examples:
 *             publicDraftCard:
 *               summary: Public draft card (no access_code)
 *               value:
 *                 title: My Test Card
 *                 description: A description here
 *                 slug: my-test-card
 *                 creator_reference: '12345678901234567890'
 *                 links:
 *                   - title: Portfolio
 *                     url: https://example.com/portfolio
 *                   - title: Instagram
 *                     url: https://instagram.com/example
 *                 service_rates:
 *                   currency: USD
 *                   rates:
 *                     - name: Logo Design
 *                       description: Custom logo with 3 revisions
 *                       amount: 150
 *                     - name: Brand Strategy Session
 *                       description: 1-hour consultation
 *                       amount: 75
 *                 status: draft
 *                 access_type: public
 *             privatePublishedCard:
 *               summary: Private published card (access_code required)
 *               value:
 *                 title: Private Card
 *                 description: Members-only rate card
 *                 slug: private-card
 *                 creator_reference: '12345678901234567890'
 *                 links:
 *                   - title: Website
 *                     url: https://example.com
 *                 service_rates:
 *                   currency: NGN
 *                   rates:
 *                     - name: Consultation
 *                       description: 30-minute call
 *                       amount: 5000
 *                 status: published
 *                 access_type: private
 *                 access_code: ABC123
 *     responses:
 *       200:
 *         description: Card created successfully.
 *       400:
 *         description: Validation error (e.g. AC01 missing access_code, AC05 unexpected access_code, SL02 slug taken).
 *
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
 *   delete:
 *     summary: Soft-delete a creator card
 *     tags: [Creator Cards]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         example: test-slug
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
 *           example:
 *             creator_reference: '12345678901234567890'
 *     responses:
 *       200:
 *         description: Card soft-deleted; response includes a deleted timestamp.
 *       400:
 *         description: Validation error (e.g. creator_reference missing or wrong length).
 *       404:
 *         description: NF01 slug not found, or creator_reference does not match the card's owner.
 */
