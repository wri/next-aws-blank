import React from 'react'

import { Icon, IconProps } from '@chakra-ui/react'

export const NoAnswerIcon = (props: IconProps) => (
  <Icon {...props}>
    <svg viewBox='0 0 32 32' height='32px' width='32px'>
      <path
        d='M16 0C24.8366 0 32 7.16344 32 16C32 24.8366 24.8366 32 16 32C7.16344 32 0 24.8366 0 16C0 7.16344 7.16344 0 16 0ZM16 14.4004L9.59961 8L8 9.59961L14.4004 16L8 22.4004L9.59961 24L16 17.5996L22.4004 24L24 22.4004L17.5996 16L24 9.59961L22.4004 8L16 14.4004Z'
        fill='currentColor'
      />
    </svg>
  </Icon>
)
