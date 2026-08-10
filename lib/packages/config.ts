import { PackageType, ExpertTier } from '@/types/database.types'

export interface PackageConfig {
  credits: number
  price: number // in USD
  expert_tier: ExpertTier
  description: string
  display_name: string
}

export const PACKAGE_CONFIG: Record<PackageType, PackageConfig> = {
  free: {
    credits: 1,
    price: 0,
    expert_tier: 'any',
    description: 'Basic roster evaluation only (no opponent rosters analyzed)',
    display_name: 'Free'
  },
  single: {
    credits: 1,
    price: 4.99,
    expert_tier: 'any',
    description: 'Single trade review based on expert availability',
    display_name: 'Single Review'
  },
  single_premium: {
    credits: 1,
    price: 7.99,
    expert_tier: 'rat_guaranteed',
    description: 'Single trade review guaranteed by The Trade Rat',
    display_name: 'Single Review (Premium)'
  },
  bronze: {
    credits: 3,
    price: 9.99,
    expert_tier: 'any',
    description: '3 trade reviews based on expert availability',
    display_name: 'Bronze Package'
  },
  bronze_premium: {
    credits: 3,
    price: 14.99,
    expert_tier: 'rat_guaranteed',
    description: '3 trade reviews guaranteed by The Trade Rat',
    display_name: 'Bronze Package (Premium)'
  },
  silver: {
    credits: 7,
    price: 24.99,
    expert_tier: 'any',
    description: '7 trade reviews based on expert availability',
    display_name: 'Silver Package'
  },
  silver_premium: {
    credits: 7,
    price: 29.99,
    expert_tier: 'rat_guaranteed',
    description: '7 trade reviews guaranteed by The Trade Rat',
    display_name: 'Silver Package (Premium)'
  },
  // Placeholder for future package types
  gold: {
    credits: 0,
    price: 0,
    expert_tier: 'any',
    description: 'Coming soon',
    display_name: 'Gold Package'
  },
  platinum: {
    credits: 0,
    price: 0,
    expert_tier: 'any',
    description: 'Coming soon',
    display_name: 'Platinum Package'
  }
}

// Helper to get package by type
export function getPackageConfig(type: PackageType): PackageConfig {
  return PACKAGE_CONFIG[type]
}

// Helper to get all active packages (price > 0)
export function getActivePackages(): Array<{ type: PackageType; config: PackageConfig }> {
  return (Object.entries(PACKAGE_CONFIG) as Array<[PackageType, PackageConfig]>)
    .filter(([_, config]) => config.price > 0)
    .map(([type, config]) => ({ type, config }))
}

// Helper to calculate value (credits per dollar)
export function getPackageValue(type: PackageType): number {
  const config = PACKAGE_CONFIG[type]
  if (config.price === 0) return 0
  return config.credits / config.price
}
