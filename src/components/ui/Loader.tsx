import { Spinner } from '@chakra-ui/react'

const Loader = () => {
  return (
    <div className='flex items-center justify-center p-5'>
      <Spinner size='lg' color='primary.600' />
    </div>
  )
}

export default Loader
