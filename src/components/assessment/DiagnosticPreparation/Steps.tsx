import { ProgressBar } from '@worldresources/wri-design-systems'
import { DocumentIcon } from '@/components/icons'
import clsx from 'clsx'
import Link from 'next/link'

export type StepProps = {
  id: string
  title: string
  section: string
  guidance: {
    title: string
    content: string
  }[]
  component: React.ReactNode
}

type StepsProps = {
  steps: StepProps[]
  activeStep: string
  assessmentId: string
}

const DiagnosticPreparationStep = ({
  stepIdx,
  step,
  activeStep,
  activeStepIdx,
  assessmentId,
}: {
  stepIdx: number
  step: StepProps
  activeStep: string
  activeStepIdx: number
  assessmentId: string
}) => {
  const isActive = activeStep === step.id
  const isPast = stepIdx < activeStepIdx

  return (
    <div
      className={clsx(
        'py-3 px-[10px]',
        isActive && 'bg-secondary-100',
        isPast && 'cursor-pointer hover:bg-secondary-100',
      )}
    >
      {isPast ? (
        <Link
          href={`/assessment/${assessmentId}/preparation/${step.id}`}
          className={clsx(
            'text-neutral-800 flex items-center gap-2',
            isActive ? 'font-bold' : '',
          )}
        >
          <div className='flex items-center justify-center pt-0.5 bg-secondary-200 w-4 h-4 text-sm font-bold text-secondary-700 rounded-sm'>
            {stepIdx + 1}
          </div>
          {step.title}
        </Link>
      ) : (
        <div
          className={clsx(
            'text-neutral-800 flex items-center gap-2',
            isActive ? 'font-bold' : '',
          )}
        >
          <div className='flex items-center justify-center pt-0.5 bg-secondary-200 w-4 h-4 text-sm font-bold text-secondary-700 rounded-sm'>
            {stepIdx + 1}
          </div>
          {step.title}
        </div>
      )}
    </div>
  )
}

const Steps = ({ steps, activeStep, assessmentId }: StepsProps) => {
  const totalSteps = steps.length
  const activeStepIdx = steps.findIndex((s) => s.id === activeStep)
  const activeStepNumber = activeStepIdx >= 0 ? activeStepIdx + 1 : 1

  return (
    <div className=''>
      <div className='w-full overflow-hidden rounded-md border border-neutral-300 bg-white shadow-sm'>
        <div className='border-b border-neutral-300 px-[10px] py-2'>
          <div className='mb-2 flex items-center gap-2'>
            <DocumentIcon className='h-4 w-4 text-neutral-700' />
            <h2 className='font-bold text-neutral-800'>
              Diagnostic preparation
            </h2>
          </div>

          <div className='flex items-center gap-2'>
            <span className='text-sm text-neutral-700'>
              {activeStepNumber}/{totalSteps}
            </span>
            <div className='w-full rounded-full'>
              <ProgressBar progress={(activeStepNumber / totalSteps) * 100} />
            </div>
          </div>
        </div>

        <div className='border-b border-neutral-300'>
          <div className='pt-4'>
            <h3 className='mb-0.5 px-3 text-sm text-neutral-800'>
              Setting the scope
            </h3>
            {steps
              .filter((step) => step.section === 'scope')
              .map((step) => (
                <DiagnosticPreparationStep
                  key={step.title}
                  stepIdx={steps.indexOf(step)}
                  step={step}
                  activeStep={activeStep}
                  activeStepIdx={activeStepIdx}
                  assessmentId={assessmentId}
                />
              ))}
          </div>
        </div>

        <div className='border-b border-neutral-300'>
          <div className='py-4'>
            <h3 className='mb-0.5 px-3 text-sm text-neutral-800'>
              Plan your approach
            </h3>
            {steps
              .filter((step) => step.section === 'approach')
              .map((step) => (
                <DiagnosticPreparationStep
                  key={step.title}
                  stepIdx={steps.indexOf(step)}
                  step={step}
                  activeStep={activeStep}
                  activeStepIdx={activeStepIdx}
                  assessmentId={assessmentId}
                />
              ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Steps
