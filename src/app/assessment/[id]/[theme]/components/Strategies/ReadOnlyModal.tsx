import { PlainContributor, Strategy } from '@/types/answer.types'
import { Modal } from '@worldresources/wri-design-systems'
import { formatDeadline } from './utils'

const StrategiesReadOnlyModal = ({
  strategy,
  keySuccessFactor,
  onClose,
  allContributors,
}: {
  strategy: Strategy | undefined
  keySuccessFactor: string
  onClose: () => void
  allContributors: PlainContributor[]
}) => {
  if (!strategy || !strategy.id) return null

  const responsibilities = strategy.responsibility
    ? JSON.parse(strategy.responsibility)
    : []
  const selectedContributors = allContributors.filter((c) =>
    responsibilities.includes(c.id),
  )

  return (
    <Modal
      open={!!strategy?.id}
      onClose={onClose}
      header={<p className='font-bold text-neutral-800'>Strategy</p>}
      content={
        <div className='text-neutral-800'>
          <div className='mb-6'>
            <p className='font-bold mb-1'>Title</p>
            <p>{strategy?.title || 'No title'}</p>
          </div>

          <div className='mb-6'>
            <p className='font-bold mb-1'>Related key success factor</p>
            <p>{keySuccessFactor}</p>
          </div>

          <div className='mb-6'>
            <p className='font-bold mb-1'>Description</p>
            {strategy?.description ? (
              <div
                className='[&_h1]:text-2xl [&_h1]:font-bold [&_h1]:text-neutral-800 [&_h1]:mb-1 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-neutral-800 [&_h2]:mb-1 [&_h3]:text-lg [&_h3]:font-bold [&_h3]:text-neutral-800 [&_h3]:mb-1 [&_p]:text-neutral-800 [&_p]:mb-2'
                dangerouslySetInnerHTML={{
                  __html: strategy.description,
                }}
              />
            ) : (
              'No description'
            )}
          </div>

          <div className='mb-6'>
            <p className='font-bold mb-1'>Priority</p>
            <p>
              {strategy.priority
                ? strategy.priority.charAt(0).toUpperCase() +
                  strategy.priority.slice(1)
                : 'N/A'}
            </p>
          </div>

          <div className='mb-6'>
            <p className='font-bold mb-1'>Scale</p>
            <p>{strategy.scale || 'N/A'}</p>
          </div>

          <div className='mb-6'>
            <p className='font-bold mb-1'>Deadline</p>
            <p>{formatDeadline(strategy.deadline) || 'N/A'}</p>
          </div>

          <div className='mb-6'>
            <p className='font-bold mb-1'>Responsibility</p>
            <p>
              {selectedContributors?.length > 0
                ? selectedContributors.map((c) => c.name).join(', ')
                : 'N/A'}
            </p>
          </div>
        </div>
      }
    />
  )
}

export default StrategiesReadOnlyModal
