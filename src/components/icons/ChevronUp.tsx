import React from 'react'

import { Icon, IconProps } from '@chakra-ui/react'

export const ChevronUpIcon = (props: IconProps) => (
  <Icon {...props}>
    <svg
      width='16'
      height='16'
      viewBox='0 0 16 16'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <path
        d='M8 2.63333L16 10.6333L14.1333 12.5L8 6.36667L1.86667 12.5L0 10.6333L8 2.63333Z'
        fill='currentColor'
      />
    </svg>
  </Icon>
)
