import { ChevronLeftIcon } from '@/components/icons'
import Loader from '@/components/ui/Loader'
import { Button, TextInput } from '@worldresources/wri-design-systems'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

const TimeHorizon = () => {
  const params = useParams()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [timeHorizon, setTimeHorizon] = useState('')

  const assessmentId = params.id as string
  const activeStep = Number.isNaN(params.step) ? 2 : Number(params.step)

  const getAssessmentData = async () => {
    setIsLoading(true)

    const result = await fetch(`/api/assessments/${assessmentId}/preparation`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    const jsonResult = await result.json()

    if (jsonResult.success && jsonResult.data.timeHorizon) {
      setTimeHorizon(jsonResult.data.timeHorizon)
    }

    setIsLoading(false)
  }

  useEffect(() => {
    getAssessmentData()
  }, [])

  const onSubmit = async () => {
    setIsSubmitting(true)

    const payload = {
      timeHorizon,
      step: activeStep,
    }

    const response = await fetch(
      `/api/assessments/${assessmentId}/preparation`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      },
    )

    const result = await response.json()

    if (result.success) {
      router.push(`/assessment/${assessmentId}/preparation/${activeStep + 1}`)
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
            `/assessment/${assessmentId}/preparation/${activeStep - 1}`,
          )
        }
      >
        <span className='underline underline-offset-1'>Previous</span>
      </Button>

      <h1 className='text-3xl font-bold text-neutral-900 mb-2'>Time horizon</h1>
      <p className='text-neutral-800 mb-8'>
        The time horizon should reflect the long-term nature of restoration,
        even if actions begin in the short term. It may align with an existing
        national or sub-national planning cycle or strategy.
      </p>

      <div className='mb-10'>
        <TextInput
          label='Restoration period (years)'
          style={{ width: '120px' }}
          type='number'
          min={1}
          value={timeHorizon}
          onChange={(e) => setTimeHorizon(e.target.value)}
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
          onClick={() =>
            router.push(
              `/assessment/${assessmentId}/preparation/${activeStep + 1}`,
            )
          }
          disabled={isSubmitting}
          loading={isSubmitting}
        >
          Skip
        </Button>
      </div>
    </div>
  )
}

export default TimeHorizon
