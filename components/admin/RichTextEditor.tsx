'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'

interface RichTextEditorProps {
  content: string
  onChange: (html: string) => void
}

export function RichTextEditor({ content, onChange }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'min-h-[200px] p-4 focus:outline-none text-gray-900 dark:text-gray-100',
      },
    },
  })

  if (!editor) return null

  const buttonClass = (isActive: boolean) =>
    `p-2 rounded text-sm font-medium transition-colors ${
      isActive
        ? 'bg-primary text-white'
        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
    }`

  return (
    <div className="border border-gray-300 dark:border-gray-600 rounded-xl overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750 flex-wrap">
        <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={buttonClass(editor.isActive('bold'))}>
          B
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={buttonClass(editor.isActive('italic'))}>
          I
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={buttonClass(editor.isActive('heading', { level: 2 }))}>
          H2
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={buttonClass(editor.isActive('heading', { level: 3 }))}>
          H3
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={buttonClass(editor.isActive('bulletList'))}>
          •List
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={buttonClass(editor.isActive('orderedList'))}>
          1.List
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={buttonClass(editor.isActive('blockquote'))}>
          ❝
        </button>
        <button type="button" onClick={() => editor.chain().focus().undo().run()} className={buttonClass(false)}>
          ↩
        </button>
        <button type="button" onClick={() => editor.chain().focus().redo().run()} className={buttonClass(false)}>
          ↪
        </button>
      </div>

      {/* Editor */}
      <div className="bg-white dark:bg-gray-700">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
