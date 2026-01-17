import React from 'react'
import { getThemedColor } from '@worldresources/wri-design-systems'

export const NumberIcon = ({ value }: { value: string }) => (
  <div
    style={{
      background: getThemedColor('primary', 300),
      height: '24px',
      width: '24px',
      textAlign: 'center',
    }}
  >
    {value}
  </div>
)
