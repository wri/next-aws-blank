'use client'

import { PREPARATION_STEPS } from '@/constants'
import { ChecklistIcon, ScopeIcon } from '@/components/icons'
import { Button, InlineMessage, Tag } from '@worldresources/wri-design-systems'
import { useParams, useRouter } from 'next/navigation'
import { useTranslations } from '@/i18n/useTranslations'

const PreparationPage = () => {
  const params = useParams()
  const router = useRouter()
  const assessmentId = params.id as string
  const t = useTranslations()

  return (
    <div className='mx-auto w-full max-w-[580px] pt-16 pb-20 px-5'>
      <div className='p-8 border border-neutral-400 rounded-lg bg-white mb-6'>
        <h1 className='text-3xl font-bold text-neutral-800'>
          {t('scoping.intro.heading')}
        </h1>

        <p className='text-neutral-800 mt-2'>
          {t('scoping.intro.description1')}
        </p>
        <p className='text-neutral-800 mt-2 mb-6'>
          {t('scoping.intro.description2')}
        </p>

        <InlineMessage
          label={t('scoping.intro.inlineMessage')}
          variant='info-grey'
          size='full-width'
        />

        <h2 className='text-neutral-800 mt-6 text-lg font-bold'>
          {t('scoping.intro.subtitle')}
        </h2>

        <div className='flex gap-4 mt-2 border border-neutral-300 rounded-lg p-4'>
          <ScopeIcon className='text-secondary-600' />
          <div>
            <h3 className='text-neutral-900'>
              {t('scoping.intro.parts.scope.title')}
            </h3>
            <p className='text-neutral-700'>
              {t('scoping.intro.parts.scope.description')}
            </p>
          </div>
        </div>

        <div className='flex gap-4 mt-2 border border-neutral-300 rounded-lg p-4'>
          <ChecklistIcon className='text-secondary-600' />
          <div>
            <div className='flex items-center justify-between gap-2'>
              <h3 className='text-neutral-900'>
                {t('scoping.intro.parts.approach.title')}
              </h3>
              <Tag
                label={t('scoping.intro.parts.approach.badge')}
                variant='warning'
                size='small'
              />
            </div>
            <p className='text-neutral-700'>
              {t('scoping.intro.parts.approach.description')}
            </p>
          </div>
        </div>
      </div>

      <Button
        label={t('scoping.intro.button')}
        onClick={() =>
          router.push(
            `/assessment/${assessmentId}/preparation/${PREPARATION_STEPS.TARGET_GEOGRAPHY}`,
          )
        }
      />
    </div>
  )
}

export default PreparationPage
