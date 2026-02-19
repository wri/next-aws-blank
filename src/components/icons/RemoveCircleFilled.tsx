import React from 'react'
import { Icon, IconProps } from '@chakra-ui/react'

export const RemoveCircleFilledIcon = (props: IconProps) => (
  <Icon {...props}>
    <svg viewBox='0 0 24 24' height='24px' width='24px'>
      <path
        d='M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM17 13H7V11H17V13Z'
        fill='currentColor'
      />
    </svg>
  </Icon>
)
