'use client'

import Image from 'next/image'
import { useTranslations } from '@/i18n/useTranslations'

const CATEGORIES = [
  { key: 'cultural' as const, icon: '/images/Culture.png' },
  { key: 'political' as const, icon: '/images/Politics.png' },
  { key: 'ecological' as const, icon: '/images/Leaf.png' },
  { key: 'financial' as const, icon: '/images/Money.png' },
  { key: 'institutional' as const, icon: '/images/Institution.png' },
  { key: 'social' as const, icon: '/images/People.png' },
]

export const KeyFactorsSection = () => {
  const t = useTranslations()

  return (
    <section className="bg-white py-16 lg:py-24">
      <div className="mx-auto max-w-screen-xl px-4 lg:px-12 flex flex-col lg:flex-row gap-12 lg:gap-16 items-center">
        {/* Left: text */}
        <div className="flex-1">
          <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-6">
            {t('home.keyFactors.title')}
          </h2>
          <p className="text-gray-600 text-base leading-relaxed mb-4">
            {t('home.keyFactors.description1')}
          </p>
          <p className="text-gray-600 text-base leading-relaxed">
            {t('home.keyFactors.description2')}
          </p>
        </div>

        {/* Right: icon grid */}
        <div className="flex-shrink-0 w-full lg:w-auto">
          <div className="grid grid-cols-3 gap-4 lg:gap-6">
            {CATEGORIES.map(({ key, icon }) => (
              <div
                key={key}
                className="flex flex-col items-center gap-3 p-6 rounded-lg bg-secondary-100 border border-secondary-200"
              >
                <div className="flex items-center justify-center">
                  <Image
                    src={icon}
                    alt={key}
                    width={40}
                    height={40}
                    className="w-10 h-10 object-contain"
                  />
                </div>
                <span className="text-sm font-medium text-secondary-700 text-center">
                  {t(`home.keyFactors.categories.${key}`)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
