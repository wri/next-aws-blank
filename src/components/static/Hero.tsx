'use client'

import { Button } from '@worldresources/wri-design-systems'
import { useRouter } from 'next/navigation'
import { useTranslations } from '@/i18n/useTranslations'

export const Hero = () => {
  const router = useRouter()
  const t = useTranslations()

  return (
    <>
      <section className='bg-white'>
        <div className='py-8 px-4 mx-auto max-w-screen-xl text-center lg:py-16 lg:px-12'>
          <h1 className='mb-4 text-4xl font-extrabold tracking-tight leading-none text-gray-900 md:text-5xl lg:text-6xl'>
            {t('home.hero.title')}
          </h1>
          <p className='mb-8 text-lg font-normal text-gray-500 lg:text-xl sm:px-16 xl:px-48'>
            {t('home.hero.description1')}
          </p>
          <p className='mb-8 text-lg font-normal text-gray-500 lg:text-xl sm:px-16 xl:px-48'>
            {t('home.hero.description2')}
          </p>
          <div className='flex flex-col mb-8 lg:mb-16 space-y-4 sm:flex-row sm:justify-center sm:space-y-0 sm:space-x-4'>
            <Button
              rightIcon={
                <svg
                  className='ml-2 -mr-1 w-5 h-5'
                  fill='currentColor'
                  viewBox='0 0 20 20'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <path
                    fillRule='evenodd'
                    d='M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z'
                    clipRule='evenodd'
                  ></path>
                </svg>
              }
              variant='primary'
              className='inline-flex justify-center items-center py-3 px-5 text-base font-medium text-center text-white rounded-lg bg-primary-600 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300'
              onClick={() => router.push('/assessment/setup')}
            >
              {t('home.hero.ctaButton')}
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}
