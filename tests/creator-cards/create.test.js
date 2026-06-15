const { expect } = require('chai');
const createMockServer = require('@app-core/mock-server');
const { MockModelStubs } = require('@app/mock-models');

const server = createMockServer(['endpoints/creator-cards/create.js']);

describe('POST /creator-cards', () => {
  let stub;

  afterEach(() => {
    if (stub) {
      stub.revert();
      stub = null;
    }
  });

  it('creates a public draft card and returns id, no access_code', async () => {
    stub = MockModelStubs.CreatorCard.configureStubs({ method: 'findOne', mockNull: true });

    const response = await server.post('/creator-cards', {
      body: {
        title: 'My Test Card',
        description: 'A description here',
        creator_reference: '12345678901234567890',
        status: 'draft',
      },
    });

    expect(response.statusCode).to.equal(200);
    expect(response.data.status).to.equal('success');
    expect(response.data.data).to.have.property('id');
    expect(response.data.data.slug).to.be.a('string');
    expect(response.data.data.status).to.equal('draft');
    expect(response.data.data.access_type).to.equal('public');
    expect(response.data.data).to.not.have.property('access_code');
  });

  it('creates a private published card and returns access_code', async () => {
    stub = MockModelStubs.CreatorCard.configureStubs({ method: 'findOne', mockNull: true });

    const response = await server.post('/creator-cards', {
      body: {
        title: 'Private Card',
        creator_reference: '12345678901234567890',
        status: 'published',
        access_type: 'private',
        access_code: 'ABC123',
      },
    });

    expect(response.statusCode).to.equal(200);
    expect(response.data.data.access_code).to.equal('ABC123');
    expect(response.data.data.access_type).to.equal('private');
  });

  it('uses client-provided slug when unique', async () => {
    stub = MockModelStubs.CreatorCard.configureStubs({ method: 'findOne', mockNull: true });

    const response = await server.post('/creator-cards', {
      body: {
        title: 'Test Card',
        slug: 'custom-slug',
        creator_reference: '12345678901234567890',
        status: 'draft',
      },
    });

    expect(response.statusCode).to.equal(200);
    expect(response.data.data.slug).to.equal('custom-slug');
  });

  it('returns 400 when required field creator_reference is missing', async () => {
    const response = await server.post('/creator-cards', {
      body: { title: 'Test', status: 'draft' },
    });

    expect(response.statusCode).to.equal(400);
    expect(response.data.status).to.equal('error');
  });

  it('returns 400 when status is invalid', async () => {
    const response = await server.post('/creator-cards', {
      body: {
        title: 'Test Card',
        creator_reference: '12345678901234567890',
        status: 'pending',
      },
    });

    expect(response.statusCode).to.equal(400);
  });

  it('returns SL02 (400) when provided slug is already taken', async () => {
    // Default findOne stub returns a document — simulates slug exists
    const response = await server.post('/creator-cards', {
      body: {
        title: 'Test Card',
        slug: 'taken-slug',
        creator_reference: '12345678901234567890',
        status: 'draft',
      },
    });

    expect(response.statusCode).to.equal(400);
    expect(response.data.code).to.equal('SL02');
  });

  it('returns AC01 (400) when access_type is private and access_code is missing', async () => {
    stub = MockModelStubs.CreatorCard.configureStubs({ method: 'findOne', mockNull: true });

    const response = await server.post('/creator-cards', {
      body: {
        title: 'Private Card',
        creator_reference: '12345678901234567890',
        status: 'published',
        access_type: 'private',
      },
    });

    expect(response.statusCode).to.equal(400);
    expect(response.data.code).to.equal('AC01');
  });

  it('returns AC05 (400) when access_type is public and access_code is set', async () => {
    stub = MockModelStubs.CreatorCard.configureStubs({ method: 'findOne', mockNull: true });

    const response = await server.post('/creator-cards', {
      body: {
        title: 'Public Card',
        creator_reference: '12345678901234567890',
        status: 'published',
        access_type: 'public',
        access_code: 'ABC123',
      },
    });

    expect(response.statusCode).to.equal(400);
    expect(response.data.code).to.equal('AC05');
  });
});
