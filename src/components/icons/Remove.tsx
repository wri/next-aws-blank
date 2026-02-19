import React from 'react'
import { Icon, IconProps } from '@chakra-ui/react'

export const RemoveIcon = (props: IconProps) => (
  <Icon {...props}>
    <svg viewBox='0 0 24 24' height='24px' width='24px'>
      <path
        d='M19 13H5V11H19V13Z'
        fill='currentColor'
      />
    </svg>
  </Icon>
)
