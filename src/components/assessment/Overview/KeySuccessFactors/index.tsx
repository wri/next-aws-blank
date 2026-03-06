'use client'

import SectionTitle from '../SectionTitle'
import { Questions } from '@/types/questions.types'
import { Theme } from '@/db/entities'
import KeySuccessFactorsSection from './KeySuccessFactorsSection'

interface KeySuccessFactorsProps {
  assessmentId: string
  questions: Questions[]
}

const KeySuccessFactors = ({
  assessmentId,
  questions,
}: KeySuccessFactorsProps) => {
  const keyFatorsData = [
    {
      theme: Theme.MOTIVATE,
      title: 'Motivate',
      caption:
        'Factors that create incentives and demand for restoration among investors, policymakers, and implementers.',
      questions: questions.filter((q) => q.theme === Theme.MOTIVATE),
    },
    {
      theme: Theme.ENABLE,
      title: 'Enable',
      caption: 'Policies, institutions, finance, and land tenure conditions.',
      questions: questions.filter((q) => q.theme === Theme.ENABLE),
    },
    {
      theme: Theme.IMPLEMENT,
      title: 'Implement',
      caption: 'Technical capacity, knowledge, and operational readiness.',
      questions: questions.filter((q) => q.theme === Theme.IMPLEMENT),
    },
  ]

  return (
    <div>
      <SectionTitle
        index={2}
        title='Key success factors'
      />

      {keyFatorsData.map((item) => (
        <KeySuccessFactorsSection
          key={item.theme}
          questions={item.questions}
          assessmentId={assessmentId}
          theme={item.theme}
          title={item.title}
          caption={item.caption}
          openByDefault
        />
      ))}
    </div>
  )
}

export default KeySuccessFactors
