import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { validateSessionCookie } from '@/utils/session'
import { createWorkbookBuffer } from '@/utils/xlsx'
import { AnswerStatus, AnswerValue } from '@/db/entities/Answer.entity'
import { richTextToPlainText } from '@/utils/validation'
import { normalizeLocale } from '@/i18n/config'
import enTranslations from '@/i18n/translations/en.json'
import esTranslations from '@/i18n/translations/es.json'
import frTranslations from '@/i18n/translations/fr.json'
import ptTranslations from '@/i18n/translations/pt.json'

const exportLabels: Record<
  string,
  {
    headers: string[]
    theme: Record<string, string>
    status: Record<AnswerStatus | 'empty', string>
    response: Record<AnswerValue | 'empty', string>
  }
> = {
  en: {
    headers: [
      enTranslations.overview.exportResponses.headers.id,
      enTranslations.overview.exportResponses.headers.theme,
      enTranslations.overview.exportResponses.headers.enablingCondition,
      enTranslations.overview.exportResponses.headers.keyFactor,
      enTranslations.overview.exportResponses.headers.status,
      enTranslations.overview.exportResponses.headers.response,
      enTranslations.overview.exportResponses.headers.rationale,
    ],
    theme: {
      Motivate: enTranslations.navigation.themes.motivate,
      Enable: enTranslations.navigation.themes.enable,
      Implement: enTranslations.navigation.themes.implement,
    },
    status: {
      [AnswerStatus.NOT_STARTED]:
        enTranslations.overview.exportResponses.status.notStarted,
      [AnswerStatus.IN_PROGRESS]:
        enTranslations.overview.exportResponses.status.inProgress,
      [AnswerStatus.COMPLETE]:
        enTranslations.overview.exportResponses.status.complete,
      empty: enTranslations.overview.exportResponses.status.empty,
    },
    response: {
      [AnswerValue.YES]: enTranslations.overview.exportResponses.response.yes,
      [AnswerValue.PARTLY]:
        enTranslations.overview.exportResponses.response.partly,
      [AnswerValue.NO]: enTranslations.overview.exportResponses.response.no,
      [AnswerValue.NA]: enTranslations.overview.exportResponses.response.na,
      empty: enTranslations.overview.exportResponses.response.empty,
    },
  },
  es: {
    headers: [
      esTranslations.overview.exportResponses.headers.id,
      esTranslations.overview.exportResponses.headers.theme,
      esTranslations.overview.exportResponses.headers.enablingCondition,
      esTranslations.overview.exportResponses.headers.keyFactor,
      esTranslations.overview.exportResponses.headers.status,
      esTranslations.overview.exportResponses.headers.response,
      esTranslations.overview.exportResponses.headers.rationale,
    ],
    theme: {
      Motivate: esTranslations.navigation.themes.motivate,
      Enable: esTranslations.navigation.themes.enable,
      Implement: esTranslations.navigation.themes.implement,
    },
    status: {
      [AnswerStatus.NOT_STARTED]:
        esTranslations.overview.exportResponses.status.notStarted,
      [AnswerStatus.IN_PROGRESS]:
        esTranslations.overview.exportResponses.status.inProgress,
      [AnswerStatus.COMPLETE]:
        esTranslations.overview.exportResponses.status.complete,
      empty: esTranslations.overview.exportResponses.status.empty,
    },
    response: {
      [AnswerValue.YES]: esTranslations.overview.exportResponses.response.yes,
      [AnswerValue.PARTLY]:
        esTranslations.overview.exportResponses.response.partly,
      [AnswerValue.NO]: esTranslations.overview.exportResponses.response.no,
      [AnswerValue.NA]: esTranslations.overview.exportResponses.response.na,
      empty: esTranslations.overview.exportResponses.response.empty,
    },
  },
  fr: {
    headers: [
      frTranslations.overview.exportResponses.headers.id,
      frTranslations.overview.exportResponses.headers.theme,
      frTranslations.overview.exportResponses.headers.enablingCondition,
      frTranslations.overview.exportResponses.headers.keyFactor,
      frTranslations.overview.exportResponses.headers.status,
      frTranslations.overview.exportResponses.headers.response,
      frTranslations.overview.exportResponses.headers.rationale,
    ],
    theme: {
      Motivate: frTranslations.navigation.themes.motivate,
      Enable: frTranslations.navigation.themes.enable,
      Implement: frTranslations.navigation.themes.implement,
    },
    status: {
      [AnswerStatus.NOT_STARTED]:
        frTranslations.overview.exportResponses.status.notStarted,
      [AnswerStatus.IN_PROGRESS]:
        frTranslations.overview.exportResponses.status.inProgress,
      [AnswerStatus.COMPLETE]:
        frTranslations.overview.exportResponses.status.complete,
      empty: frTranslations.overview.exportResponses.status.empty,
    },
    response: {
      [AnswerValue.YES]: frTranslations.overview.exportResponses.response.yes,
      [AnswerValue.PARTLY]:
        frTranslations.overview.exportResponses.response.partly,
      [AnswerValue.NO]: frTranslations.overview.exportResponses.response.no,
      [AnswerValue.NA]: frTranslations.overview.exportResponses.response.na,
      empty: frTranslations.overview.exportResponses.response.empty,
    },
  },
  pt: {
    headers: [
      ptTranslations.overview.exportResponses.headers.id,
      ptTranslations.overview.exportResponses.headers.theme,
      ptTranslations.overview.exportResponses.headers.enablingCondition,
      ptTranslations.overview.exportResponses.headers.keyFactor,
      ptTranslations.overview.exportResponses.headers.status,
      ptTranslations.overview.exportResponses.headers.response,
      ptTranslations.overview.exportResponses.headers.rationale,
    ],
    theme: {
      Motivate: ptTranslations.navigation.themes.motivate,
      Enable: ptTranslations.navigation.themes.enable,
      Implement: ptTranslations.navigation.themes.implement,
    },
    status: {
      [AnswerStatus.NOT_STARTED]:
        ptTranslations.overview.exportResponses.status.notStarted,
      [AnswerStatus.IN_PROGRESS]:
        ptTranslations.overview.exportResponses.status.inProgress,
      [AnswerStatus.COMPLETE]:
        ptTranslations.overview.exportResponses.status.complete,
      empty: ptTranslations.overview.exportResponses.status.empty,
    },
    response: {
      [AnswerValue.YES]: ptTranslations.overview.exportResponses.response.yes,
      [AnswerValue.PARTLY]:
        ptTranslations.overview.exportResponses.response.partly,
      [AnswerValue.NO]: ptTranslations.overview.exportResponses.response.no,
      [AnswerValue.NA]: ptTranslations.overview.exportResponses.response.na,
      empty: ptTranslations.overview.exportResponses.response.empty,
    },
  },
} as const

