import { Button, Tag } from '@worldresources/wri-design-systems'
import { ChevronDownIcon, EditIcon } from '../../icons'
import { Collapsible } from '@chakra-ui/react'
import { useState } from 'react'
import { TrailingIcon } from '../../icons/Trailing'
import clsx from 'clsx'

const CardContainer = ({
  title,
  children,
  onStart,
  onContinue,
  onEdit,
  hideLabel,
  noHorizontalPadding,
  tag,
}: {
  title: string
  children: React.ReactNode
  onStart?: () => void
  onContinue?: () => void
  onEdit?: () => void
  hideLabel?: string
  noHorizontalPadding?: boolean
  tag?: string
}) => {
  const [open, setOpen] = useState(false)

  let tagVariant = 'info-grey' as
    | 'info-white'
    | 'info-grey'
    | 'success'
    | 'warning'
    | 'error'
  if (tag === 'Complete') tagVariant = 'success'

  return (
    <div
      className={clsx(
        'py-4 bg-white rounded-lg border border-neutral-300 shadow-sm mb-5',
        noHorizontalPadding ? 'px-0' : 'px-4',
      )}
    >
      <Collapsible.Root open={open} onOpenChange={(e) => setOpen(e.open)}>
        <div
          className={clsx(
            'flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:gap-2 gap-1',
            noHorizontalPadding ? 'px-4' : 'px-0',
          )}
        >
          <div className='flex items-center gap-2'>
            <p className='text-2xl font-bold text-neutral-900'>{title}</p>
            {tag ? <Tag label={tag} variant={tagVariant} size='small' /> : null}
          </div>

          <div className='flex items-center gap-2'>
            {onStart ? (
              <Button
                onClick={onStart}
                className='text-sm text-neutral-500'
                size='small'
              >
                Start <TrailingIcon className='ml-1.5' />
              </Button>
            ) : onContinue ? (
              <Button
                onClick={onContinue}
                className='text-sm text-neutral-500'
                size='small'
              >
                Continue <TrailingIcon className='ml-1.5' />
              </Button>
            ) : null}

            {onEdit ? (
              <Button
                onClick={onEdit}
                className='text-sm text-neutral-500'
                size='small'
              >
                <EditIcon className='mr-1.5' />
                Edit
              </Button>
            ) : null}

            {hideLabel ? (
              <Collapsible.Trigger asChild>
                <Button
                  onClick={() => setOpen(!open)}
                  size='small'
                  variant='secondary'
                  label={`${open ? 'Hide' : 'Show'} ${hideLabel}`}
                  rightIcon={
                    <ChevronDownIcon className={open ? 'rotate-180' : ''} />
                  }
                />
              </Collapsible.Trigger>
            ) : null}
          </div>
        </div>

        <Collapsible.Content>{children}</Collapsible.Content>
      </Collapsible.Root>
    </div>
  )
}

export default CardContainer
