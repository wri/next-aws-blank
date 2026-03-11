import { PlainContributor, Strategy } from '@/types/answer.types'
import {
  Table,
  TableCell,
  TableRow,
  Tag,
} from '@worldresources/wri-design-systems'
import { useState } from 'react'
import { formatDeadline } from './utils'
import StrategiesReadOnlyModal from './ReadOnlyModal'

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

  const strategiesData = JSON.parse(strategies) as Strategy[]

  return (
    <>
      <div className='!mt-8'>
        <div className='flex items-center gap-3 mb-1'>
          <p className='font-bold text-neutral-900'>Strategies</p>
        </div>

        <Table
          columns={[
            { key: 'title', label: 'Strategy', sortable: true },
            { key: 'priority', label: 'Priority', sortable: true },
            { key: 'scale', label: 'Scale', sortable: true },
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
                      {row.title || 'No title'}
                    </p>
                    <div className='flex gap-2 items-center'>
                      {row.deadline ? (
                        <p className='text-neutral-700 text-xs'>
                          Due {formatDeadline(row.deadline)}
                        </p>
                      ) : (
                        ''
                      )}

                      {row.responsibility ? (
                        <p className='text-neutral-700 text-xs'>
                          Owned by{' '}
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
            strategiesData.sort((a, b) => {
              const aValue = a[key as keyof Strategy] || ''
              const bValue = b[key as keyof Strategy] || ''
              return order === 'asc'
                ? aValue.localeCompare(bValue)
                : bValue.localeCompare(aValue)
            })
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
