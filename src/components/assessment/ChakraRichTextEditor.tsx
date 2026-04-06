'use client'

import { useMemo } from 'react'
import { RichTextEditor, Control } from '@/components/ui/rich-text-editor'
import { useRichTextEditor } from '@/hooks/useRichTextEditor'
import { Box } from '@chakra-ui/react'
import { useTranslations } from '@/i18n/useTranslations'
import { useLanguage } from '@/contexts/LanguageContext'

interface ChakraRichTextEditorProps {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  borderless?: boolean
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
 */
export function ChakraRichTextEditor({
  value,
  onChange,
  placeholder,
  borderless,
}: ChakraRichTextEditorProps) {
  const t = useTranslations()
  const { language } = useLanguage()
  const editor = useRichTextEditor({
    content: value,
    placeholder:
      placeholder ?? t('assessment.content.placeholders.startWriting'),
    onUpdate: onChange,
  })

  const labels = useMemo(() => ({
    toolbar: {
      'Bold': t('richTextEditor.toolbar.Bold'),
      'Italic': t('richTextEditor.toolbar.Italic'),
      'Underline': t('richTextEditor.toolbar.Underline'),
      'Strikethrough': t('richTextEditor.toolbar.Strikethrough'),
      'Code': t('richTextEditor.toolbar.Code'),
      'Subscript': t('richTextEditor.toolbar.Subscript'),
      'Superscript': t('richTextEditor.toolbar.Superscript'),
      'H1': t('richTextEditor.toolbar.H1'),
      'H2': t('richTextEditor.toolbar.H2'),
      'H3': t('richTextEditor.toolbar.H3'),
      'H4': t('richTextEditor.toolbar.H4'),
      'Bullet List': t('richTextEditor.toolbar.Bullet List'),
      'Ordered List': t('richTextEditor.toolbar.Ordered List'),
      'Blockquote': t('richTextEditor.toolbar.Blockquote'),
      'Horizontal Rule': t('richTextEditor.toolbar.Horizontal Rule'),
      'Link': t('richTextEditor.toolbar.Link'),
      'Unlink': t('richTextEditor.toolbar.Unlink'),
      'Align Left': t('richTextEditor.toolbar.Align Left'),
      'Align Center': t('richTextEditor.toolbar.Align Center'),
      'Align Justify': t('richTextEditor.toolbar.Align Justify'),
      'Align Right': t('richTextEditor.toolbar.Align Right'),
      'Undo': t('richTextEditor.toolbar.Undo'),
      'Redo': t('richTextEditor.toolbar.Redo'),
      'Text Color': t('richTextEditor.toolbar.Text Color'),
      'Highlight': t('richTextEditor.toolbar.Highlight'),
      'Font Family': t('richTextEditor.toolbar.Font Family'),
      'Font Size': t('richTextEditor.toolbar.Font Size'),
      'Text Style': t('richTextEditor.toolbar.Text Style'),
      'Alignment': t('richTextEditor.toolbar.Alignment'),
    },
    options: {
      'Normal text': t('richTextEditor.options.Normal text'),
      'Heading 1': t('richTextEditor.options.Heading 1'),
      'Heading 2': t('richTextEditor.options.Heading 2'),
      'Heading 3': t('richTextEditor.options.Heading 3'),
      'Quote': t('richTextEditor.options.Quote'),
      'Divider': t('richTextEditor.options.Divider'),
      'Default': t('richTextEditor.options.Default'),
      'Serif': t('richTextEditor.options.Serif'),
      'Monospace': t('richTextEditor.options.Monospace'),
      'Cursive': t('richTextEditor.options.Cursive'),
      'Align left': t('richTextEditor.options.Align left'),
      'Align center': t('richTextEditor.options.Align center'),
      'Align right': t('richTextEditor.options.Align right'),
      'Justify': t('richTextEditor.options.Justify'),
      'Left': t('richTextEditor.options.Left'),
      'Select': t('richTextEditor.options.Select'),
    },
    prompts: {
      enterUrl: t('richTextEditor.prompts.enterUrl'),
    },
  }), [language]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!editor) {
    return null
  }

  return (
    <Box
      css={{
        backgroundColor: 'white',
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        overflow: 'auto',
      }}
    >
      <RichTextEditor.Root
        editor={editor}
        labels={labels}
        css={{
          flex: 1,
          ...(borderless && { borderWidth: 0 }),
          '& .ProseMirror': {
            flex: 1,
          },
        }}
      >
        <RichTextEditor.Toolbar>
          <RichTextEditor.ControlGroup>
            <Control.TextStyle />
          </RichTextEditor.ControlGroup>

          <RichTextEditor.ControlGroup>
            <Control.Alignment />
          </RichTextEditor.ControlGroup>

          <RichTextEditor.ControlGroup>
            <Control.FontSize />
          </RichTextEditor.ControlGroup>

          <RichTextEditor.ControlGroup>
            <Control.Bold />
            <Control.Italic />
            <Control.Underline />
            <Control.Strikethrough />
          </RichTextEditor.ControlGroup>

          <RichTextEditor.ControlGroup>
            <Control.BulletList />
            <Control.OrderedList />
            <Control.Hr />
          </RichTextEditor.ControlGroup>

          <RichTextEditor.ControlGroup>
            <Control.Link />
          </RichTextEditor.ControlGroup>
        </RichTextEditor.Toolbar>

        <RichTextEditor.Content />
      </RichTextEditor.Root>
    </Box>
  )
}
