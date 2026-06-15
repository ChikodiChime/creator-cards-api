const { expect } = require('chai');
const createMockServer = require('@app-core/mock-server');
const { MockModelStubs } = require('@app/mock-models');

const server = createMockServer(['endpoints/creator-cards/delete.js']);

describe('DELETE /creator-cards/:slug', () => {
  let stub;

  afterEach(() => {
    if (stub) {
      stub.revert();
      stub = null;
    }
  });

  it('soft-deletes a card and returns it with a deleted timestamp', async () => {
    // Default findOne stub returns a card document
    const response = await server.delete('/creator-cards/test-slug', {
      body: { creator_reference: '12345678901234567890' },
    });

    expect(response.statusCode).to.equal(200);
    expect(response.data.status).to.equal('success');
    expect(response.data.data).to.have.property('id');
    expect(response.data.data.deleted).to.be.a('number');
  });

  it('returns NF01 (404) when slug does not exist', async () => {
    stub = MockModelStubs.CreatorCard.configureStubs({ method: 'findOne', mockNull: true });

    const response = await server.delete('/creator-cards/no-such-slug', {
      body: { creator_reference: '12345678901234567890' },
    });

    expect(response.statusCode).to.equal(404);
    expect(response.data.code).to.equal('NF01');
  });

  it('returns 400 when creator_reference is missing', async () => {
    const response = await server.delete('/creator-cards/test-slug', {
      body: {},
    });

    expect(response.statusCode).to.equal(400);
  });

  it('returns 400 when creator_reference is not 20 characters', async () => {
    const response = await server.delete('/creator-cards/test-slug', {
      body: { creator_reference: 'tooshort' },
    });

    expect(response.statusCode).to.equal(400);
  });
});
