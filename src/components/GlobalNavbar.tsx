'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Source_Serif_4 } from 'next/font/google'
import { Navbar, Menu } from '@worldresources/wri-design-systems'
import { WriLogoIcon } from '@/components/icons'
import { languageOptions } from '@/constants/language-options'
import { usePathname } from 'next/navigation'
import { useLanguage } from '@/contexts/LanguageContext'

const sourceSerif4 = Source_Serif_4({
  subsets: ['latin'],
  weight: ['600'],
})

export default function GlobalNavbar() {
  const { language, setLanguage } = useLanguage()
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch - Navbar has responsive logic that checks window dimensions
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

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
            Restoration Diagnostic
          </span>
        </div>
      }
      navigationSection={[]}
      utilitySection={[
        <Menu
          key='language-menu'
          label={
            languageOptions?.find((l) => l.value === language)?.label ||
            'Language'
          }
          items={languageOptions}
          onSelect={setLanguage}
        />,
      ]}
      actionsSection={[]}
      maxWidth={1440}
      fixed
    />
  )
}
