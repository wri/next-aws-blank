import React from 'react'

import { Icon, IconProps } from '@chakra-ui/react'

export const SendIcon = (props: IconProps) => (
  <Icon {...props}>
    <svg
      width='16'
      height='16'
      viewBox='0 0 16 16'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <path
        d='M0 14.5V10.1667L6.4 8L0 5.83333V1.5L16 8L0 14.5Z'
        fill='currentColor'
      />
    </svg>
  </Icon>
)
