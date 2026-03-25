"use client"

import type { Editor } from "@tiptap/core"
import * as React from "react"

export interface RichTextEditorLabels {
  toolbar?: Record<string, string>
  options?: Record<string, string>
  prompts?: {
    enterUrl?: string
  }
}

export interface RichTextEditorContextValue {
  editor: Editor | null
  labels?: RichTextEditorLabels
}

export const RichTextEditorContext =
  React.createContext<RichTextEditorContextValue | null>(null)

RichTextEditorContext.displayName = "RichTextEditorContext"

export function useRichTextEditorContext() {
  const context = React.useContext(RichTextEditorContext)
  if (!context) {
    throw new Error(
      "useRichTextEditorContext must be used within a RichTextEditorRoot",
    )
  }
  return context
}
