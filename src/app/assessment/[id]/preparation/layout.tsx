'use client'

import { usePathname } from 'next/navigation'
import PreparationToolbar from '@/components/assessment/DiagnosticPreparation/PreparationToolbar'
import { PreparationSubmitProvider } from '@/components/assessment/DiagnosticPreparation/PreparationSubmitContext'

const PreparationLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname()

  const isPreparationStepPath = /\/preparation\/[^/]+(?:\/|$)/.test(pathname)
  const gradientDirection = isPreparationStepPath
    ? 'bg-gradient-to-t'
    : 'bg-gradient-to-b'

  return (
    <PreparationSubmitProvider>
      <div
        className={`${gradientDirection} from-white to-primary-200 min-h-[calc(100vh-56px)] pt-12`}
      >
        {isPreparationStepPath ? <PreparationToolbar /> : null}
        {children}
      </div>
    </PreparationSubmitProvider>
  )
}

export default PreparationLayout
