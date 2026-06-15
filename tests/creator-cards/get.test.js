const { expect } = require('chai');
const createMockServer = require('@app-core/mock-server');
const { MockModelStubs } = require('@app/mock-models');

const server = createMockServer(['endpoints/creator-cards/get.js']);

describe('GET /creator-cards/:slug', () => {
  let stub;

  afterEach(() => {
    if (stub) {
      stub.revert();
      stub = null;
    }
  });

  it('returns 200 with card data for a public published card', async () => {
    stub = MockModelStubs.CreatorCard.configureStubs({
      method: 'findOne',
      docConfig: { status: 'published', access_type: 'public' },
    });

    const response = await server.get('/creator-cards/test-slug');

    expect(response.statusCode).to.equal(200);
    expect(response.data.status).to.equal('success');
    expect(response.data.data).to.have.property('id');
    expect(response.data.data).to.not.have.property('access_code');
    expect(response.data.data).to.not.have.property('_id');
  });

  it('omits access_code from response for private card with correct code', async () => {
    stub = MockModelStubs.CreatorCard.configureStubs({
      method: 'findOne',
      docConfig: { status: 'published', access_type: 'private', access_code: 'SEC123' },
    });

    const response = await server.get('/creator-cards/test-slug', {
      query: { access_code: 'SEC123' },
    });

    expect(response.statusCode).to.equal(200);
    expect(response.data.data).to.not.have.property('access_code');
  });

  it('returns NF01 (404) when slug does not exist', async () => {
    stub = MockModelStubs.CreatorCard.configureStubs({ method: 'findOne', mockNull: true });

    const response = await server.get('/creator-cards/no-such-slug');

    expect(response.statusCode).to.equal(404);
    expect(response.data.code).to.equal('NF01');
  });

  it('returns NF02 (404) when card is a draft', async () => {
    stub = MockModelStubs.CreatorCard.configureStubs({
      method: 'findOne',
      docConfig: { status: 'draft' },
    });

    const response = await server.get('/creator-cards/draft-slug');

    expect(response.statusCode).to.equal(404);
    expect(response.data.code).to.equal('NF02');
  });

  it('returns AC03 (403) when card is private and no access_code provided', async () => {
    stub = MockModelStubs.CreatorCard.configureStubs({
      method: 'findOne',
      docConfig: { status: 'published', access_type: 'private', access_code: 'SEC123' },
    });

    const response = await server.get('/creator-cards/private-slug');

    expect(response.statusCode).to.equal(403);
    expect(response.data.code).to.equal('AC03');
  });

  it('returns AC04 (403) when card is private and access_code is wrong', async () => {
    stub = MockModelStubs.CreatorCard.configureStubs({
      method: 'findOne',
      docConfig: { status: 'published', access_type: 'private', access_code: 'SEC123' },
    });

    const response = await server.get('/creator-cards/private-slug', {
      query: { access_code: 'WRONG1' },
    });

    expect(response.statusCode).to.equal(403);
    expect(response.data.code).to.equal('AC04');
  });
});
