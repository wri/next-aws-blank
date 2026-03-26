'use client'

import { ReactNode } from "react"

const SectionTitle = ({
  index,
  title,
  actionButton,
}: {
  index: number
  title: string
  actionButton?: ReactNode
}) => {

  return (
    <div className='mb-6'>
      <div className='flex items-center justify-between'>
        <div className="flex items-center justify-center gap-3">
          <div className='w-10 h-10 bg-secondary-200 flex items-center justify-center rounded-[5px]'>
            <p className='text-center text-4xl text-secondary-700 font-bold pt-[4px]'>
              {index}
            </p>
          </div>
          <h2 className='text-3xl font-bold text-neutral-800'>{title}</h2>
        </div>
        {actionButton && <div className='ml-4'>{actionButton}</div>}
      </div>
    </div>
  )
}

export default SectionTitle