const sanitizeFilenamePart = (value: string) =>
  value
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^A-Za-z0-9._-]/g, '_')
    .replace(/_+/g, '_')

const buildTimestamp = (date: Date) => {
  const pad = (value: number) => String(value).padStart(2, '0')

  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
    '_',
    pad(date.getHours()),
    pad(date.getMinutes()),
    pad(date.getSeconds()),
  ].join('')
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('assessment_session')

    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const validation = validateSessionCookie(sessionCookie.value, id)

    if (!validation.valid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const languageParam = request.nextUrl.searchParams.get('language')
    const language = normalizeLocale(languageParam)

    const { getAssessmentById, getLocalizedQuestionsWithAnswers } =
      await import('@/db/queries/assessment-queries')

    const assessment = await getAssessmentById(id)

    if (!assessment) {
      return NextResponse.json(
        { error: 'Assessment not found' },
        { status: 404 },
      )
    }

    const questions = await getLocalizedQuestionsWithAnswers(id, language)
    const labels = exportLabels[language]
    const rows = questions.map((question) => [
      question.questionCode,
      labels.theme[question.theme] ?? question.theme,
      question.enablingCondition,
      question.keySuccessFactor,
      question.answer?.status
        ? (labels.status[question.answer.status] ?? labels.status.empty)
        : labels.status.empty,
      question.answer?.value
        ? (labels.response[question.answer.value] ?? labels.response.empty)
        : labels.response.empty,
      richTextToPlainText(question.answer?.rationale),
    ])

    const workbook = createWorkbookBuffer(labels.headers, rows)
    const filename = `${sanitizeFilenamePart(assessment.title)}-${buildTimestamp(new Date())}.xlsx`

    return new NextResponse(workbook, {
      status: 200,
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': workbook.length.toString(),
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    console.error('Export responses error:', error)

    return NextResponse.json(
      { error: 'Failed to export responses' },
      { status: 500 },
    )
  }
}
