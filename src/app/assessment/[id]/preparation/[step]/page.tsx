'use client'

import Guidance from '@/components/assessment/DiagnosticPreparation/Guidance'
import Steps from '@/components/assessment/DiagnosticPreparation/Steps'
import { steps } from '@/components/assessment/DiagnosticPreparation/utils'
import { Button } from '@worldresources/wri-design-systems'
import Link from 'next/link'
import { useParams } from 'next/navigation'

const PreparationPage = () => {
  const params = useParams()

  const assessmentId = params.id as string
  const activeStep = Number(params.step)

  const stepData = steps[activeStep - 1]

  if (!stepData)
    return (
      <div className='flex flex-col items-center justify-center h-[calc(100vh-48px-56px)] gap-4'>
        Step not found
        <Link href={`/assessment/${assessmentId}/preparation/1`}>
          <Button>Back to first step</Button>
        </Link>
      </div>
    )

  return (
    <div className='mx-auto flex max-w-[1280px] overflow-hidden'>
      <aside className='w-[240px] flex-shrink-0 pt-8 ml-12'>
        <Steps
          steps={steps}
          activeStep={activeStep}
          assessmentId={assessmentId}
        />
      </aside>
      <main className='flex-1 overflow-y-auto pt-8 w-[560px] px-14 max-h-[calc(100vh-48px-56px)]'>
        {steps[activeStep - 1]?.component}
      </main>
      <aside className='w-[320px] flex-shrink-0'>
        <Guidance steps={steps} activeStep={activeStep} />
      </aside>
    </div>
  )
}

export default PreparationPage
