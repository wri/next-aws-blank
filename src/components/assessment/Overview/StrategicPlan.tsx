'use client'

import SectionTitle from './SectionTitle'
import CardContainer from './CardContainer'
import { QuestionWithAnswer } from '@/types/questions.types'
import {
  Table,
  TableCell,
  TableRow,
  Tag,
} from '@worldresources/wri-design-systems'
import { PlainContributor, Strategy } from '@/types/answer.types'
import {
  formatDeadline,
  isKnownStatus,
  sortStrategies,
} from '@/app/assessment/[id]/[theme]/components/Strategies/utils'
import { useState } from 'react'
import StrategiesReadOnlyModal from '@/app/assessment/[id]/[theme]/components/Strategies/ReadOnlyModal'
import Link from 'next/link'
import { useTranslations } from '@/i18n/useTranslations'
import ExportStrategies from './ExportStrategies'

interface StrategicPlanProps {
  assessmentId: string
  questions: QuestionWithAnswer[]
  allContributors: PlainContributor[]
}

interface Data {
  keySuccessFactor: string
  theme: string
  questionCode: string
  id: string
  title: string
  description: string
  scale: string
  deadline: string
  responsibility: string
  priority: string
  status?: string
}

const StrategicPlan = ({
  assessmentId,
  questions,
  allContributors,
}: StrategicPlanProps) => {
  const [strategyDetails, setStrategyDetails] = useState<Data | undefined>()
  const t = useTranslations()

  const orderedQuestions = questions
    .filter(
      (q) => q.answer?.strategies?.length > 0 && q.answer?.strategies !== '[]',
    )
    .sort((a, b) => a.sortOrder - b.sortOrder)

  const data: Data[] = []
  orderedQuestions.forEach((q) => {
    const strategies = q.answer?.strategies
      ? JSON.parse(q.answer.strategies)
      : []
    strategies.forEach((strategy: Strategy) => {
      data.push({
        keySuccessFactor: q.keySuccessFactor,
        theme: q.theme,
        questionCode: q.questionCode,
        ...strategy,
      })
    })
  })

  return (
    <>
      <div>
        <SectionTitle
          index={3}
          title={t('overview.strategicPlan.sectionTitle')}
          actionButton={data.length > 0 ? <ExportStrategies assessmentId={assessmentId} /> : null}
        />
        <CardContainer
          title={t('overview.strategicPlan.title')}
          caption={t('overview.strategicPlan.caption')}
          hideLabel={t('overview.scope.labels.table')}
          noHorizontalPadding
          noPaddingBottom
        >
          {data.length > 0 ? (
            <Table
              columns={[
                {
                  key: 'title',
                  label: t('overview.strategicPlan.table.headers.strategy'),
                  sortable: true,
                },
                {
                  key: 'keySuccessFactor',
                  label: t(
                    'overview.strategicPlan.table.headers.keySuccessFactor',
                  ),
                  sortable: true,
                },
                {
                  key: 'priority',
                  label: t('overview.strategicPlan.table.headers.priority'),
                  sortable: true,
                },
                {
                  key: 'scale',
                  label: t('overview.strategicPlan.table.headers.scale'),
                  sortable: true,
                },
                {
                  key: 'status',
                  label: t('overview.strategicPlan.table.headers.status'),
                  sortable: true,
                },
              ]}
              data={data}
              renderRow={(row: Data) => {
                const responsibilities = row.responsibility
                  ? JSON.parse(row.responsibility)
                  : []
                const selectedContributors = allContributors.filter((c) =>
                  responsibilities.includes(c.id),
                )

                return (
                  <TableRow key={row.id}>
                    <TableCell>
                      <div>
                        <p
                          className='text-neutral-800 font-bold underline decoration-dotted cursor-pointer'
                          onClick={() => setStrategyDetails(row)}
                        >
                          {row.title ||
                            t('overview.strategicPlan.table.noTitle')}
                        </p>
                        <div className='flex gap-2 items-center'>
                          {row.deadline ? (
                            <p className='text-neutral-700 text-xs'>
                              {t('overview.strategicPlan.table.estimatedStartDate', {
                                value: formatDeadline(row.deadline),
                              })}
                            </p>
                          ) : (
                            ''
                          )}

                          {row.responsibility ? (
                            <p className='text-neutral-700 text-xs'>
                              {t('overview.strategicPlan.table.ownedBy')}{' '}
                              {selectedContributors
                                .map((c) => c.name)
                                .join(', ')}
                            </p>
                          ) : (
                            ''
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className='w-[300px]'>
                      <Link
                        href={`/assessment/${assessmentId}/${row.theme.toLowerCase()}?questionCode=${row.questionCode}`}
                        className='text-neutral-800 underline decoration-dotted cursor-pointer'
                      >
                        {row.keySuccessFactor}
                      </Link>
                    </TableCell>
                    <TableCell className='w-28'>
                      <div className='flex'>
                        {row.priority ? (
                          <Tag
                            label={t(
                              `overview.strategicPlan.table.priorities.${row.priority}`,
                            )}
                            variant={
                              row.priority === 'low'
                                ? 'success'
                                : row.priority === 'medium'
                                  ? 'warning'
                                  : 'error'
                            }
                          />
                        ) : (
                          '--'
                        )}
                      </div>
                    </TableCell>
                    <TableCell className='w-56'>
                      {row.scale
                        ? t(`overview.strategicPlan.table.scales.${row.scale}`)
                        : '--'}
                    </TableCell>
                    <TableCell className='w-40'>
                      {row.status
                        ? isKnownStatus(row.status)
                          ? t(`assessment.strategies.fields.status.options.${row.status}`)
                          : row.status
                        : '--'}
                    </TableCell>
                  </TableRow>
                )
              }}
              onSortColumn={({ key, order }) => {
                data.sort((a, b) => sortStrategies(a, b, key as string, order))
              }}
            />
          ) : (
            <div className='flex flex-col items-center gap-2 py-10 bg-neutral-200'>
              <p className='text-xl font-bold text-neutral-800'>
                {t('overview.strategicPlan.empty.title')}
              </p>
              <p className='text-neutral-700'>
                {t('overview.strategicPlan.empty.description')}
              </p>
            </div>
          )}
        </CardContainer>
      </div>

      <StrategiesReadOnlyModal
        strategy={strategyDetails as Strategy | undefined}
        keySuccessFactor={strategyDetails?.keySuccessFactor || ''}
        onClose={() => setStrategyDetails(undefined)}
        allContributors={allContributors}
      />
    </>
  )
}

export default StrategicPlan
