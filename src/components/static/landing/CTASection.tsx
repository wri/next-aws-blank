'use client'

import { Button } from '@worldresources/wri-design-systems'
import { useRouter } from 'next/navigation'
import { useTranslations } from '@/i18n/useTranslations'
import { CheckIcon } from '@/components/icons'
import { Box } from '@chakra-ui/react'
import { useState } from 'react'
import { OfflineDownloadModal } from './OfflineDownloadModal'

const BENEFITS = ['benefit1', 'benefit2', 'benefit3'] as const

export const CTASection = () => {
  const router = useRouter()
  const t = useTranslations()

  const [showOfflineModal, setShowOfflineModal] = useState(false)

  const downloadButtonHandler = () => {
    setShowOfflineModal(true)
  }

  const [isCTAClicked, setIsCTAClicked] = useState(false);

  const handleCTAClick = () => {
    setIsCTAClicked(true);
    router.push('/assessment/setup')
  }

  return (
    <section className="bg-white py-16 lg:py-24">
      <div className="mx-auto max-w-screen-xl px-4 lg:px-12">
        {/* Main CTA block */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-4">
            {t('home.cta.title')}
          </h2>
          <p className="text-gray-600 text-lg leading-relaxed mb-8">
            {t('home.cta.description')}
          </p>
          <ul className="space-y-3 mb-10 max-w-xl mx-auto text-left">
            {BENEFITS.map((key) => (
              <li key={key} className="flex items-center gap-3">
                <CheckIcon className='text-success-500' />
                <span className="text-gray-700 text-base leading-relaxed">
                  {t(`home.cta.${key}`)}
                </span>
              </li>
            ))}
          </ul>
          <Button
            variant="primary"
            onClick={handleCTAClick}
            loading={isCTAClicked}
          >
            {t('home.cta.ctaButton')}
          </Button>
        </div>

        {/* Complete offline block */}
        <Box className="max-w-2xl mx-auto">
          <div className='my-4 px-4 py-3 border border-neutral-300 rounded-lg bg-white'>
            <div className='flex items-center justify-between gap-4'>
              <div className='flex-1'>
                <h3 className='font-bold text-lg text-neutral-800'>
                  {t('home.cta.offlineTitle')}
                </h3>
                <p className='text-neutral-800'>
                  {t('home.cta.offlineDescription')}
                </p>
              </div>
              <Button
                variant='secondary'
                label={t('home.cta.offlineButton')}
                onClick={downloadButtonHandler}
              />
            </div>
          </div>
        </Box>
      </div>

      <OfflineDownloadModal
        open={showOfflineModal}
        onClose={() => setShowOfflineModal(false)}
      />
    </section>
  )
}
