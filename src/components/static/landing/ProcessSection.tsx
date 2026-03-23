'use client'

import { useTranslations } from '@/i18n/useTranslations'
import { Button } from '@worldresources/wri-design-systems'
import { useState } from 'react'

const DownloadIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className="w-4 h-4"
    aria-hidden="true"
  >
    <path d="M10.75 2.75a.75.75 0 0 0-1.5 0v8.614L6.295 8.235a.75.75 0 1 0-1.09 1.03l4.25 4.5a.75.75 0 0 0 1.09 0l4.25-4.5a.75.75 0 0 0-1.09-1.03l-2.955 3.129V2.75Z" />
    <path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z" />
  </svg>
)

const STEPS = [
  { key: 'before' as const },
  { key: 'step1' as const },
  { key: 'step2' as const },
  { key: 'step3' as const },
]

export const ProcessSection = () => {
  const t = useTranslations()
  const [isDownloadGuideClicked, setIsDownloadGuideClicked] = useState(false);

  const downloadGuideClickHandler = () => {
    setIsDownloadGuideClicked(true);
    console.log('Download guide (coming soon)')
  }

  return (
    <section className="bg-primary-100 py-16 lg:py-24">
      <div className="mx-auto max-w-screen-xl px-4 lg:px-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-4">
            {t('home.process.title')}
          </h2>
          <p className="text-gray-600 text-base leading-relaxed max-w-2xl mx-auto">
            {t('home.process.description')}
          </p>
        </div>

        {/* Step cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map(({ key }) => {
            const isBefore = key === 'before';
            const headerColor = isBefore ? 'bg-neutral-200' : 'bg-secondary-100';
            return (
            <div
              key={key}
              className="bg-white rounded-lg flex flex-col border border-neutral-400 radius-lg overflow-hidden"
            >
              <div className={`text-xs font-semibold p-2 ${headerColor}`}>
                {t(`home.process.${key}.label`)}
              </div>
              <div className="p-3">
                <h3 className={`text-base font-bold leading-snug`}>
                  {t(`home.process.${key}.title`)}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed flex-1">
                  {t(`home.process.${key}.description`)}
                </p>
                {isBefore && (
                    <Button
                      mt="8px"
                      aria-label="Download guide (coming soon)"
                      leftIcon={<DownloadIcon />}
                      size="small"
                      loading={isDownloadGuideClicked}
                      onClick={downloadGuideClickHandler}
                      disabled
                      variant="secondary">
                        {t('home.process.before.downloadGuide')}
                    </Button>
                )}
              </div>
            </div>
          );
          })}
        </div>
      </div>
    </section>
  )
}
