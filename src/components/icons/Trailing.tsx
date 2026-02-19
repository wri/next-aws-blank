import React from 'react'

import { Icon, IconProps } from '@chakra-ui/react'

export const TrailingIcon = (props: IconProps) => (
  <Icon {...props}>
    <svg
      width='10'
      height='10'
      viewBox='0 0 10 10'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <path
        d='M3.26786 5L0 1.71429L1 0.714287L5.28571 5L1 9.28572L0 8.28572L3.26786 5ZM7.98214 5L4.71429 1.71429L5.71429 0.714287L10 5L5.71429 9.28572L4.71429 8.28572L7.98214 5Z'
        fill='currentColor'
      />
    </svg>
  </Icon>
)
