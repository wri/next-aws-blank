'use client'

import { 
  Navbar,
  Menu,
  Button
} from '@worldresources/wri-design-systems'
import Link from 'next/link'
import { WriLogoIcon } from '../icons'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const languages = [
  {
    label: 'English',
    value: 'en',
  },
  {
    label: 'Spanish',
    value: 'es',
  },
]

export const Hero = () => {
  const [language, setLanguage] = useState('')
  const pathname = usePathname()
  
  return (
    <>
      <Navbar 
        pathname={pathname}
        linkRouter={Link}
        logo={
          <Link href={'#'}>
            <WriLogoIcon height='auto' width='120px' />
            <span className="font-semibold ml-7">Restoration Diagnostic</span>
          </Link>
        }
        navigationSection={[]}
        utilitySection={[
          <Menu
            key='language-menu'
            label={
              languages?.find((l) => l.value === language)?.label || 'Language'
            }
            items={languages}
            onSelect={setLanguage}
          />,
        ]}
        actionsSection={[]}
        maxWidth={1440}
        fixed
      />
      <section className="bg-white dark:bg-gray-900">
        <div className="py-8 px-4 mx-auto max-w-screen-xl text-center lg:py-16 lg:px-12">
            <h1 className="mb-4 text-4xl font-extrabold tracking-tight leading-none text-gray-900 md:text-5xl lg:text-6xl dark:text-white">Restoration Diagnostic</h1>
            <p className="mb-8 text-lg font-normal text-gray-500 lg:text-xl sm:px-16 xl:px-48 dark:text-gray-400">A structured method for identifying which key success factors for ecosystem restoration you already have in place, partially in place, or are missing within a country or landscape that has restoration opportunities.</p>
            <p className="mb-8 text-lg font-normal text-gray-500 lg:text-xl sm:px-16 xl:px-48 dark:text-gray-400">A structured method for assessing ecosystem restoration readiness. The diagnostic will help you identify key success factors that you have in place, partially in place, or still need to consider how to include.</p>
            <div className="flex flex-col mb-8 lg:mb-16 space-y-4 sm:flex-row sm:justify-center sm:space-y-0 sm:space-x-4">
                <Button
                  rightIcon={
                    <svg className="ml-2 -mr-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
                  }
                 onClick={() => window.location.href = "/assessment/setup"} variant='primary' className="inline-flex justify-center items-center py-3 px-5 text-base font-medium text-center text-white rounded-lg bg-primary-600 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 dark:focus:ring-primary-900">
                    Start Assessment
                </Button>
            </div>
        </div>
      </section>
    </>
  )
}
