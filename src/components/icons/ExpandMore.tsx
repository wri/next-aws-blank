import React from 'react'

import { Icon, IconProps } from '@chakra-ui/react'

export const ExpandMoreIcon = (props: IconProps) => (
  <Icon {...props}>
    <svg viewBox='0 0 24 24' height='24px' width='24px'>
      <path
        d='M16.59 8.59L12 13.17L7.41 8.59L6 10L12 16L18 10L16.59 8.59Z'
        fill='currentColor'
      />
    </svg>
  </Icon>
)
