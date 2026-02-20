import React from 'react'

import { Icon, IconProps } from '@chakra-ui/react'

export const PlusIcon = (props: IconProps) => (
  <Icon {...props}>
    {/* <svg
      width='16'
      height='16'
      viewBox='0 0 16 16'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <path d="M3.54167 4H16V5.79167H3.54167V4ZM3.54167 12.9167V11.125H16V12.9167H3.54167ZM3.54167 9.33333V7.58333H16V9.33333H3.54167ZM0 5.79167V4H1.79167V5.79167H0ZM0 12.9167V11.125H1.79167V12.9167H0ZM0 9.33333V7.58333H1.79167V9.33333H0Z" fill="currentColor"/>
    </svg> */}
    <svg 
      width="10" 
      height="10" 
      viewBox="0 0 10 10" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg">
        <path d="M4.28571 5.71429H0V4.28571H4.28571V0H5.71429V4.28571H10V5.71429H5.71429V10H4.28571V5.71429Z" fill="currentColor"/>
    </svg>
  </Icon>
)
