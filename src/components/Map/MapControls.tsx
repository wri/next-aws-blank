'use client'

import { MapControlsToolbar } from '@worldresources/wri-design-systems'

const MapControls = () => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: '12px',
      }}
    >
      <MapControlsToolbar
        onZoomInClick={() => {}}
        onZoomOutClick={() => {}}
        onExpandClick={() => {}}
        onShareClick={() => {}}
        onPrintClick={() => {}}
        onSettingsClick={() => {}}
        onQuestionClick={() => {}}
        vertical
        showExpandedToggle
      />
    </div>
  )
}
export default MapControls
