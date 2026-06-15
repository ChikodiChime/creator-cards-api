function formatCard(card, { includeAccessCode = true } = {}) {
  const result = {
    id: card._id,
    title: card.title,
    description: card.description ?? null,
    slug: card.slug,
    creator_reference: card.creator_reference,
    links: card.links ?? [],
    service_rates: card.service_rates ?? null,
    status: card.status,
    access_type: card.access_type,
    created: card.created,
    updated: card.updated,
    deleted: card.deleted ?? null,
  };

  if (includeAccessCode && card.access_code) {
    result.access_code = card.access_code;
  }

  return result;
}

module.exports = formatCard;
