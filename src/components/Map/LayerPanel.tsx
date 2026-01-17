'use client'

import { Panel, TabBar } from '@worldresources/wri-design-systems'
import {
  LayerGroupDemo,
  LayerGroupDemo2,
  LayerGroupDemo3,
} from '@/components/Map/LayerGroup/LayerGroupDemo'
import { useState } from 'react'

const title = 'Title and more'
const description =
  'Lorem ipsum dolor sit amet consectetur. Ac lectus massa auctor ac purus aliquam enim nibh accumsan. Nunc neque suspendisse.'
const buttonTabs = [
  { label: 'Label 1', value: 'label-1' },
  { label: 'Label 2', value: 'label-2' },
  { label: 'Label 3', value: 'label-3' },
]
const defaultTabValue = 'label-1'

const LayerPanel = () => {
  const [tabSelected, setTabSelected] = useState(defaultTabValue)

  return (
    <Panel
      header={
        <div className='w-full bg-white'>
          <aside
            className='p-4 pb-5 border-neutral-300 border-b-[1px]'
            role='complementary'
          >
            <h2
              aria-label={title}
              className='font-bold text-xl text-left text-neutral-900'
            >
              {title}
            </h2>
            <p
              aria-label={description}
              className='text-sm text-left text-neutral-700'
            >
              {description}
            </p>
          </aside>
          {buttonTabs && buttonTabs.length > 0 ? (
            <TabBar
              variant='panel'
              defaultValue={defaultTabValue}
              tabs={buttonTabs}
              onTabClick={setTabSelected}
            />
          ) : null}
        </div>
      }
      content={
        <>
          {tabSelected === 'label-1' ? <LayerGroupDemo /> : null}
          {tabSelected === 'label-2' ? <LayerGroupDemo2 /> : null}
          {tabSelected === 'label-3' ? <LayerGroupDemo3 /> : null}
        </>
      }
      width='100%'
    />
  )
}

export default LayerPanel
