'use client'

import BundlePurchaseButton from './BundlePurchaseButton'
import { BUNDLES } from '@/lib/bundles'

// Legacy component - now uses the new BundlePurchaseButton with Standard 3-Pack config
export default function BuyThreePackButton() {
  const bundle = BUNDLES.STANDARD_3_PACK

  return (
    <BundlePurchaseButton
      bundleType={bundle.bundleType}
      serviceType={bundle.serviceType}
      credits={bundle.credits}
      price={bundle.price}
      name={bundle.name}
      description={bundle.description}
      buttonText={bundle.buttonText}
    />
  )
}
