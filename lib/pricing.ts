import { PackageType, ExpertTier } from '@/types/database.types'

export interface PricingTier {
  id: PackageType
  name: string
  price: number
  credits: number
  expertTier: ExpertTier
  requestType: 'trade_evaluation' | 'trade_finder'
  description: string
  popular?: boolean
}

// Trade Evaluation Packages (original pricing)
export const tradeEvaluationPricing: PricingTier[] = [
  {
    id: 'free',
    name: 'Free Trial',
    price: 0,
    credits: 1,
    expertTier: 'any',
    requestType: 'trade_evaluation',
    description: 'Basic roster evaluation only (no opponent analysis)',
  },
  {
    id: 'single',
    name: 'Single Trade',
    price: 4.99,
    credits: 1,
    expertTier: 'any',
    requestType: 'trade_evaluation',
    description: 'Evaluate one specific trade offer',
  },
  {
    id: 'single_premium',
    name: 'Single Premium',
    price: 7.99,
    credits: 1,
    expertTier: 'rat_guaranteed',
    requestType: 'trade_evaluation',
    description: 'Guaranteed review by The Trade Rat',
  },
  {
    id: 'bronze',
    name: 'Bronze Package',
    price: 9.99,
    credits: 3,
    expertTier: 'any',
    requestType: 'trade_evaluation',
    description: '3 trade evaluations - Best value',
    popular: true,
  },
  {
    id: 'silver',
    name: 'Silver Package',
    price: 24.99,
    credits: 7,
    expertTier: 'any',
    requestType: 'trade_evaluation',
    description: '7 trade evaluations throughout the season',
  },
  {
    id: 'gold',
    name: 'Gold Package',
    price: 14.99,
    credits: 3,
    expertTier: 'rat_guaranteed',
    requestType: 'trade_evaluation',
    description: '3 premium evaluations from The Rat',
  },
  {
    id: 'platinum',
    name: 'Platinum Package',
    price: 29.99,
    credits: 7,
    expertTier: 'rat_guaranteed',
    requestType: 'trade_evaluation',
    description: '7 premium evaluations from The Rat',
  },
]

// Trade Finder Packages (premium pricing - 75% higher)
export const tradeFinderPricing: PricingTier[] = [
  {
    id: 'finder_single',
    name: 'Single Finder',
    price: 8.99,
    credits: 1,
    expertTier: 'any',
    requestType: 'trade_finder',
    description: 'Get one custom trade suggestion',
  },
  {
    id: 'finder_single_premium',
    name: 'Single Finder Premium',
    price: 13.99,
    credits: 1,
    expertTier: 'rat_guaranteed',
    requestType: 'trade_finder',
    description: 'The Rat creates your trade suggestion',
  },
  {
    id: 'finder_bronze',
    name: 'Bronze Finder Package',
    price: 17.99,
    credits: 3,
    expertTier: 'any',
    requestType: 'trade_finder',
    description: '3 custom trade suggestions',
    popular: true,
  },
  {
    id: 'finder_silver',
    name: 'Silver Finder Package',
    price: 44.99,
    credits: 7,
    expertTier: 'any',
    requestType: 'trade_finder',
    description: '7 custom trade suggestions',
  },
  {
    id: 'finder_gold',
    name: 'Gold Finder Package',
    price: 26.99,
    credits: 3,
    expertTier: 'rat_guaranteed',
    requestType: 'trade_finder',
    description: '3 premium suggestions from The Rat',
  },
  {
    id: 'finder_platinum',
    name: 'Platinum Finder Package',
    price: 52.99,
    credits: 7,
    expertTier: 'rat_guaranteed',
    requestType: 'trade_finder',
    description: '7 premium suggestions from The Rat',
  },
]

export const allPricing = [...tradeEvaluationPricing, ...tradeFinderPricing]

// Helper function to get pricing by ID
export function getPricingById(id: PackageType): PricingTier | undefined {
  return allPricing.find(tier => tier.id === id)
}

// Helper function to format package type for display
export function formatPackageType(packageType: PackageType): string {
  const tier = getPricingById(packageType)
  return tier?.name || packageType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}
