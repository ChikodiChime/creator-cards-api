const swaggerJsdoc = require('swagger-jsdoc');

const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Creator Card API',
      version: '1.0.0',
      description: 'POST/GET/DELETE endpoints for creator cards.',
    },
    servers: [{ url: '/' }],
  },
  apis: ['./docs/openapi/*.js'],
});

module.exports = swaggerSpec;
