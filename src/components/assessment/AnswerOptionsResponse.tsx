import {
  YesAnswerIcon,
  PartlyAnswerIcon,
  NoAnswerIcon,
} from '@/components/icons'

const AnswerOptionsResponse = ({ value = '' }: { value: string }) => {
  let icon = <YesAnswerIcon className='text-success-500 h-6 w-6' />
  let text = value

  if (value?.toLowerCase() === 'yes') {
    icon = <YesAnswerIcon className='text-success-500 h-6 w-6' />
  } else if (value?.toLowerCase() === 'partly') {
    icon = <PartlyAnswerIcon className='text-warning-500 h-6 w-6' />
  } else if (value?.toLowerCase() === 'no') {
    icon = <NoAnswerIcon className='text-error-500 h-6 w-6' />
  } else if (value?.toLowerCase() === 'na') {
    icon = <div className='border-2 border-neutral-600 h-6 w-6 rounded-full' />
    text = 'N/A'
  } else {
    icon = <div className='bg-neutral-600 h-[3px] w-6' />
  }

  return (
    <div className='h-6 flex items-center gap-1.5'>
      {icon}
      <p className='text-neutral-800 capitalize'>{text}</p>
    </div>
  )
}

export default AnswerOptionsResponse
