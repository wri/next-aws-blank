'use client'

import { PlainContributor, Strategy } from '@/types/answer.types'
import {
  Table,
  TableCell,
  TableRow,
  Tag,
} from '@worldresources/wri-design-systems'
import { useState } from 'react'
import { formatDeadline, isKnownStatus, sortStrategies } from './utils'
import StrategiesReadOnlyModal from './ReadOnlyModal'
import { useTranslations } from '@/i18n/useTranslations'

const StrategiesReadOnly = ({
  strategies,
  keySuccessFactor,
  allContributors,
}: {
  strategies: string
  keySuccessFactor: string
  allContributors: PlainContributor[]
}) => {
  const [strategyDetails, setStrategyDetails] = useState<Strategy | undefined>()
  const t = useTranslations()

  const strategiesData = JSON.parse(strategies) as Strategy[]

  return (
    <>
      <div className='!mt-8'>
        <div className='flex items-center gap-3 mb-1'>
          <p className='font-bold text-neutral-900'>
            {t('assessment.strategies.heading')}
          </p>
        </div>

        <Table
          columns={[
            {
              key: 'title',
              label: t('assessment.strategies.readOnly.headers.strategy'),
              sortable: true,
            },
            {
              key: 'priority',
              label: t('assessment.strategies.readOnly.headers.priority'),
              sortable: true,
            },
            {
              key: 'scale',
              label: t('assessment.strategies.readOnly.headers.scale'),
              sortable: true,
            },
            {
              key: 'status',
              label: t('assessment.strategies.readOnly.headers.status'),
              sortable: true,
            },
          ]}
          data={strategiesData}
          renderRow={(row: Strategy) => {
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
                      {row.title || t('assessment.strategies.readOnly.noTitle')}
                    </p>
                    <div className='flex gap-2 items-center'>
                      {row.deadline ? (
                        <p className='text-neutral-700 text-xs'>
                          {t('assessment.strategies.readOnly.estimatedStartDate', {
                            value: formatDeadline(row.deadline),
                          })}
                        </p>
                      ) : (
                        ''
                      )}

                      {row.responsibility ? (
                        <p className='text-neutral-700 text-xs'>
                          {t('assessment.strategies.readOnly.ownedBy')}{' '}
                          {selectedContributors.map((c) => c.name).join(', ')}
                        </p>
                      ) : (
                        ''
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell className='w-28'>
                  <div className='flex'>
                    {row.priority ? (
                      <Tag
                        label={t(
                          `assessment.strategies.fields.priority.options.${row.priority}`,
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
                    ? t(
                        `assessment.strategies.fields.scale.options.${row.scale}`,
                      )
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
            strategiesData.sort((a, b) =>
              sortStrategies(a, b, key as string, order),
            )
          }}
        />
      </div>

      <StrategiesReadOnlyModal
        strategy={strategyDetails}
        keySuccessFactor={keySuccessFactor}
        onClose={() => setStrategyDetails(undefined)}
        allContributors={allContributors}
      />
    </>
  )
}

export default StrategiesReadOnly
