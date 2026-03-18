'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Footer as WriFooter } from '@worldresources/wri-design-systems'
import { externalLinks } from '@/constants/external-links'
import { useTranslations } from '@/i18n/useTranslations'

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
  const t = useTranslations()

  return (
    <WriFooter filled additionalLogos={partnerLogos}>
      <Link rel='noopener noreferrer' href={externalLinks.privacy} target="_blank">
        {t('common.footer.privacyPolicy')}
      </Link>
      <Link rel='noopener noreferrer' href={externalLinks.tos} target='_blank'>
        {t('common.footer.termsOfService')}
      </Link>
    </WriFooter>
  )
}
