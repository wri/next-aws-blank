'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Source_Serif_4 } from 'next/font/google'
import { Navbar, Menu } from '@worldresources/wri-design-systems'
import { WriLogoIcon } from '@/components/icons'
import { usePathname } from 'next/navigation'
import { useLanguage } from '@/contexts/LanguageContext'
import { externalLinks } from '@/constants/external-links'
import { useTranslations } from '@/i18n/useTranslations'

const sourceSerif4 = Source_Serif_4({
  subsets: ['latin'],
  weight: ['600'],
})

export default function GlobalNavbar() {
  const { language, setLanguage } = useLanguage()
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const t = useTranslations()

  const languageOptions = [
    { label: t('navigation.languages.en'), value: 'en' },
    { label: t('navigation.languages.es'), value: 'es' },
    { label: t('navigation.languages.fr'), value: 'fr' },
    { label: t('navigation.languages.pt'), value: 'pt' },
  ]

  // Prevent hydration mismatch - Navbar has responsive logic that checks window dimensions
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return <div className='h-12' />

  return (
    <Navbar
      pathname={pathname}
      linkRouter={Link}
      logo={
        <div className='flex items-center gap-7'>
          <WriLogoIcon height='auto' width='120px' />
          <span
            className={`font-semibold text-xl text-neutral-800 ${sourceSerif4.className} hidden sm:block`}
          >
            {t('navigation.brand')}
          </span>
        </div>
      }
      navigationSection={[]}
      utilitySection={[
        <Menu
          key='language-menu'
          label={
            languageOptions?.find((l) => l.value === language)?.label ||
            t('navigation.languageMenu')
          }
          items={languageOptions}
          onSelect={setLanguage}
        />,
        <Link
          key='contact-link'
          href={externalLinks.contactLink}
          target='_blank'
        >
          {t('navigation.contact')}
        </Link>,
      ]}
      actionsSection={[]}
    />
  )
}
