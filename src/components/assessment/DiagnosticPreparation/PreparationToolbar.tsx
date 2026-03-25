'use client'

import { Breadcrumb, Button } from '@worldresources/wri-design-systems'
import Link from 'next/link'
import { useSearchParams, useParams } from 'next/navigation'
import { getPreparationSteps } from './utils'
import { SaveIcon } from '@/components/icons'
import { useEffect, useState } from 'react'
import { usePreparationSubmit } from './PreparationSubmitContext'
import { useTranslations } from '@/i18n/useTranslations'

const PreparationToolbar = () => {
  const t = useTranslations()
  const params = useParams()
  const searchParams = useSearchParams()
  const { submitHandler } = usePreparationSubmit()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const isEditMode = searchParams.get('isEditMode')
  const isEditing = isEditMode === 'true'

  const { id, step } = params as { id: string; step: string }
  const steps = getPreparationSteps(t)

  const stepData = steps.find((s) => s.id === step)

  const breadcrumbLinks = [
    { label: t('overview.page.title'), link: `/assessment/${id}` },
  ]

  if (stepData) {
    breadcrumbLinks.push({
      label: isEditing
        ? t('scoping.toolbar.editDiagnosticScope')
        : stepData.title,
      link: `/assessment/${id}/preparation/${step}`,
    })
  }

  const handleSaveAndExit = async () => {
    if (!submitHandler) return

    setIsSubmitting(true)

    try {
      await submitHandler('exit')
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) return <div className='h-11' />

  return (
    <div className='h-11 px-4 border-b border-neutral-400 sticky top-0 bg-white z-10 flex items-center justify-between'>
      <Breadcrumb links={breadcrumbLinks} linkRouter={Link} />

      {isEditMode ? (
        <Button
          label={t('scoping.toolbar.saveAndExit')}
          leftIcon={<SaveIcon />}
          size='small'
          onClick={handleSaveAndExit}
          disabled={!submitHandler || isSubmitting}
          loading={isSubmitting}
        />
      ) : null}
    </div>
  )
}

export default PreparationToolbar
