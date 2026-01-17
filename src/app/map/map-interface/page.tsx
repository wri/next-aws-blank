'use client'

import BaseMapSettings from '@/components/Map/BaseMapSettings'
import LayerPanel from '@/components/Map/LayerPanel'
import LegendPanel from '@/components/Map/LegendPanel'
import MapControls from '@/components/Map/MapControls'
import TabsControls from '@/components/Map/TabsControls'
import useResponsiveFlags from '@/hooks/useResponsiveFlags'
import { Search } from '@worldresources/wri-design-systems'
import { MapIcon } from '@/components/icons'

const sampleOptions = [
  {
    id: '1',
    label: 'Location Name 1',
    caption: 'City • Address',
    icon: <MapIcon />,
  },
  {
    id: '2',
    label: 'Location Name 2',
    caption: 'City • Address',
    icon: <MapIcon />,
  },
  {
    id: '3',
    label: 'Location Name 3',
    caption: 'City • Address',
    icon: <MapIcon />,
  },
]

const MapInterface = () => {
  const { isWindowReady, isSmallTablet, isMobile } = useResponsiveFlags()

  if (!isWindowReady) {
    return null
  }

  return (
    <div className='h-full w-full flex relative'>
      <div className='h-full w-full bg-gray-400' />

      {!isSmallTablet ? (
        <div className='h-full w-80 absolute top-0 left-0'>
          <LayerPanel />
        </div>
      ) : null}

      {!isSmallTablet ? (
        <div className='h-full p-5 absolute top-0 left-80 overflow-y-hidden'>
          <LegendPanel />
        </div>
      ) : null}

      {!isMobile ? (
        <div className='absolute top-0 right-0 z-50 h-auto p-5 flex items-start gap-3'>
          <div style={{ marginTop: '-8px' }}>
            <Search options={sampleOptions} />
          </div>

          <div>
            <MapControls />
          </div>
        </div>
      ) : null}

      {!isSmallTablet ? (
        <div className='absolute bottom-4 right-4'>
          <BaseMapSettings />
        </div>
      ) : null}

      {isSmallTablet ? (
        <div className='absolute bottom-0 right-0 sm:bottom-4 sm:right-4'>
          <TabsControls />
        </div>
      ) : null}
    </div>
  )
}

export default MapInterface
