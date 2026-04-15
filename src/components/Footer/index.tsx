'use client'

import Link from 'next/link'
import Image from 'next/image'
import {
  getThemedColor,
  Footer as WriFooter,
} from '@worldresources/wri-design-systems'
import { externalLinks } from '@/constants/external-links'
import { useTranslations } from '@/i18n/useTranslations'
import { Box } from '@chakra-ui/react'
import { useEffect, useState } from 'react'

export const Footer = () => {
  const [isClient, setIsClient] = useState(false)
  const t = useTranslations()

  // Ensure translations are consistent
  const privacyPolicy = t('common.footer.privacyPolicy')
  const termsOfService = t('common.footer.termsOfService')

  // Prevent hydration mismatch - Navbar has responsive logic that checks window dimensions
  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) return <div className='h-12' />

  return (
    <Box
      css={{
        '& > footer': {
          backgroundColor: getThemedColor('neutral', 200),
          overflow: 'hidden',
          width: '100%',
        },
      }}
    >
      <WriFooter
        fixed
        filled
        additionalLogos={[
          <Image
            key='partner-1'
            src='/images/IUCN-logo.png'
            alt='Assessment Partner'
            width={32}
            height={32}
          />,
          <div key='partners' className='flex items-center'>
            <div className='h-8 w-px bg-neutral-300 ml-1.5 mr-4' />
            <div className='flex items-center gap-2'>
              <p className='text-[10px] text-neutral-700 w-[70px]'>
                {t('common.footer.onlineToolSupportedBy')}
              </p>
              <Image
                src={`/images/ERIP-logo.png`}
                alt='ERIP, GEF and Conservation International logo'
                width={86}
                height={42}
              />
              <div className='h-8 w-px bg-neutral-300 mx-0.5' />
              <Image
                src='/images/CI-logo.png'
                alt='Conservation International logo'
                width={42}
                height={24}
              />
              <div className='h-8 w-px bg-neutral-300 mx-0.5' />
              <Image
                src='/images/GEF-logo.png'
                alt='GEF logo'
                width={42}
                height={24}
              />
            </div>
          </div>,
        ]}
      >
        <Link
          rel='noopener noreferrer'
          href={externalLinks.privacy}
          target='_blank'
        >
          {privacyPolicy}
        </Link>
        <Link
          rel='noopener noreferrer'
          href={externalLinks.tos}
          target='_blank'
        >
          {termsOfService}
        </Link>
      </WriFooter>
    </Box>
  )
}
