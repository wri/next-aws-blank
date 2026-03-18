'use client'

import { DownloadIcon } from '@/components/icons'
import { useLanguage } from '@/contexts/LanguageContext'
import { Button } from '@worldresources/wri-design-systems'
import { useState } from 'react'
import { useTranslations } from '@/i18n/useTranslations'

const ExportResponses = ({
  assessmentId,
}: {
  assessmentId: string
}) => {
  const { language } = useLanguage()
  const [isDownloading, setIsDownloading] = useState(false)
  const t = useTranslations()

  const downloadResponses = async () => {
    setIsDownloading(true)

    try {
      const response = await fetch(
        `/api/assessments/${assessmentId}/export-responses?language=${language}`,
      )

      if (!response.ok) {
        throw new Error('Failed to export responses')
      }

      const blob = await response.blob()
      const contentDisposition = response.headers.get('Content-Disposition')
      const filename =
        contentDisposition?.match(/filename="(.+)"/)?.[1] ??
        'assessment_responses.xlsx'

      const objectUrl = window.URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = objectUrl
      anchor.download = filename
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      window.URL.revokeObjectURL(objectUrl)
    } catch (error) {
      console.error(error)
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <Button
      variant='secondary'
      label={t('overview.exportResponses.button')}
      size='small'
      leftIcon={<DownloadIcon />}
      onClick={downloadResponses}
      loading={isDownloading}
      disabled={isDownloading}
    />
  )
}

export default ExportResponses
