'use client'

import Guidance from '@/components/assessment/DiagnosticPreparation/Guidance'
import Steps from '@/components/assessment/DiagnosticPreparation/Steps'
import {
  PREPARATION_STEPS,
  steps,
} from '@/components/assessment/DiagnosticPreparation/utils'
import { redirect, useParams } from 'next/navigation'

const PreparationPage = () => {
  const params = useParams()

  const assessmentId = params.id as string
  const activeStep = params.step as string

  const stepData = steps.find((s) => s.id === activeStep)

  if (!stepData) {
    return redirect(
      `/assessment/${assessmentId}/preparation/${PREPARATION_STEPS.TARGET_GEOGRAPHY}`,
    )
  }

  return (
    <div className='mx-auto flex max-w-[1280px] overflow-hidden'>
      <aside className='w-[240px] flex-shrink-0 pt-8 ml-12'>
        <Steps
          steps={steps}
          activeStep={activeStep}
          assessmentId={assessmentId}
        />
      </aside>
      <main className='flex-1 overflow-y-auto py-8 w-[560px] px-14 max-h-[calc(100vh-48px-56px)]'>
        {stepData.component}
      </main>
      <aside className='w-[320px] flex-shrink-0'>
        <Guidance steps={steps} activeStep={activeStep} />
      </aside>
    </div>
  )
}

export default PreparationPage
