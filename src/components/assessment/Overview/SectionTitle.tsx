import { TabBar } from '@worldresources/wri-design-systems'

const SectionTitle = ({
  index,
  title,
  onProgressClick,
  onResponsesClick,
}: {
  index: number
  title: string
  onProgressClick?: () => void
  onResponsesClick?: () => void
}) => {
  return (
    <div className='mb-6'>
      <div className='flex items-center gap-3'>
        <div className='w-10 h-10 bg-secondary-200 flex items-center justify-center rounded-[5px] text-secondary-700 font-bold text-4xl pt-[6px]'>
          {index}
        </div>
        <h2 className='text-3xl font-bold text-neutral-800'>{title}</h2>
        <hr className='w-full h-[1px] bg-neutral-300 flex-1' />

        {onProgressClick && onResponsesClick ? (
          <div className='w-[280px]'>
            <TabBar
              tabs={[
                { label: 'Progress', value: 'progress' },
                { label: 'Responses', value: 'responses' },
              ]}
              onTabClick={(value) => {
                if (value === 'progress') {
                  onProgressClick()
                } else {
                  onResponsesClick()
                }
              }}
              variant='view'
            />
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default SectionTitle
