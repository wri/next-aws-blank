import en from './translations/questions-en.json'
import es from './translations/questions-es.json'
import fr from './translations/questions-fr.json'
import pt from './translations/questions-pt.json'

type QuestionTranslation = {
  questionText?: string
  keySuccessFactor?: string
  minimalKeySuccessFactor?: string
  enablingCondition?: string
  definition?: string
  considerations?: string
  followUpQuestions?: string
  strategyExamples?: string
}

const translations: Record<string, Record<string, QuestionTranslation>> = {
  en,
  es,
  fr,
  pt,
}

export function applyQuestionTranslations<
  T extends {
    questionCode: string
    followUpQuestions: { 'if yes'?: string[]; 'if no'?: string[] } | string | null
  },
>(questions: T[], language: string): T[] {
  const dict = translations[language] ?? translations.en

  return questions.map((q) => {
    const t = dict[q.questionCode]
    if (!t) return q

    let followUpQuestions = q.followUpQuestions
    if (t.followUpQuestions) {
      if (typeof q.followUpQuestions === 'string') {
        // QuestionWithAnswer: followUpQuestions is a raw JSON string — keep as string
        followUpQuestions = t.followUpQuestions as typeof followUpQuestions
      } else {
        // PlainQuestion: followUpQuestions is a parsed object — parse the translation string
        try {
          followUpQuestions = JSON.parse(t.followUpQuestions) as typeof followUpQuestions
        } catch {
          // keep original parsed value
        }
      }
    }

    return {
      ...q,
      ...(t.questionText !== undefined && { questionText: t.questionText }),
      ...(t.keySuccessFactor !== undefined && { keySuccessFactor: t.keySuccessFactor }),
      ...(t.minimalKeySuccessFactor !== undefined && { minimalKeySuccessFactor: t.minimalKeySuccessFactor }),
      ...(t.enablingCondition !== undefined && { enablingCondition: t.enablingCondition }),
      ...(t.definition !== undefined && { definition: t.definition }),
      ...(t.considerations !== undefined && { considerations: t.considerations }),
      ...(t.strategyExamples !== undefined && { strategyExamples: t.strategyExamples }),
      followUpQuestions,
    }
  })
}
