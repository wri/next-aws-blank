'use client'

/* eslint-disable @typescript-eslint/no-explicit-any */

import { Children, cloneElement, ReactElement, useState } from 'react'
import {
  Panel,
  TabBar,
  AnalysisWidget,
  List,
  Tag,
  CloseButton,
  getThemedColor,
} from '@worldresources/wri-design-systems'
import { Box, Text } from '@chakra-ui/react'
import {
  LegendItemDemo,
  LegendItemDemo2,
  LegendItemDemo3,
} from '@/components/Map/LegendItem/LegendItemDemo'
import { NumberIcon, DownloadIcon, SettingsIcon, ShareIcon } from '../icons/'

const defaultLegendTabValue = 'legend-tab'

const listItems = [
  {
    id: 'nav-1',
    label: 'Nyando, Kisumu',
    caption: '[34.826, -0.151]',
    variant: 'navigation' as const,
    onItemClick: () => console.log('onItemClick'),
    icon: <NumberIcon value='1' />,
  },
  {
    id: 'nav-2',
    label: 'Kisumu East, Kisumu',
    caption: '[34.826, -0.125]',
    variant: 'navigation' as const,
    onItemClick: () => console.log('onItemClick'),
    icon: <NumberIcon value='2' />,
  },
  {
    id: 'nav-3',
    label: 'Nyando, Kisumu',
    caption: '[34.889, -0.142]',
    variant: 'navigation' as const,
    onItemClick: () => console.log('onItemClick'),
    icon: <NumberIcon value='3' />,
  },
  {
    id: 'nav-4',
    label: 'Kisumu East, Kisumu',
    caption: '[34.835, -0.098]',
    variant: 'navigation' as const,
    onItemClick: () => console.log('onItemClick'),
    icon: <NumberIcon value='4' />,
  },
  {
    id: 'nav-5',
    label: 'Nyando, Kisumu',
    caption: '[34.844, -0.098]',
    variant: 'navigation' as const,
    onItemClick: () => console.log('onItemClick'),
    icon: <NumberIcon value='5' />,
  },
  {
    id: 'nav-6',
    label: 'Nyando, Kisumu',
    caption: '[34.826, -0.16]',
    variant: 'navigation' as const,
    onItemClick: () => console.log('onItemClick'),
    icon: <NumberIcon value='6' />,
  },
]
const AnalysisTab = () => {
  const [selectedTabValue, setSelectedTabValue] = useState('prioritization-tab')

  const handleOnTabClick = (tabValue: string) => {
    setSelectedTabValue(tabValue)
  }

  return (
    <div>
      <Box padding='20px'>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Text style={{ fontWeight: '700' }}>Analysis results</Text>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Text
              style={{
                color: getThemedColor('neutral', 700),
                fontWeight: 400,
              }}
            >
              Close
            </Text>
            <CloseButton />
          </div>
        </div>
        <Text
          style={{
            color: getThemedColor('neutral', 700),
            fontWeight: 400,
          }}
        >
          Click on an area on the map to learn more about that particular area.
        </Text>
      </Box>
      <TabBar
        defaultValue='prioritization-tab'
        tabs={[
          { label: 'Prioritization', value: 'prioritization-tab' },
          {
            label: 'Data',
            value: 'data-tab',
          },
        ]}
        onTabClick={handleOnTabClick}
      />
      {selectedTabValue === 'data-tab' ? (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            height: '200px',
          }}
        >
          data
        </div>
      ) : null}
      {selectedTabValue === 'prioritization-tab' ? (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            margin: '20px',
            gap: '10px',
            overflowY: 'auto',
            maxHeight: '550px',
            minHeight: '250px',
          }}
        >
          <AnalysisWidget
            header={
              <div>
                <Text style={{ fontWeight: '700' }}>High priority areas</Text>
                <Text
                  style={{
                    color: getThemedColor('neutral', 700),
                    fontWeight: 400,
                  }}
                >
                  Showing areas (1km2) with the highest prioritization scores
                  based on your analysis criteria.
                </Text>
              </div>
            }
            actions={[
              {
                label: 'About',
                onClick: () => console.log('click'),
              },
            ]}
            footer={
              <div
                style={{
                  display: 'flex',
                  padding: '0.5rem',
                  marginBottom: '50px',
                }}
              >
                <Tag
                  label='Filter'
                  variant='info-grey'
                  icon={<SettingsIcon />}
                  style={{ marginRight: '0.5rem' }}
                />
                <Tag
                  label='Download'
                  variant='info-grey'
                  icon={<DownloadIcon />}
                  style={{ marginRight: '0.5rem' }}
                />
                <Tag
                  label='Share'
                  variant='info-grey'
                  icon={<ShareIcon />}
                  style={{ marginRight: '0.5rem' }}
                />
              </div>
            }
          >
            <List items={listItems} />
          </AnalysisWidget>
        </div>
      ) : null}
    </div>
  )
}

const LegendPanel = () => {
  const [selectedTabValue, setSelectedTabValue] = useState(
    defaultLegendTabValue,
  )
  const [legentItems, setLegentItems] = useState([
    <LegendItemDemo key='legend-1' />,
    <LegendItemDemo2 key='legend-2' />,
    <LegendItemDemo3 key='legend-3' />,
  ])

  const handleOnTabClick = (tabValue: string) => {
    setSelectedTabValue(tabValue)
  }

  const reorder = (list: any[], startIndex: number, endIndex: number) => {
    const result = Array.from(list)
    const [removed] = result.splice(startIndex, 1)
    result.splice(endIndex, 0, removed)

    return result
  }

  return (
    <Panel
      content={
        <div>
          <TabBar
            tabs={[
              { label: 'Legend', value: 'legend-tab' },
              {
                label: 'Analysis',
                value: 'analysis-tab',
              },
            ]}
            onTabClick={handleOnTabClick}
          />
          {selectedTabValue === 'legend-tab' ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
            >
              {Children.map(legentItems, (child, idx) =>
                cloneElement(
                  child as ReactElement,
                  {
                    onUpClick: () => {
                      const items = reorder(legentItems, idx, idx - 1)
                      setLegentItems(items)
                    },
                    onDownClick: () => {
                      const items = reorder(legentItems, idx, idx + 1)
                      setLegentItems(items)
                    },
                  } as any,
                ),
              )}
            </div>
          ) : null}
          {selectedTabValue === 'analysis-tab' ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
            >
              <AnalysisTab />
            </div>
          ) : null}
        </div>
      }
      variant='floating'
      width='380px'
    />
  )
}

export default LegendPanel
