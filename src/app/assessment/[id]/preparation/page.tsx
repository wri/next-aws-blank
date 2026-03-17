'use client'

import { PREPARATION_STEPS } from '@/constants'
import { ChecklistIcon, ScopeIcon } from '@/components/icons'
import { Button, Tag } from '@worldresources/wri-design-systems'
import { useParams, useRouter } from 'next/navigation'

const PreparationPage = () => {
  const params = useParams()
  const router = useRouter()
  const assessmentId = params.id as string

  return (
    <div className='mx-auto w-full max-w-[580px] pt-16 pb-20 px-5'>
      <div className='p-8 border border-neutral-400 rounded-lg bg-white mb-6'>
        <h1 className='text-3xl font-bold text-neutral-800'>
          Prepare for the diagnostic
        </h1>

        <p className='text-neutral-800 mt-2'>
          In this phase, you will have the opportunity to set the scope, designate a lead for the process, 
          choose stakeholder engagement methods, gather the necessary documentation, 
          define the target geography or scale, and outline your restoration goals and the timeline for the efforts.
        </p>
        <p className='text-neutral-800 mt-2'>
          Taking time to prepare ensures the diagnostic is focused,
          well-supported, and aligned with your restoration context.
        </p>

        <h2 className='text-neutral-800 mt-6 text-lg font-bold'>
          There are 2 parts to this step:
        </h2>

        <div className='flex gap-4 mt-2 border border-neutral-300 rounded-lg p-4'>
          <ScopeIcon className='text-secondary-600' />
          <div>
            <h3 className='text-neutral-900'>Set the scope</h3>
            <p className='text-neutral-700'>
              Define the target landscape, time horizon, and restoration goals.
            </p>
          </div>
        </div>

        <div className='flex gap-4 mt-2 border border-neutral-300 rounded-lg p-4'>
          <ChecklistIcon className='text-secondary-600' />
          <div>
            <div className='flex items-center justify-between gap-2'>
              <h3 className='text-neutral-900'>
                Plan your diagnostic approach
              </h3>
              <Tag label='Optional' variant='warning' size='small' />
            </div>
            <p className='text-neutral-700'>
              Decide how you will engage stakeholders and gather supporting
              materials.
            </p>
          </div>
        </div>
      </div>

      <Button
        label='Start preparation'
        onClick={() =>
          router.push(
            `/assessment/${assessmentId}/preparation/${PREPARATION_STEPS.TARGET_GEOGRAPHY}`,
          )
        }
      />
    </div>
  )
}

export default PreparationPage
