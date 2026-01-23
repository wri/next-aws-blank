'use client'

import { useEffect, useRef, useState } from 'react'
import { Button, getThemedColor } from '@worldresources/wri-design-systems'
import { ChevronDownIcon, MapIcon } from '../../icons'
import BaseMapContent from './BaseMapContent'

const BaseMapSettings = () => {
  const [selectedOption, setSelectedOption] = useState({
    id: 'arcgis-hybrid',
    label: 'Mapbox Light',
    caption: 'Subtle map that provides basic geographic context.',
    imageUrl:
      'https://carto.com/help/images/building-maps/basemaps/dark_labels.png',
    active: true,
  })
  const [isOpenBaseMap, setIsOpenBaseMap] = useState(false)
  const baseMapContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (baseMapContainerRef.current) {
      baseMapContainerRef.current.inert = !isOpenBaseMap
    }
  }, [isOpenBaseMap])

  return (
    <div
      style={{
        height: '500px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
      }}
    >
      <div
        ref={baseMapContainerRef}
        style={{
          height: isOpenBaseMap ? '400px' : 0,
          overflow: 'hidden',
          transition: 'height 0.3s ease-in-out',
        }}
        aria-hidden={!isOpenBaseMap}
      >
        <BaseMapContent
          defaultOption={selectedOption}
          onSelectedOption={setSelectedOption}
        />
      </div>

      <Button
        style={{ width: '260px' }}
        variant='secondary'
        leftIcon={<MapIcon />}
        aria-label={`Base map: ${selectedOption?.label}`}
        rightIcon={
          isOpenBaseMap ? <ChevronDownIcon rotate='180' /> : <ChevronDownIcon />
        }
        onClick={() => setIsOpenBaseMap(!isOpenBaseMap)}
      >
        <p
          style={{
            width: '200px',
            fontWeight: 'bold',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textAlign: 'left',
            color: getThemedColor('neutral', 800),
          }}
        >
          {`Base map: ${selectedOption?.label}`}
        </p>
      </Button>
    </div>
  )
}

export default BaseMapSettings
