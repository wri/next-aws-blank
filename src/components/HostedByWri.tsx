'use client'

import React, { useState, useRef, useEffect } from 'react'
import { WriLogoIcon } from './icons/WriLogo'
import { WriMarkIcon } from './icons/WriMarkIcon'
import { useTranslations } from '@/i18n/useTranslations'
import { List } from '@worldresources/wri-design-systems'

export function HostedByWri() {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const t = useTranslations()

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <div className='relative flex items-center h-full' ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className='flex items-center gap-2 h-[98%] text-neutral-500 hover:text-primary-500 transition-colors px-2 cursor-pointer hover:bg-neutral-200'
      >
        <WriMarkIcon className='h-5 w-5' />
        <span className='text-sm text-neutral-900 whitespace-nowrap'>
          {t('navigation.hostedByWri')}
        </span>
      </button>

      {isOpen && (
        <div className='absolute top-[100%] -right-2 mt-2 w-[22rem] z-50'>
          <div
            className='absolute -top-1.5 right-6 w-3 h-3 bg-white border-l border-t border-neutral-400 transform rotate-45 z-10'
            style={{
              borderTopLeftRadius: '4px',
            }}
          />
          <div className='relative bg-white border border-neutral-400 shadow-xl rounded-md overflow-hidden'>
            <div className='p-4 flex flex-col'>
              <div className='flex items-center'>
                <WriLogoIcon className='h-8 w-24 mb-3' />
              </div>

              <p className='text-sm font-bold text-neutral-800 mb-1'>
                {t('navigation.hostedByWriPopup.title')}
              </p>

              <p className='text-sm text-neutral-700 leading-relaxed mb-2'>
                {t('navigation.hostedByWriPopup.description')}
              </p>

              <ul className='list-disc pl-5 text-sm text-neutral-700'>
                <li>{t('navigation.hostedByWriPopup.list.item1')}</li>
                <li>{t('navigation.hostedByWriPopup.list.item2')}</li>
                <li>{t('navigation.hostedByWriPopup.list.item3')}</li>
              </ul>
            </div>

            <div>
              <List
                items={[
                  {
                    id: 'about-wri',
                    label: t(
                      'navigation.hostedByWriPopup.links.aboutWri',
                    ) as string,
                    variant: 'navigation',
                    onItemClick: () =>
                      window.open(
                        'https://www.wri.org/about',
                        '_blank',
                        'noopener,noreferrer',
                      ),
                  },
                  {
                    id: 'about-restoration-initiative',
                    label: t(
                      'navigation.hostedByWriPopup.links.aboutInitiative',
                    ) as string,
                    variant: 'navigation',
                    onItemClick: () =>
                      window.open(
                        'https://www.wri.org/initiatives/global-restoration-initiative',
                        '_blank',
                        'noopener,noreferrer',
                      ),
                  },
                  {
                    id: 'all-wri-data-applications',
                    label: t(
                      'navigation.hostedByWriPopup.links.allDataApps',
                    ) as string,
                    variant: 'navigation',
                    onItemClick: () =>
                      window.open(
                        'https://www.wri.org/data/data-applications',
                        '_blank',
                        'noopener,noreferrer',
                      ),
                  },
                ]}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
