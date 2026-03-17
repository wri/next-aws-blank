'use client'

import SectionTitle from '../SectionTitle'
import { QuestionWithAnswer } from '@/types/questions.types'
import { Theme } from '@/db/entities'
import KeySuccessFactorsSection from './KeySuccessFactorsSection'

interface KeySuccessFactorsProps {
  assessmentId: string
  questions: QuestionWithAnswer[]
}

const KeySuccessFactors = ({
  assessmentId,
  questions,
}: KeySuccessFactorsProps) => {
  const keyFactorsData = [
    {
      theme: Theme.MOTIVATE,
      title: 'Motivate',
      caption:
        'Factors that inspire or motivate to catalyze processes that lead to restoration such as incentives that drive demand for restoration among investors, policymakers, and land stewards.',
      questions: questions.filter((q) => q.theme === Theme.MOTIVATE),
    },
    {
      theme: Theme.ENABLE,
      title: 'Enable',
      caption: 'Factors that create a favorable context for restoration such as policies, finance and land tenure considerations.',
      questions: questions.filter((q) => q.theme === Theme.ENABLE),
    },
    {
      theme: Theme.IMPLEMENT,
      title: 'Implement',
      caption: 'Factors that are related with capacities and resources to mobilize implementation of restoration on-the-ground such as technical capacity, knowledge, and operational readiness.',
      questions: questions.filter((q) => q.theme === Theme.IMPLEMENT),
    },
  ]

  return (
    <div>
      <SectionTitle index={2} title='Key success factors' />

      {keyFactorsData.map((item) => (
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
