'use client'

import Link from 'next/link'
import { Footer as WriFooter } from '@worldresources/wri-design-systems'

export const Footer = () => {
  return (
    <WriFooter maxWidth={1440} filled>
      <Link href={'#'}>Privacy policy</Link>
      <Link href={'#'}>Terms of service</Link>
    </WriFooter>
  )
}
