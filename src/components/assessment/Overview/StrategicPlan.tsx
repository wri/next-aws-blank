'use client'

import SectionTitle from './SectionTitle'
import CardContainer from './CardContainer'
import { Questions } from '@/types/questions.types'
import {
  Table,
  TableCell,
  TableRow,
  Tag,
} from '@worldresources/wri-design-systems'
import { PlainContributor, Strategy } from '@/types/answer.types'
import {
  formatDeadline,
  sortStrategies,
} from '@/app/assessment/[id]/[theme]/components/Strategies/utils'
import { useState } from 'react'
import StrategiesReadOnlyModal from '@/app/assessment/[id]/[theme]/components/Strategies/ReadOnlyModal'
import Link from 'next/link'

interface StrategicPlanProps {
  assessmentId: string
  questions: Questions[]
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
}

const StrategicPlan = ({
  assessmentId,
  questions,
  allContributors,
}: StrategicPlanProps) => {
  const [strategyDetails, setStrategyDetails] = useState<Data | undefined>()

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
        <SectionTitle index={3} title='Strategic Plan' />
        <CardContainer
          title='Strategic Plan'
          caption='All strategies added across Diagnostic factors.'
          hideLabel='table'
          noHorizontalPadding
          noPaddingBottom
        >
          {data.length > 0 ? (
            <Table
              columns={[
                { key: 'title', label: 'Strategy', sortable: true },
                {
                  key: 'keySuccessFactor',
                  label: 'Key Success Factor',
                  sortable: true,
                },
                { key: 'priority', label: 'Priority', sortable: true },
                { key: 'scale', label: 'Scale', sortable: true },
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
                          {row.title || 'No title'}
                        </p>
                        <div className='flex gap-2 items-center'>
                          {row.deadline ? (
                            <p className='text-neutral-700 text-xs'>
                              Deadline {formatDeadline(row.deadline)}
                            </p>
                          ) : (
                            ''
                          )}

                          {row.responsibility ? (
                            <p className='text-neutral-700 text-xs'>
                              Owned by{' '}
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
                            label={
                              row.priority.charAt(0).toUpperCase() +
                              row.priority.slice(1)
                            }
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
                    <TableCell className='w-56'>{row.scale || '--'}</TableCell>
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
                No strategies created
              </p>
              <p className='text-neutral-700'>
                When you add strategies under a factor they will appear here
              </p>
            </div>
          )}
        </CardContainer>
      </div>

      <StrategiesReadOnlyModal
        strategy={strategyDetails}
        keySuccessFactor={strategyDetails?.keySuccessFactor || ''}
        onClose={() => setStrategyDetails(undefined)}
        allContributors={allContributors}
      />
    </>
  )
}

export default StrategicPlan
