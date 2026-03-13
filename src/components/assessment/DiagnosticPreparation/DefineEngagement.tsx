'use client'

import {
  ChevronDownIcon,
  ChevronLeftIcon,
  InterviewIcon,
  PeopleIcon,
  SendIcon,
} from '@/components/icons'
import { Button } from '@worldresources/wri-design-systems'
import { useParams, useRouter } from 'next/navigation'
import { ChakraRichTextEditor } from '../ChakraRichTextEditor'
import { Collapsible } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import Loader from '@/components/ui/Loader'
import { PREPARATION_STEPS } from './utils'
import RichText from '@/components/ui/RichText'

const suggestedApproaches = [
  {
    title: 'Participatory workshops',
    icon: <PeopleIcon className='w-4 h-4 text-secondary-500' />,
    content: `
      <ul>
        <li>Convene a half-day or full-day workshop (virtual or in-person)</li>
        <li>Use structured facilitation to guide responses</li>
        <li>Best when time is limited and participation is desired</li>
      </ul>
    `,
  },
  {
    title: 'Interviews / focus groups',
    icon: <InterviewIcon className='w-4 h-4 text-secondary-500' />,
    content: `
      <ul>
        <li>Semi-structured interviews with key actors</li>
        <li>Useful for sensitive topics (e.g., tenure insecurity, governance challenges)</li>
      </ul>
    `,
  },
  {
    title: 'Distributed completion',
    icon: <SendIcon className='w-4 h-4 text-secondary-500' />,
    content: `
      <ul>
        <li>Share the worksheet found under Step 2 with stakeholders </li>
        <li>Ask them to complete sections relevant to their expertise</li>
        <li>Coordinate synthesis and discussion afterward</li>
      </ul>
    `,
  },
]

const DefineEngagement = () => {
  const params = useParams()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [engagementStrategy, setEngagementStrategy] = useState('')

  const assessmentId = params.id as string
  const activeStep =
    (params.step as string) || PREPARATION_STEPS.DEFINE_ENGAGEMENT

  const getAssessmentData = async () => {
    setIsLoading(true)

    const result = await fetch(`/api/assessments/${assessmentId}/preparation`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    const jsonResult = await result.json()

    if (jsonResult.success && jsonResult.data.engagementStrategy) {
      setEngagementStrategy(jsonResult.data.engagementStrategy)
    }

    setIsLoading(false)
  }

  useEffect(() => {
    getAssessmentData()
  }, [])

  const onSubmit = async () => {
    setIsSubmitting(true)

    const payload = {
      engagementStrategy,
      step: activeStep,
    }

    const result = await fetch(`/api/assessments/${assessmentId}/preparation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
    const jsonResult = await result.json()

    if (jsonResult.success) {
      router.push(
        `/assessment/${assessmentId}/preparation/${PREPARATION_STEPS.GATHER_MATERIALS}`,
      )
    }

    setIsSubmitting(false)
  }

  if (isLoading) {
    return <Loader />
  }

  return (
    <div className='pb-28'>
      <Button
        variant='borderless'
        className='text-neutral-700 mb-4'
        leftIcon={<ChevronLeftIcon className='w-3 h-3' />}
        onClick={() =>
          router.push(
            `/assessment/${assessmentId}/preparation/${PREPARATION_STEPS.RESTORATION_GOALS}`,
          )
        }
      >
        <span className='underline underline-offset-1'>Previous</span>
      </Button>

      <h1 className='text-3xl font-bold text-neutral-900 mb-2'>
        Define engagement strategy
      </h1>
      <p className='text-neutral-800 mb-8'>
        You will engage stakeholders at different stages of the diagnostic.
        Review the suggested approaches below and plan how you will involve
        them. You may wish to outline your strategy below.
      </p>

      <div className='mb-10'>
        <p className='text-neutral-900 text-xl mb-4 font-bold'>
          Suggested engagement approaches
        </p>

        {suggestedApproaches.map((approach, idx) => (
          <Collapsible.Root
            key={approach.title}
            className='mt-5 border border-neutral-300 rounded-lg bg-white'
            defaultOpen={idx === 0}
          >
            <Collapsible.Trigger asChild>
              <div className='px-4 py-3 flex items-start justify-between gap-3 cursor-pointer'>
                <div className='font-bold text-neutral-800 flex items-center gap-2'>
                  {approach.icon}
                  {approach.title}
                </div>
                <Collapsible.Indicator _open={{ transform: 'rotate(180deg)' }}>
                  <ChevronDownIcon className='text-neutral-800 h-4 w-4' />
                </Collapsible.Indicator>
              </div>
            </Collapsible.Trigger>
            <Collapsible.Content>
              <RichText
                html={approach.content}
                className='p-3 text-neutral-700 text-sm [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mt-1.5 [&_li]:mb-0.5 [&_p]:mb-0 border-t border-neutral-300'
              />
            </Collapsible.Content>
          </Collapsible.Root>
        ))}
      </div>

      <div className='mb-10'>
        <p className='text-neutral-900 text-xl mb-4 font-bold'>
          Engagement strategy notes{' '}
          <span className='font-normal text-neutral-700'>(Optional)</span>
        </p>
        <ChakraRichTextEditor
          value={engagementStrategy}
          onChange={(value) => setEngagementStrategy(value)}
        />
      </div>

      <div className='flex items-center gap-5 mt-10'>
        <Button
          onClick={onSubmit}
          disabled={isSubmitting}
          loading={isSubmitting}
        >
          Save and continue
        </Button>
        <Button
          variant='borderless'
          onClick={onSubmit}
          disabled={isSubmitting}
          loading={isSubmitting}
        >
          Skip
        </Button>
      </div>
    </div>
  )
}

export default DefineEngagement
