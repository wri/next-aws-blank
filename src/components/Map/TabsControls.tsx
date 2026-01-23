'use client'

import { MobileTabBar, Sheet } from '@worldresources/wri-design-systems'
import { useRef, useState } from 'react'
import LayerPanel from './LayerPanel'
import LegendPanel from './LegendPanel'
import BaseMapContent from './BaseMapSettings/BaseMapContent'
import clsx from 'clsx'
import { PlaceholderIcon } from '../icons'

type TabValue = 'add-data' | 'legend' | 'base-map'

const TabsControls = () => {
  const [tabValue, setTabValue] = useState<TabValue>('add-data')
  const [isOpenSheet, setIsOpenSheet] = useState(true)
  const addDataTabRef = useRef<HTMLButtonElement>(null)
  const legendTabRef = useRef<HTMLButtonElement>(null)
  const baseMapTabRef = useRef<HTMLButtonElement>(null)
  const refs = {
    'add-data': addDataTabRef,
    legend: legendTabRef,
    'base-map': baseMapTabRef,
  }

  const handleOnTabClick = (tabValue: string) => {
    setTabValue(tabValue as TabValue)
    setIsOpenSheet(true)
  }

  let content = <LayerPanel />
  if (tabValue === 'legend') {
    content = <LegendPanel />
  } else if (tabValue === 'base-map') {
    content = <BaseMapContent maxWidth='100%' />
  }

  return (
    <div className='h-full w-screen sm:max-w-[400px] relative'>
      <div className='w-full absolute bottom-10'>
        {isOpenSheet ? (
          <Sheet
            className='custom-sheet-styles'
            content={content}
            minimizedHeight={80}
            midHeight={300}
            maxFullHeight={400}
            open={isOpenSheet}
            onClose={() => {
              setIsOpenSheet(false)
              refs[tabValue]?.current?.focus()
            }}
            blocking={false}
            zIndex={1000}
            defaultSnap='mid'
          />
        ) : null}
      </div>
      <div
        className={clsx(
          'w-full absolute bottom-0 sm:rounded-b-2xl overflow-hidden z-[1001]',
          isOpenSheet ? '' : 'sm:rounded-t-2xl',
        )}
      >
        <MobileTabBar
          tabs={[
            {
              label: 'Add Data',
              value: 'add-data',
              icon: <PlaceholderIcon />,
              ref: addDataTabRef,
            },
            {
              label: 'Legend',
              value: 'legend',
              icon: <PlaceholderIcon />,
              ref: legendTabRef,
            },
            {
              label: 'Base Map',
              value: 'base-map',
              icon: <PlaceholderIcon />,
              ref: baseMapTabRef,
            },
          ]}
          onTabClick={(value) => handleOnTabClick(value)}
        />
      </div>
    </div>
  )
}

export default TabsControls
