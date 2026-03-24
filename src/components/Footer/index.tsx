'use client'

import Link from 'next/link'
import Image from 'next/image'
import { getThemedColor, Footer as WriFooter } from '@worldresources/wri-design-systems'
import { externalLinks } from '@/constants/external-links'
import { useTranslations } from '@/i18n/useTranslations'
import { Box } from '@chakra-ui/react'
import { useEffect, useState } from 'react'

const partnerLogos = [
  <Image 
    key="partner-1"
    src="/images/IUCN-logo.png" 
    alt="Assessment Partner" 
    width={32}
    height={32}
    priority // Preload the image
  />
];

export const Footer = () => {
  const [isClient, setIsClient] = useState(false)
  const t = useTranslations();

  // Ensure translations are consistent
  const privacyPolicy = t('common.footer.privacyPolicy');
  const termsOfService = t('common.footer.termsOfService');

  // Prevent hydration mismatch - Navbar has responsive logic that checks window dimensions
  useEffect(() => {
    setIsClient(true)
  }, [])


  if (!isClient) return <div className='h-12' />

  return (
    <Box css={{
      '& > Footer': {
        backgroundColor: getThemedColor('neutral', 100),
        zIndex: 99,
      }
    }}>
      <WriFooter filled additionalLogos={partnerLogos}>
        <Link rel='noopener noreferrer' href={externalLinks.privacy} target="_blank">
          {privacyPolicy}
        </Link>
        <Link rel='noopener noreferrer' href={externalLinks.tos} target='_blank'>
          {termsOfService}
        </Link>
      </WriFooter>
    </Box>
  );
};