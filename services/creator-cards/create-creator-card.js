const validator = require('@app-core/validator');
const { throwAppError } = require('@app-core/errors');
const { appLogger } = require('@app-core/logger');
const { randomBytes } = require('@app-core/randomness');
const Messages = require('@app/messages/creator-card');
const CreatorCardRepository = require('@app/repository/creator-card');
const formatCard = require('./format-card');

const createSpec = `root {
  title string<trim|minLength:3|maxLength:100>
  description? string<trim|maxLength:500>
  slug? string<trim|minLength:5|maxLength:50>
  creator_reference string<trim|length:20>
  links[]? {
    title string<trim|minLength:1|maxLength:100>
    url string<trim|maxLength:200>
  }
  service_rates? {
    currency string(NGN|USD|GBP|GHS)
    rates[] {
      name string<trim|minLength:3|maxLength:100>
      description? string<trim|maxLength:250>
      amount number<min:1>
    }
  }
  status string(draft|published)
  access_type? string(public|private)
  access_code? string<trim>
}`;

const parsedCreateSpec = validator.parse(createSpec);

const SLUG_CHAR_REGEX = /^[a-zA-Z0-9_-]+$/;
const ACCESS_CODE_REGEX = /^[a-zA-Z0-9]{6}$/;
const URL_REGEX = /^https?:\/\/.+/i;

function buildSlugFromTitle(title) {
  return title
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9_-]/g, '');
}

function generateSlugSuffix() {
  return randomBytes(6);
}

async function createCreatorCard(serviceData) {
  let response;
  const data = validator.validate(serviceData, parsedCreateSpec);

  try {
    const accessType = data.access_type || 'public';

    if (accessType === 'private' && !data.access_code) {
      throwAppError(Messages.ACCESS_CODE_REQUIRED, 'AC01');
    }

    if (accessType === 'public' && data.access_code) {
      throwAppError(Messages.ACCESS_CODE_NOT_ALLOWED, 'AC05');
    }

    if (data.access_code && !ACCESS_CODE_REGEX.test(data.access_code)) {
      throwAppError(Messages.INVALID_ACCESS_CODE_FORMAT, 'INVLDDATA');
    }

    if (data.links) {
      const invalidLink = data.links.find((link) => !URL_REGEX.test(link.url));
      if (invalidLink) {
        throwAppError(Messages.INVALID_URL, 'INVLDDATA');
      }
    }

    if (data.service_rates) {
      const { rates } = data.service_rates;
      if (!rates || rates.length === 0) {
        throwAppError(Messages.RATES_REQUIRED, 'INVLDDATA');
      }
    }

    let { slug } = data;

    if (slug) {
      if (!SLUG_CHAR_REGEX.test(slug)) {
        throwAppError(Messages.INVALID_SLUG_FORMAT, 'INVLDDATA');
      }
      const existing = await CreatorCardRepository.findOne({
        query: { slug },
      });
      if (existing) {
        throwAppError(Messages.SLUG_TAKEN, 'SL02');
      }
    } else {
      const baseSlug = buildSlugFromTitle(data.title).slice(0, 50);

      if (baseSlug.length < 5) {
        slug = `${baseSlug}-${generateSlugSuffix()}`;
      } else {
        const existing = await CreatorCardRepository.findOne({
          query: { slug: baseSlug },
        });
        slug = existing ? `${baseSlug.slice(0, 43)}-${generateSlugSuffix()}` : baseSlug;
      }
    }

    const cardData = {
      title: data.title,
      description: data.description || null,
      slug,
      creator_reference: data.creator_reference,
      links: data.links || [],
      service_rates: data.service_rates || null,
      status: data.status,
      access_type: accessType,
      access_code: data.access_code || null,
      deleted: null,
    };

    const created = await CreatorCardRepository.create(cardData);
    response = formatCard(created);
  } catch (error) {
    if (error.errorCode === 'DUPLICATE_RECORD' || error.code === 11000) {
      throwAppError(Messages.SLUG_TAKEN, 'SL02');
    }
    appLogger.errorX(error, 'create-creator-card-error');
    throw error;
  }

  return response;
}

module.exports = createCreatorCard;
