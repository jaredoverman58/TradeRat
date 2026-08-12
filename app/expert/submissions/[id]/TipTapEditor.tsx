'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useEffect } from 'react'

interface TipTapEditorProps {
  content: string
  onChange: (html: string) => void
  placeholder?: string
}

export default function TipTapEditor({ content, onChange, placeholder }: TipTapEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content,
    editorProps: {
      attributes: {
        style: 'min-height: 300px; padding: 16px; outline: none;',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  // Update editor content when prop changes (for draft loading)
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  if (!editor) {
    return null
  }

  return (
    <div style={{
      border: '1px solid #2a261e',
      backgroundColor: '#0C0A07',
    }}>
      {/* Toolbar */}
      <div style={{
        borderBottom: '1px solid #2a261e',
        padding: '8px',
        display: 'flex',
        gap: '4px',
        flexWrap: 'wrap',
        backgroundColor: '#1a1710',
      }}>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          title="Bold (Ctrl+B)"
        >
          <strong>B</strong>
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          title="Italic (Ctrl+I)"
        >
          <em>I</em>
        </ToolbarButton>

        <div style={{
          width: '1px',
          backgroundColor: '#2a261e',
          margin: '0 4px',
        }} />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          title="Bullet List"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="8" y1="6" x2="21" y2="6" />
            <line x1="8" y1="12" x2="21" y2="12" />
            <line x1="8" y1="18" x2="21" y2="18" />
            <circle cx="4" cy="6" r="1" fill="currentColor" />
            <circle cx="4" cy="12" r="1" fill="currentColor" />
            <circle cx="4" cy="18" r="1" fill="currentColor" />
          </svg>
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          title="Numbered List"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="10" y1="6" x2="21" y2="6" />
            <line x1="10" y1="12" x2="21" y2="12" />
            <line x1="10" y1="18" x2="21" y2="18" />
            <text x="3" y="8" fontSize="10" fill="currentColor">1</text>
            <text x="3" y="14" fontSize="10" fill="currentColor">2</text>
            <text x="3" y="20" fontSize="10" fill="currentColor">3</text>
          </svg>
        </ToolbarButton>

        <div style={{
          width: '1px',
          backgroundColor: '#2a261e',
          margin: '0 4px',
        }} />

        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo (Ctrl+Z)"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 7v6h6" />
            <path d="M21 17a9 9 0 00-9-9 9 9 0 00-6 2.3L3 13" />
          </svg>
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo (Ctrl+Y)"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 7v6h-6" />
            <path d="M3 17a9 9 0 019-9 9 9 0 016 2.3l3 2.7" />
          </svg>
        </ToolbarButton>
      </div>

      {/* Editor Content */}
      <div
        style={{
          fontFamily: 'var(--font-dm-sans)',
          fontSize: '1rem',
          color: '#F2EDE4',
          lineHeight: '1.6',
        }}
        className="tiptap-content"
      >
        <EditorContent editor={editor} />
      </div>

      {/* Inline styles for rich text formatting */}
      <style jsx global>{`
        .tiptap-content .ProseMirror {
          outline: none;
        }
        .tiptap-content .ProseMirror p {
          margin: 0 0 1em 0;
        }
        .tiptap-content .ProseMirror p:last-child {
          margin-bottom: 0;
        }
        .tiptap-content .ProseMirror strong {
          font-weight: 700;
          color: #F2EDE4;
        }
        .tiptap-content .ProseMirror em {
          font-style: italic;
          color: #F2EDE4;
        }
        .tiptap-content .ProseMirror ul,
        .tiptap-content .ProseMirror ol {
          padding-left: 2rem;
          margin: 1em 0;
        }
        .tiptap-content .ProseMirror ul {
          list-style-type: disc;
        }
        .tiptap-content .ProseMirror ol {
          list-style-type: decimal;
        }
        .tiptap-content .ProseMirror li {
          margin-bottom: 0.5em;
        }
        .tiptap-content .ProseMirror li p {
          margin: 0;
        }
        .tiptap-content .ProseMirror h1,
        .tiptap-content .ProseMirror h2,
        .tiptap-content .ProseMirror h3 {
          font-family: var(--font-playfair);
          font-weight: 700;
          color: #F2EDE4;
          margin: 1.5em 0 0.5em 0;
        }
        .tiptap-content .ProseMirror h1 {
          font-size: 2em;
        }
        .tiptap-content .ProseMirror h2 {
          font-size: 1.5em;
        }
        .tiptap-content .ProseMirror h3 {
          font-size: 1.25em;
        }
      `}</style>

      {!editor.getText() && (
        <div style={{
          position: 'absolute',
          top: '60px',
          left: '16px',
          color: '#6b6457',
          pointerEvents: 'none',
          fontFamily: 'var(--font-dm-sans)',
          fontSize: '1rem',
        }}>
          {placeholder || 'Start writing...'}
        </div>
      )}
    </div>
  )
}

function ToolbarButton({
  onClick,
  isActive,
  disabled,
  title,
  children,
}: {
  onClick: () => void
  isActive?: boolean
  disabled?: boolean
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      type="button"
      style={{
        minWidth: '44px',
        minHeight: '44px',
        padding: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: isActive ? '#C9A84C' : 'transparent',
        color: isActive ? '#0C0A07' : disabled ? '#3a362e' : '#F2EDE4',
        border: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily: 'var(--font-dm-sans)',
        fontSize: '1rem',
        transition: 'background-color 0.2s',
      }}
      onMouseEnter={(e) => {
        if (!disabled && !isActive) {
          e.currentTarget.style.backgroundColor = '#2a261e'
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.backgroundColor = 'transparent'
        }
      }}
    >
      {children}
    </button>
  )
}
