'use client'

import SectionTitle from './SectionTitle'
import CardContainer from './CardContainer'

const StrategicPlan = () => {
  return (
    <div>
      <SectionTitle index={3} title='Strategic Plan' />
      <CardContainer
        title='Strategic Plan'
        caption='All strategies added across Diagnostic factors.'
        hideLabel='table'
        noHorizontalPadding
        noPaddingBottom
      >
        <div className='flex flex-col items-center gap-2 py-10 bg-neutral-200'>
          <p className='text-xl font-bold text-neutral-800'>
            No strategies created
          </p>
          <p className='text-neutral-700'>
            When you add strategies under a factor they will appear here
          </p>
        </div>
      </CardContainer>
    </div>
  )
}

export default StrategicPlan
