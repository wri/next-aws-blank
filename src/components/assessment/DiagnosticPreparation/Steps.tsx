import { ProgressBar } from '@worldresources/wri-design-systems'
import { DocumentIcon } from '@/components/icons'
import clsx from 'clsx'
import Link from 'next/link'

export type StepProps = {
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
  activeStep: number
  assessmentId: string
}

const DiagnosticPreparationStep = ({
  stepIdx,
  step,
  activeStep,
  assessmentId,
}: {
  stepIdx: number
  step: StepProps
  activeStep: number
  assessmentId: string
}) => {
  return (
    <div
      className={clsx(
        'py-3 px-[10px]',
        activeStep === stepIdx + 1 && 'bg-secondary-100',
        stepIdx + 1 < activeStep && 'cursor-pointer hover:bg-secondary-100',
      )}
    >
      {stepIdx + 1 < activeStep ? (
        <Link
          href={`/assessment/${assessmentId}/preparation/${stepIdx + 1}`}
          className={clsx(
            'text-neutral-800 flex items-center gap-2',
            activeStep === stepIdx + 1 ? 'font-bold' : '',
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
            activeStep === stepIdx + 1 ? 'font-bold' : '',
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
              {activeStep}/{totalSteps}
            </span>
            <div className='w-full rounded-full'>
              <ProgressBar progress={(activeStep / totalSteps) * 100} />
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
