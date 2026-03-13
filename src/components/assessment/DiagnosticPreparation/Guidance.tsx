import { ChevronDownIcon, InfoIcon } from '@/components/icons'
import { StepProps } from './Steps'
import { Collapsible } from '@chakra-ui/react'
import RichText from '@/components/ui/RichText'

const Guidance = ({
  steps,
  activeStep,
}: {
  steps: StepProps[]
  activeStep: string
}) => {
  const activeStepData = steps.find((s) => s.id === activeStep)

  if (!activeStepData) return null

  return (
    <div className='border border-l-neutral-300 bg-white max-h-[calc(100vh-48px-44px-56px)] overflow-y-auto'>
      <div className='px-4 py-3 text-neutral-900 border-b border-neutral-300 flex items-center gap-2'>
        <InfoIcon className='h-4 w-4' />
        Guidance
      </div>

      {activeStepData.guidance.map((guidance) => (
        <Collapsible.Root
          key={guidance.title}
          className='border-b border-neutral-300'
          defaultOpen
        >
          <Collapsible.Trigger asChild>
            <div className='px-4 py-3 flex items-start justify-between gap-3 cursor-pointer'>
              <div className='font-bold text-neutral-800'>{guidance.title}</div>
              <Collapsible.Indicator _open={{ transform: 'rotate(180deg)' }}>
                <ChevronDownIcon className='text-neutral-800 h-4 w-4' />
              </Collapsible.Indicator>
            </div>
          </Collapsible.Trigger>
          <Collapsible.Content>
            <RichText
              html={guidance.content}
              className='px-4 pb-6 text-neutral-700 text-sm [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mt-1.5 [&_li]:mb-0.5 [&_p]:mb-0'
            />
          </Collapsible.Content>
        </Collapsible.Root>
      ))}
    </div>
  )
}

export default Guidance
