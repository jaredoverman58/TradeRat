// Bundle configuration constants
// All 7 evaluation bundle purchase options

export interface BundleConfig {
  bundleType: 'standard_3_pack' | 'standard_5_pack' | 'rat_rate_3_pack' | 'rat_rate_5_pack'
  serviceType: 'accept_decline' | 'counter_offer' | 'bundle' | 'trade_finder'
  credits: number
  price: number // in dollars
  name: string
  description: string
  buttonText: string
}

export const BUNDLES = {
  // Single-credit standalone Accept/Decline
  ACCEPT_DECLINE_STANDARD: {
    bundleType: 'standard_3_pack',
    serviceType: 'accept_decline',
    credits: 1,
    price: 3.99,
    name: 'Accept/Decline Standard',
    description: 'Single accept or decline recommendation by standard analyst',
    buttonText: 'Buy Standard — $3.99',
  } as BundleConfig,

  ACCEPT_DECLINE_RAT_RATE: {
    bundleType: 'rat_rate_3_pack',
    serviceType: 'accept_decline',
    credits: 1,
    price: 4.99,
    name: 'Accept/Decline Rat Rate',
    description: 'Single accept or decline recommendation personally reviewed by The Rat',
    buttonText: 'Buy Rat Rate — $4.99',
  } as BundleConfig,

  // Multi-credit Accept/Decline bundles
  STANDARD_3_PACK: {
    bundleType: 'standard_3_pack',
    serviceType: 'accept_decline',
    credits: 3,
    price: 9.99,
    name: '3-Pack Standard Evaluations',
    description: '3 expert trade evaluations by any available analyst',
    buttonText: 'Buy 3-Pack — $9.99',
  } as BundleConfig,

  RAT_RATE_3_PACK: {
    bundleType: 'rat_rate_3_pack',
    serviceType: 'accept_decline',
    credits: 3,
    price: 12.99,
    name: '3-Pack Rat Rate Evaluations',
    description: '3 expert trade evaluations personally reviewed by The Rat',
    buttonText: 'Buy 3-Pack Rat Rate — $12.99',
  } as BundleConfig,

  STANDARD_5_PACK: {
    bundleType: 'standard_5_pack',
    serviceType: 'accept_decline',
    credits: 5,
    price: 16.99,
    name: '5-Pack Standard Evaluations',
    description: '5 expert trade evaluations by any available analyst',
    buttonText: 'Buy 5-Pack — $16.99',
  } as BundleConfig,

  RAT_RATE_5_PACK: {
    bundleType: 'rat_rate_5_pack',
    serviceType: 'accept_decline',
    credits: 5,
    price: 21.99,
    name: '5-Pack Rat Rate Evaluations',
    description: '5 expert trade evaluations personally reviewed by The Rat',
    buttonText: 'Buy 5-Pack Rat Rate — $21.99',
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
    price: 5.49,
    name: 'Counter Offer Standard',
    description: 'Expert counter offer suggestion by standard analyst',
    buttonText: 'Buy Counter Offer — $5.49',
  } as BundleConfig,

  COUNTER_OFFER_RAT_RATE: {
    bundleType: 'rat_rate_3_pack',
    serviceType: 'counter_offer',
    credits: 1,
    price: 6.49,
    name: 'Counter Offer Rat Rate',
    description: 'Expert counter offer suggestion personally reviewed by The Rat',
    buttonText: 'Buy Counter Offer Rat Rate — $6.49',
  } as BundleConfig,
}
