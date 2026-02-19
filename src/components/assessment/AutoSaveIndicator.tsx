'use client'

interface AutoSaveIndicatorProps {
  status: 'idle' | 'saving' | 'saved' | 'error'
  lastSaved: Date | null
  error: string | null
}

export function AutoSaveIndicator({ status, lastSaved, error }: AutoSaveIndicatorProps) {
  if (status === 'idle' && !lastSaved) return null
  
  return (
    <div className="flex items-center gap-2 text-xs">
      {status === 'saving' && (
        <>
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          <span className="text-slate-500">Saving...</span>
        </>
      )}
      {status === 'saved' && (
        <>
          <span className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-green-600">Saved</span>
        </>
      )}
      {status === 'error' && (
        <>
          <span className="w-2 h-2 rounded-full bg-red-500" />
          <span className="text-red-600">{error || 'Failed to save'}</span>
        </>
      )}
    </div>
  )
}
