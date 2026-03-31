import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { validateSessionCookie } from '@/utils/session'
import { createWorkbookBuffer } from '@/utils/xlsx'
import { AnswerStatus, AnswerValue } from '@/db/entities/Answer.entity'
import { richTextToPlainText } from '@/utils/validation'
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
    priority: Record<string, string>
    scale: Record<string, string>
  }
> = {
  en: {
    headers: [
      enTranslations.overview.exportStrategies.headers.strategyTitle,
      enTranslations.overview.exportStrategies.headers.keyFactor,
      enTranslations.overview.exportStrategies.headers.priority,
      enTranslations.overview.exportStrategies.headers.scale,
      enTranslations.overview.exportStrategies.headers.deadline,
      enTranslations.overview.exportStrategies.headers.responsibility,
      enTranslations.overview.exportStrategies.headers.status,
      enTranslations.overview.exportStrategies.headers.description,
    ],
    theme: {
      Motivate: enTranslations.navigation.themes.motivate,
      Enable: enTranslations.navigation.themes.enable,
      Implement: enTranslations.navigation.themes.implement,
    },
    status: {
      [AnswerStatus.NOT_STARTED]:
        enTranslations.overview.exportStrategies.status.notStarted,
      [AnswerStatus.IN_PROGRESS]:
        enTranslations.overview.exportStrategies.status.inProgress,
      [AnswerStatus.COMPLETE]:
        enTranslations.overview.exportStrategies.status.complete,
      empty: enTranslations.overview.exportStrategies.status.empty,
    },
    response: {
      [AnswerValue.YES]: enTranslations.overview.exportStrategies.response.yes,
      [AnswerValue.PARTLY]:
        enTranslations.overview.exportStrategies.response.partly,
      [AnswerValue.NO]: enTranslations.overview.exportStrategies.response.no,
      [AnswerValue.NA]: enTranslations.overview.exportStrategies.response.na,
      empty: enTranslations.overview.exportStrategies.response.empty,
    },
    priority: enTranslations.overview.exportStrategies.priority,
    scale: enTranslations.overview.exportStrategies.scale,
  },
  es: {
    headers: [
      esTranslations.overview.exportStrategies.headers.strategyTitle,
      esTranslations.overview.exportStrategies.headers.keyFactor,
      esTranslations.overview.exportStrategies.headers.priority,
      esTranslations.overview.exportStrategies.headers.scale,
      esTranslations.overview.exportStrategies.headers.deadline,
      esTranslations.overview.exportStrategies.headers.responsibility,
      esTranslations.overview.exportStrategies.headers.status,
      esTranslations.overview.exportStrategies.headers.description,
    ],
    theme: {
      Motivate: esTranslations.navigation.themes.motivate,
      Enable: esTranslations.navigation.themes.enable,
      Implement: esTranslations.navigation.themes.implement,
    },
    status: {
      [AnswerStatus.NOT_STARTED]:
        esTranslations.overview.exportStrategies.status.notStarted,
      [AnswerStatus.IN_PROGRESS]:
        esTranslations.overview.exportStrategies.status.inProgress,
      [AnswerStatus.COMPLETE]:
        esTranslations.overview.exportStrategies.status.complete,
      empty: esTranslations.overview.exportStrategies.status.empty,
    },
    response: {
      [AnswerValue.YES]: esTranslations.overview.exportStrategies.response.yes,
      [AnswerValue.PARTLY]:
        esTranslations.overview.exportStrategies.response.partly,
      [AnswerValue.NO]: esTranslations.overview.exportStrategies.response.no,
      [AnswerValue.NA]: esTranslations.overview.exportStrategies.response.na,
      empty: esTranslations.overview.exportStrategies.response.empty,
    },
    priority: esTranslations.overview.exportStrategies.priority,
    scale: esTranslations.overview.exportStrategies.scale,
  },
  fr: {
    headers: [
      frTranslations.overview.exportStrategies.headers.strategyTitle,
      frTranslations.overview.exportStrategies.headers.keyFactor,
      frTranslations.overview.exportStrategies.headers.priority,
      frTranslations.overview.exportStrategies.headers.scale,
      frTranslations.overview.exportStrategies.headers.deadline,
      frTranslations.overview.exportStrategies.headers.responsibility,
      frTranslations.overview.exportStrategies.headers.status,
      frTranslations.overview.exportStrategies.headers.description,
    ],
    theme: {
      Motivate: frTranslations.navigation.themes.motivate,
      Enable: frTranslations.navigation.themes.enable,
      Implement: frTranslations.navigation.themes.implement,
    },
    status: {
      [AnswerStatus.NOT_STARTED]:
        frTranslations.overview.exportStrategies.status.notStarted,
      [AnswerStatus.IN_PROGRESS]:
        frTranslations.overview.exportStrategies.status.inProgress,
      [AnswerStatus.COMPLETE]:
        frTranslations.overview.exportStrategies.status.complete,
      empty: frTranslations.overview.exportStrategies.status.empty,
    },
    response: {
      [AnswerValue.YES]: frTranslations.overview.exportStrategies.response.yes,
      [AnswerValue.PARTLY]:
        frTranslations.overview.exportStrategies.response.partly,
      [AnswerValue.NO]: frTranslations.overview.exportStrategies.response.no,
      [AnswerValue.NA]: frTranslations.overview.exportStrategies.response.na,
      empty: frTranslations.overview.exportStrategies.response.empty,
    },
    priority: frTranslations.overview.exportStrategies.priority,
    scale: frTranslations.overview.exportStrategies.scale,
  },
  pt: {
    headers: [
      ptTranslations.overview.exportStrategies.headers.strategyTitle,
      ptTranslations.overview.exportStrategies.headers.keyFactor,
      ptTranslations.overview.exportStrategies.headers.priority,
      ptTranslations.overview.exportStrategies.headers.scale,
      ptTranslations.overview.exportStrategies.headers.deadline,
      ptTranslations.overview.exportStrategies.headers.responsibility,
      ptTranslations.overview.exportStrategies.headers.status,
      ptTranslations.overview.exportStrategies.headers.description,
    ],
    theme: {
      Motivate: ptTranslations.navigation.themes.motivate,
      Enable: ptTranslations.navigation.themes.enable,
      Implement: ptTranslations.navigation.themes.implement,
    },
    status: {
      [AnswerStatus.NOT_STARTED]:
        ptTranslations.overview.exportStrategies.status.notStarted,
      [AnswerStatus.IN_PROGRESS]:
        ptTranslations.overview.exportStrategies.status.inProgress,
      [AnswerStatus.COMPLETE]:
        ptTranslations.overview.exportStrategies.status.complete,
      empty: ptTranslations.overview.exportStrategies.status.empty,
    },
    response: {
      [AnswerValue.YES]: ptTranslations.overview.exportStrategies.response.yes,
      [AnswerValue.PARTLY]:
        ptTranslations.overview.exportStrategies.response.partly,
      [AnswerValue.NO]: ptTranslations.overview.exportStrategies.response.no,
      [AnswerValue.NA]: ptTranslations.overview.exportStrategies.response.na,
      empty: ptTranslations.overview.exportStrategies.response.empty,
    },
    priority: ptTranslations.overview.exportStrategies.priority,
    scale: ptTranslations.overview.exportStrategies.scale,
  },
} as const

