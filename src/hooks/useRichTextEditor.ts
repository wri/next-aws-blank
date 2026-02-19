'use client'

import { useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Placeholder from '@tiptap/extension-placeholder'
import Link from '@tiptap/extension-link'
import Subscript from '@tiptap/extension-subscript'
import Superscript from '@tiptap/extension-superscript'
import Highlight from '@tiptap/extension-highlight'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import FontFamily from '@tiptap/extension-font-family'
import { useEffect } from 'react'

export interface UseRichTextEditorOptions {
  /**
   * Initial HTML content for the editor
   */
  content?: string
  
  /**
   * Placeholder text when editor is empty
   */
  placeholder?: string
  
  /**
   * Callback fired when content changes
   * @param html - The updated HTML content
   */
  onUpdate?: (html: string) => void
  
  /**
   * Whether the editor is editable
   */
  editable?: boolean
}

/**
 * Custom hook to create and configure a Tiptap editor instance
 * with all necessary extensions for the RichTextEditor component.
 * 
 * This hook handles:
 * - Editor initialization with extensions
 * - Content synchronization
 * - Change event handling
 * - Cleanup on unmount
 * 
 * @param options - Configuration options for the editor
 * @returns Configured Tiptap Editor instance
 */
export function useRichTextEditor({
  content = '',
  placeholder = 'Start writing...',
  onUpdate,
  editable = true,
}: UseRichTextEditorOptions = {}) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        alignments: ['left', 'center', 'right', 'justify'],
      }),
      Placeholder.configure({
        placeholder,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline',
        },
      }),
      Subscript,
      Superscript,
      Highlight.configure({
        multicolor: true,
      }),
      TextStyle,
      Color,
      FontFamily,
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      onUpdate?.(html)
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-xl focus:outline-none',
      },
    },
  })

  // Sync content when it changes externally
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  return editor
}
