'use client'

import Image from 'next/image'
import { useTranslations } from '@/i18n/useTranslations'

const AUDIENCES = [
  'audience1',
  'audience2',
  'audience3',
  'audience4',
] as const

export const TargetAudienceSection = () => {
  const t = useTranslations()

  return (
    <section className="bg-white py-16 lg:py-24">
      <div className="mx-auto max-w-screen-xl px-4 lg:px-12 flex flex-col lg:flex-row gap-12 lg:gap-16 items-center">
        {/* Left: image */}
        <div className="flex-1 w-full">
          <div className="relative rounded-2xl overflow-hidden aspect-[4/3]">
            <Image
              src="/images/is-this-tool-for-you.jpg"
              alt="People working in a restoration landscape"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
          <p className="text-neutral-500 text-xs italic mt-1 text-right">
            Serrah Galos/WRI
          </p>
        </div>

        {/* Right: content */}
        <div className="flex-1">
          <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-4">
            {t('home.targetAudience.title')}
          </h2>
          <p className="text-gray-600 text-base leading-relaxed mb-3">
            {t('home.targetAudience.description1')}
          </p>
          <p className="text-gray-600 text-base leading-relaxed mb-4">
            {t('home.targetAudience.description2')}
          </p>
          <ul className="space-y-2">
            {AUDIENCES.map((audience) => (
              <li key={audience} className="flex gap-2 text-gray-700 text-base leading-relaxed">
                <span className="mt-0.5 text-gray-400 flex-shrink-0">•</span>
                <span>
                  <strong className="font-semibold text-gray-900">
                    {t(`home.targetAudience.${audience}.label`)}
                  </strong>{' '}
                  {t(`home.targetAudience.${audience}.description`)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