const sanitizeFilenamePart = (value: string) =>
  value
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^A-Za-z0-9._-]/g, '_')
    .replace(/_+/g, '_')

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
    const language = languageParam || 'en'

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
    const labels = exportLabels[language] || exportLabels['en']

    const contributorIds = new Set<string>();

    questions.forEach((question) => {
      const strategies = question.answer?.strategies
        ? JSON.parse(question.answer.strategies)
        : [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      strategies.forEach((strategy: any) => {
        const responsibility = strategy.responsibility
          ? JSON.parse(strategy.responsibility)
          : [];
        responsibility.forEach((id: string) => contributorIds.add(id));
      });
    });

    // get contributors names
    let contributorMap: Record<string, string> = {};
    if (contributorIds.size > 0) {
      const { getContributorsByIds } = await import('@/db/queries/assessment-queries')
      const contributors = await getContributorsByIds(Array.from(contributorIds));
      contributorMap = contributors.reduce(
        (map: Record<string, string>, contributor: { id: string; name: string }) => {
          map[contributor.id] = contributor.name;
          return map;
        },
        {},
      );
    }

    // Extract strategies and map to rows for file
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows: any[] = []
    questions.forEach((question) => {
      const strategies = question.answer?.strategies
        ? JSON.parse(question.answer.strategies)
        : []

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      strategies.forEach((strategy: any) => {
        const responsibilityIds: string[] = strategy.responsibility
          ? JSON.parse(strategy.responsibility)
          : [];
        const responsibilityNames = responsibilityIds
          .map((id: string) => contributorMap[id] || id)
          .join(', ');

        const priorityKey = strategy.priority || 'empty'
        const scaleKey = strategy.scale || ''
        const statusKey = strategy.status || 'not_started'

        rows.push([
          strategy.title,
          question.keySuccessFactor,
          labels.priority[priorityKey] ?? strategy.priority,
          labels.scale[scaleKey] ?? strategy.scale,
          strategy.deadline,
          responsibilityNames,
          labels.status[statusKey as AnswerStatus | 'empty'] ?? statusKey,
          richTextToPlainText(strategy.description),
        ])
      })
    })

    // Generate Excel file
    const workbook = createWorkbookBuffer(labels.headers, rows, 'Strategies')
    const filename = `${sanitizeFilenamePart(assessment.title)}-strategies.xlsx`

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
    console.error('Export strategies error:', error)

    return NextResponse.json(
      { error: 'Failed to export strategies' },
      { status: 500 },
    )
  }
}
