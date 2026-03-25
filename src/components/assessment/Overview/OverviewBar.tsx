'use client'

import { useEffect, useState } from 'react'
import ExportResponses from './ExportResponses'
import { useTranslations } from '@/i18n/useTranslations'

const OverviewBar = ({ assessmentId }: { assessmentId: string }) => {
  const t = useTranslations()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return <div className='h-12' />
  }

  return (
    <div className='h-11 px-4 border-b border-neutral-400 mb-16 sticky top-0 bg-white z-10 flex items-center justify-between'>
      <h1 className='font-bold text-neutral-800'>{t('overview.page.title')}</h1>
      <ExportResponses assessmentId={assessmentId} />
    </div>
  )
}

export default OverviewBar
