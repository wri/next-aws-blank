'use client'

import SectionTitle from '../SectionTitle'
import { QuestionWithAnswer } from '@/types/questions.types'
import { Theme } from '@/db/entities'
import KeySuccessFactorsSection from './KeySuccessFactorsSection'
import { useTranslations } from '@/i18n/useTranslations'

interface KeySuccessFactorsProps {
  assessmentId: string
  questions: QuestionWithAnswer[]
}

const KeySuccessFactors = ({
  assessmentId,
  questions,
}: KeySuccessFactorsProps) => {
  const t = useTranslations()

  const keyFactorsData = [
    {
      theme: Theme.MOTIVATE,
      title: t('overview.keySuccessFactors.themes.motivate.title'),
      caption: t('overview.keySuccessFactors.themes.motivate.caption'),
      questions: questions.filter((q) => q.theme === Theme.MOTIVATE),
    },
    {
      theme: Theme.ENABLE,
      title: t('overview.keySuccessFactors.themes.enable.title'),
      caption: t('overview.keySuccessFactors.themes.enable.caption'),
      questions: questions.filter((q) => q.theme === Theme.ENABLE),
    },
    {
      theme: Theme.IMPLEMENT,
      title: t('overview.keySuccessFactors.themes.implement.title'),
      caption: t('overview.keySuccessFactors.themes.implement.caption'),
      questions: questions.filter((q) => q.theme === Theme.IMPLEMENT),
    },
  ]

  return (
    <div>
      <SectionTitle
        index={2}
        title={t('overview.keySuccessFactors.sectionTitle')}
      />

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
