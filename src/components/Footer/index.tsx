'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Footer as WriFooter } from '@worldresources/wri-design-systems'

const partnerLogos = [
  <Image 
    key="partner-1"
    src="/images/IUCN-logo.png" 
    alt="Assessment Partner" 
    width={32}
    height={32}
  />
]


export const Footer = () => {
  return (
    <WriFooter maxWidth={1440} filled additionalLogos={partnerLogos}>
      <Link href={'#'}>Privacy policy</Link>
      <Link href={'#'}>Terms of service</Link>
    </WriFooter>
  )
}
