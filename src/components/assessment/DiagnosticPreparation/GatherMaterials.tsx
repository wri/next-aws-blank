import {
  ChevronDownIcon,
  ChevronLeftIcon,
  InterviewIcon,
  PeopleIcon,
  SendIcon,
} from '@/components/icons'
import { Button, TextInput } from '@worldresources/wri-design-systems'
import { useParams, useRouter } from 'next/navigation'
import { Collapsible } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import Loader from '@/components/ui/Loader'

const suggestedDocuments = [
  {
    title: 'Policy & legal context',
    icon: <PeopleIcon className='w-4 h-4 text-secondary-500' />,
    content: `
      <ul>
        <li>National restoration strategies or programs.</li>
        <li>Laws and regulations (Forestry, Agriculture, Land Use, Water).</li>
        <li>International commitments (UNFCCC, CBD, UNCCD).</li>
        <li>National development plans and NDCs.</li>
      </ul>
    `,
  },
  {
    title: 'Implementation & planning',
    icon: <InterviewIcon className='w-4 h-4 text-secondary-500' />,
    content: `
      <ul>
        <li>Sub-national or regional restoration action plans.</li>
        <li>Municipal development plans for the target landscapes.</li>
        <li>Donor-funded program documentation.</li>
        <li>Existing institutional budgets and organizational charts.</li>
      </ul>
    `,
  },
  {
    title: 'Biophysical & socioeconomic data',
    icon: <SendIcon className='w-4 h-4 text-secondary-500' />,
    content: `
      <ul>
        <li>Land cover and land degradation assessments.</li>
        <li>Restoration opportunity maps (e.g., ROAM outputs).</li>
        <li>Socioeconomic data (tenure status, livelihood dependence, market analyses).</li>
      </ul>
    `,
  },
  {
    title: 'Monitoring & baselines',
    icon: <SendIcon className='w-4 h-4 text-secondary-500' />,
    content: `
      <ul>
        <li>Data from landscape monitoring systems (e.g., Global Forest Watch).</li>
        <li>Existing restoration indicators and historical progress reports.</li>
      </ul>
    `,
  },
]

const GatherMaterials = () => {
  const params = useParams()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [materials, setMaterials] = useState('')

  const assessmentId = params.id as string
  const activeStep = Number.isNaN(params.step) ? 3 : Number(params.step)

  const getAssessmentData = async () => {
    setIsLoading(true)

    const result = await fetch(`/api/assessments/${assessmentId}/preparation`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    const jsonResult = await result.json()

    if (jsonResult.success && jsonResult.data.materials) {
      setMaterials(jsonResult.data.materials)
    }

    setIsLoading(false)
  }

  useEffect(() => {
    getAssessmentData()
  }, [])

  const onSubmit = async () => {
    setIsSubmitting(true)

    const payload = {
      materials,
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
      router.push(`/assessment/${assessmentId}?isFromPreparation=true`)
    }
  }

  if (isLoading) {
    return <Loader />
  }

  return (
    <>
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

        <h1 className='text-3xl font-bold text-neutral-900 mb-2'>
          Gather materials
        </h1>
        <p className='text-neutral-800 mb-8'>
          Before starting the diagnostic, it is useful to gather key documents
          and data sources in order to refer to them as evidence. We recommend
          organising them in a shared folder so all contributors can access the
          same evidence during the diagnostic.
        </p>

        <div className='mb-10'>
          <p className='text-neutral-900 text-xl mb-4 font-bold'>
            Suggested documentation
          </p>

          {suggestedDocuments.map((document, idx) => (
            <Collapsible.Root
              key={document.title}
              className='mt-5 border border-neutral-300 rounded-lg bg-white'
              defaultOpen={idx === 0}
            >
              <Collapsible.Trigger asChild>
                <div className='px-4 py-3 flex items-start justify-between gap-3 cursor-pointer'>
                  <div className='font-bold text-neutral-800 flex items-center gap-2'>
                    {document.icon}
                    {document.title}
                  </div>
                  <Collapsible.Indicator
                    _open={{ transform: 'rotate(180deg)' }}
                  >
                    <ChevronDownIcon className='text-neutral-800 h-4 w-4' />
                  </Collapsible.Indicator>
                </div>
              </Collapsible.Trigger>
              <Collapsible.Content>
                <div
                  className='p-3 text-neutral-700 text-sm [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mt-1.5 [&_li]:mb-0.5 [&_p]:mb-0 border-t border-neutral-300'
                  dangerouslySetInnerHTML={{ __html: document.content }}
                />
              </Collapsible.Content>
            </Collapsible.Root>
          ))}
        </div>

        <div className='w-96 mb-8'>
          <TextInput
            label='Shared folder link'
            caption='This link will be shown to anyone you provide access to the Diagnostic. Ensure everyone supporting the diagnostic has permission to view.'
            value={materials}
            onChange={(e) => setMaterials(e.target.value)}
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
              router.push(`/assessment/${assessmentId}?isFromPreparation=true`)
            }
            disabled={isSubmitting}
            loading={isSubmitting}
          >
            Skip
          </Button>
        </div>
      </div>
    </>
  )
}

export default GatherMaterials
