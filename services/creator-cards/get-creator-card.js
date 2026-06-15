const validator = require('@app-core/validator');
const { throwAppError } = require('@app-core/errors');
const { appLogger } = require('@app-core/logger');
const Messages = require('@app/messages/creator-card');
const CreatorCardRepository = require('@app/repository/creator-card');
const formatCard = require('./format-card');

const getSpec = `root {
  slug string<trim|minLength:5|maxLength:50>
  access_code? string<trim|length:6>
}`;

const parsedGetSpec = validator.parse(getSpec);

async function getCreatorCard(serviceData) {
  let response;
  const data = validator.validate(serviceData, parsedGetSpec);

  try {
    const card = await CreatorCardRepository.findOne({
      query: { slug: data.slug, deleted: null },
    });

    if (!card) {
      throwAppError(Messages.CARD_NOT_FOUND, 'NF01');
    }

    if (card.status === 'draft') {
      throwAppError(Messages.CARD_NOT_FOUND, 'NF02');
    }

    if (card.access_type === 'private') {
      if (!data.access_code) {
        throwAppError(Messages.ACCESS_CODE_MISSING, 'AC03');
      }
      if (data.access_code !== card.access_code) {
        throwAppError(Messages.ACCESS_CODE_INVALID, 'AC04');
      }
    }

    response = formatCard(card, { includeAccessCode: false });
  } catch (error) {
    appLogger.errorX(error, 'get-creator-card-error');
    throw error;
  }

  return response;
}

module.exports = getCreatorCard;
