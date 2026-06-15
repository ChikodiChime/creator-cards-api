const validator = require('@app-core/validator');
const { throwAppError } = require('@app-core/errors');
const { appLogger } = require('@app-core/logger');
const Messages = require('@app/messages/creator-card');
const CreatorCardRepository = require('@app/repository/creator-card');
const formatCard = require('./format-card');

const deleteSpec = `root {
  slug string<trim|minLength:5|maxLength:50>
  creator_reference string<trim|length:20>
}`;

const parsedDeleteSpec = validator.parse(deleteSpec);

async function deleteCreatorCard(serviceData) {
  let response;
  const data = validator.validate(serviceData, parsedDeleteSpec);

  try {
    const card = await CreatorCardRepository.findOne({
      query: { slug: data.slug, deleted: null },
    });

    if (!card) {
      throwAppError(Messages.CARD_NOT_FOUND, 'NF01');
    }

    if (card.creator_reference !== data.creator_reference) {
      throwAppError(Messages.CARD_NOT_FOUND, 'NF01');
    }

    const deletedAt = Date.now();

    await CreatorCardRepository.updateOne({
      query: { _id: card._id },
      updateValues: { deleted: deletedAt },
    });

    response = formatCard({ ...card, deleted: deletedAt });
  } catch (error) {
    appLogger.errorX(error, 'delete-creator-card-error');
    throw error;
  }

  return response;
}

module.exports = deleteCreatorCard;
