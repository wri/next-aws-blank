'use client'

import { useState } from 'react'
import { ChevronUpIcon as ChevronUp, ChevronDownIcon as ChevronDown } from '@/components/icons'

interface CollapsibleProps {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}

export function Collapsible({ title, children, defaultOpen = false }: CollapsibleProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  
  return (
    <div className="bg-white overflow-hidden shadow-sm border-b">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-4 flex items-center justify-between text-left font-bold text-slate-700 hover:bg-slate-50 transition-colors"
      >
        {title}
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-slate-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-slate-500" />
        )}
      </button>
      {isOpen && (
        <div className="px-4 pb-4 pt-2 text-sm text-slate-600 leading-relaxed">
          {children}
        </div>
      )}
    </div>
  )
}
