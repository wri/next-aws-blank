import React from 'react'
import { Icon, IconProps } from '@chakra-ui/react'

export const FilterIcon = (props: IconProps) => (
  <Icon {...props}>
    <svg viewBox="0 0 12 12" width="12px" height="12px">
      <path
        d="M1 2H11V3H1V2ZM3 5H9V6H3V5ZM5 8H7V9H5V8Z"
        fill="currentColor"
      />
    </svg>
  </Icon>
)
