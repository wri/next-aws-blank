'use client'

import { RichTextEditor, Control } from '@/components/ui/rich-text-editor'
import { useRichTextEditor } from '@/hooks/useRichTextEditor'
import { Box } from '@chakra-ui/react'

interface ChakraRichTextEditorProps {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  minHeight?: string
}

/**
 * Chakra UI Rich Text Editor wrapper component
 * 
 * Provides a consistent rich text editing experience across the application
 * with auto-save integration for answer rationale and question notes.
 * 
 * Uses Tiptap editor with pre-configured extensions for formatting, lists,
 * headings, links, and more.
 * 
 * @param value - HTML string content
 * @param onChange - Callback fired on content change (debounced by parent)
 * @param placeholder - Placeholder text when empty
 * @param minHeight - Minimum height for editor content area
 */
export function ChakraRichTextEditor({ 
  value, 
  onChange, 
  placeholder = 'Start writing...',
}: ChakraRichTextEditorProps) {
  const editor = useRichTextEditor({
    content: value,
    placeholder,
    onUpdate: onChange,
  })

  if (!editor) {
    return null
  }

  return (
    <Box 
      css={{
        backgroundColor: 'white',
      }}
    >
      <RichTextEditor.Root editor={editor}>
        <RichTextEditor.Toolbar>
          <RichTextEditor.ControlGroup>
            <Control.Bold />
            <Control.Italic />
            <Control.Underline />
            <Control.Strikethrough />
          </RichTextEditor.ControlGroup>

          <RichTextEditor.ControlGroup>
            <Control.H2 />
            <Control.H3 />
          </RichTextEditor.ControlGroup>

          <RichTextEditor.ControlGroup>
            <Control.BulletList />
            <Control.OrderedList />
          </RichTextEditor.ControlGroup>

          <RichTextEditor.ControlGroup>
            <Control.Link />
            <Control.Blockquote />
          </RichTextEditor.ControlGroup>

          <RichTextEditor.ControlGroup>
            <Control.Undo />
            <Control.Redo />
          </RichTextEditor.ControlGroup>
        </RichTextEditor.Toolbar>

        <RichTextEditor.Content />
      </RichTextEditor.Root>
    </Box>
  )
}
