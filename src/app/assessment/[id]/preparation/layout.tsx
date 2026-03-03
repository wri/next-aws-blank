'use client'

import { usePathname } from 'next/navigation'

const PreparationLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname()

  const isPreparationStepPath = /\/preparation\/[^/]+(?:\/|$)/.test(pathname)
  const gradientDirection = isPreparationStepPath
    ? 'bg-gradient-to-t'
    : 'bg-gradient-to-b'

  return (
    <div
      className={`${gradientDirection} from-white to-primary-200 min-h-[calc(100vh-48px-56px)]`}
    >
      {children}
    </div>
  )
}

export default PreparationLayout
