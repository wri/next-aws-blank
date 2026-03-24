'use client';

import { GoogleTagManager as NextGoogleTagManager  } from '@next/third-parties/google'
import Script from 'next/script'

export function GoogleTagManager() {
  const gtmId = 'GTM-PWXZMLPL'

  return (
    <>
      <NextGoogleTagManager gtmId={gtmId} />
      {/* Add the Plausible script dynamically */}
      <Script
        src="https://plausible.io/js/plausible.js"
        strategy="afterInteractive"
      />
    </>
  )
}
