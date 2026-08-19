// Bundle configuration constants
// All 7 evaluation bundle purchase options

export interface BundleConfig {
  bundleType: 'standard_3_pack' | 'standard_5_pack' | 'rat_rate_3_pack' | 'rat_rate_5_pack'
  serviceType: 'accept_decline' | 'counter_offer' | 'bundle'
  credits: number
  price: number // in dollars
  name: string
  description: string
  buttonText: string
}

export const BUNDLES = {
  // Multi-credit Accept/Decline bundles
  STANDARD_3_PACK: {
    bundleType: 'standard_3_pack',
    serviceType: 'accept_decline',
    credits: 3,
    price: 12.99,
    name: '3-Pack Standard Evaluations',
    description: '3 expert trade evaluations by any available analyst',
    buttonText: 'Buy 3-Pack — $12.99',
  } as BundleConfig,

  RAT_RATE_3_PACK: {
    bundleType: 'rat_rate_3_pack',
    serviceType: 'accept_decline',
    credits: 3,
    price: 14.99,
    name: '3-Pack Rat Rate Evaluations',
    description: '3 expert trade evaluations personally reviewed by The Rat',
    buttonText: 'Buy 3-Pack Rat Rate — $14.99',
  } as BundleConfig,

  STANDARD_5_PACK: {
    bundleType: 'standard_5_pack',
    serviceType: 'accept_decline',
    credits: 5,
    price: 19.99,
    name: '5-Pack Standard Evaluations',
    description: '5 expert trade evaluations by any available analyst',
    buttonText: 'Buy 5-Pack — $19.99',
  } as BundleConfig,

  RAT_RATE_5_PACK: {
    bundleType: 'rat_rate_5_pack',
    serviceType: 'accept_decline',
    credits: 5,
    price: 24.99,
    name: '5-Pack Rat Rate Evaluations',
    description: '5 expert trade evaluations personally reviewed by The Rat',
    buttonText: 'Buy 5-Pack Rat Rate — $24.99',
  } as BundleConfig,

  // Single-credit bundles with bonus service
  ACCEPT_DECLINE_BONUS_STANDARD: {
    bundleType: 'standard_3_pack',
    serviceType: 'bundle',
    credits: 1,
    price: 8.99,
    name: 'Accept/Decline + Bonus Standard',
    description: 'Accept/Decline evaluation with bonus service by standard analyst',
    buttonText: 'Buy Bundle — $8.99',
  } as BundleConfig,

  ACCEPT_DECLINE_BONUS_RAT_RATE: {
    bundleType: 'rat_rate_3_pack',
    serviceType: 'bundle',
    credits: 1,
    price: 10.99,
    name: 'Accept/Decline + Bonus Rat Rate',
    description: 'Accept/Decline evaluation with bonus service personally reviewed by The Rat',
    buttonText: 'Buy Bundle Rat Rate — $10.99',
  } as BundleConfig,

  // Single-credit Counter Offer standalone
  COUNTER_OFFER_STANDARD: {
    bundleType: 'standard_3_pack',
    serviceType: 'counter_offer',
    credits: 1,
    price: 5.99,
    name: 'Counter Offer Standard',
    description: 'Expert counter offer suggestion by standard analyst',
    buttonText: 'Buy Counter Offer — $5.99',
  } as BundleConfig,

  COUNTER_OFFER_RAT_RATE: {
    bundleType: 'rat_rate_3_pack',
    serviceType: 'counter_offer',
    credits: 1,
    price: 6.99,
    name: 'Counter Offer Rat Rate',
    description: 'Expert counter offer suggestion personally reviewed by The Rat',
    buttonText: 'Buy Counter Offer Rat Rate — $6.99',
  } as BundleConfig,
}
