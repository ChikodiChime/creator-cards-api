module.exports = {
  SLUG_TAKEN: 'Slug is already taken',
  ACCESS_CODE_REQUIRED: 'access_code is required for private cards',
  ACCESS_CODE_NOT_ALLOWED: 'access_code must not be set on public cards',
  CARD_NOT_FOUND: 'Creator card not found',
  ACCESS_CODE_MISSING: 'Access code is required to view this card',
  ACCESS_CODE_INVALID: 'Invalid access code',
  INVALID_ACCESS_CODE_FORMAT: 'access_code must be exactly 6 alphanumeric characters',
  INVALID_SLUG_FORMAT: 'slug may only contain alphanumeric characters, hyphens, and underscores',
  INVALID_URL: 'Each link url must be a valid http or https URL',
  RATES_REQUIRED: 'service_rates.rates must be a non-empty array when service_rates is provided',
  INVALID_RATE_AMOUNT:
    'Each service rate amount must be a positive integer in minor units (no decimals, zero, or negatives)',
  UNAUTHORIZED: 'You are not authorized to delete this card',
};
