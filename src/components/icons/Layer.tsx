import React from 'react'

interface LayerIconProps {
  width?: string
  height?: string
  className?: string
}

export const LayerIcon: React.FC<LayerIconProps> = ({
  width = '16',
  height = '16',
  className,
}) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={width} 
      height={height} 
      viewBox="0 0 16 16" 
      fill="none"
      className={className}
    >
      <path d="M7.55905 16L0 10.1207L1.38583 9.07087L7.55905 13.8583L13.7323 9.07087L15.1181 10.1207L7.55905 16ZM7.55905 11.7585L0 5.87926L7.55905 0L15.1181 5.87926L7.55905 11.7585Z" fill="currentColor"/>
    </svg>
  )
}
