'use client'

import { useEffect, useState } from 'react'
import { useIsClient } from '@/hooks/useIsClient'
import Link from 'next/link'
import { Navbar, Menu } from '@worldresources/wri-design-systems'
import { useParams, usePathname, useRouter } from 'next/navigation'
import { useLanguage } from '@/contexts/LanguageContext'
import { externalLinks } from '@/constants/external-links'
import { useTranslations } from '@/i18n/useTranslations'
import { HostedByWri } from '@/components/HostedByWri'

export default function GlobalNavbar() {
  const { language, setLanguage } = useLanguage()
  const pathname = usePathname()
  const mounted = useIsClient()
  const t = useTranslations()
  const router = useRouter()
  const [isPasswordPromptShown, setIsPasswordPromptShown] = useState(false)
  const { id } = useParams()
  const [assessmentTitle, setAssessmentTitle] = useState<string | null>(null)

  const languageOptions = [
    { label: t('navigation.languages.en'), value: 'en' },
    { label: t('navigation.languages.es'), value: 'es' },
    { label: t('navigation.languages.fr'), value: 'fr' },
    { label: t('navigation.languages.pt'), value: 'pt' },
  ]

  useEffect(() => {
    const passwordPromptForm = document.getElementById('password-prompt-form')
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsPasswordPromptShown(!!passwordPromptForm)
  }, [pathname])

  useEffect(() => {
    const getAssessmentName = async () => {
      if (!id) return

      const dataJson = await fetch(`/api/assessments/${id}`)
      const data = await dataJson.json()
      setAssessmentTitle(data?.assessmentTitle || '')
    }

    getAssessmentName()
  }, [id])

  if (!mounted) return <div className='h-12' />

  // Validate paths like /assessment/23677c38-c425-47ac-ba1d-019d228ece99
  const isAssessmentPage =
    /^\/assessment\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/?$/i.test(
      pathname,
    )

  const isHomePage = pathname === '/'
  const showStartDiagnosticButton =
    isHomePage || (isAssessmentPage && isPasswordPromptShown)

  const utilitySection = [
    <Link key='contact-link' href={externalLinks.contactLink} target='_blank'>
      {t('navigation.contact')}
    </Link>,
  ]

  if (!isHomePage) {
    utilitySection.push(
      <Link key='about-link' href='/'>
        {t('navigation.about')}
      </Link>,
    )
  }

  utilitySection.push(
    <Menu
      key='language-menu'
      label={
        languageOptions?.find((l) => l.value === language)?.label ||
        t('navigation.languageMenu')
      }
      items={languageOptions}
      onSelect={setLanguage}
    />,
    <HostedByWri key='hosted-by-wri-menu' />,
  )

  return (
    <Navbar
      pathname={pathname}
      linkRouter={Link}
      logo={
        <div className='flex flex-col items-start'>
          <span className='font-bold text-lg text-neutral-800'>
            {t('navigation.brand')}
          </span>
          <span className='text-sm text-neutral-700 -mt-[6px]'>
            {!showStartDiagnosticButton ? assessmentTitle : ''}
          </span>
        </div>
      }
      navigationSection={[]}
      utilitySection={utilitySection}
      actionsSection={
        showStartDiagnosticButton
          ? [
              {
                ariaLabel: t('home.hero.ctaButton'),
                children: t('home.hero.ctaButton'),
                size: 'small',
                onClick: () => {
                  router.push('/assessment/setup')
                },
              },
            ]
          : []
      }
    />
  )
}
