'use client';

import React, { useEffect } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { cn } from './Form';

export interface RichTextEditorProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  className?: string;
  placeholder?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  label,
  value,
  onChange,
  error,
  className,
  placeholder
}) => {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [StarterKit],
    content: value || '',
    editorProps: {
      attributes: {
        class: 'ProseMirror',
      },
    },
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;
    const next = value || '';
    if (editor.getHTML() === next) return;
    editor.commands.setContent(next, { emitUpdate: false });
  }, [editor, value]);

  const isBorderless = Boolean(className?.includes('rich-text-container-borderless'));

  return (
    <div className="w-full">
      {label && (
        <label className="input-label">
          {label}
        </label>
      )}
      <div className={cn(
        "rich-text-container",
        error && "rich-text-container-error",
        className
      )}>
        <div className={cn(
          'flex flex-wrap items-center gap-1 px-3 py-2 bg-white/40',
          !isBorderless && 'border-b border-gray-200'
        )}>
          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleBold().run()}
            disabled={!editor?.can().chain().focus().toggleBold().run()}
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-md text-sm font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-50',
              editor?.isActive('bold') && 'bg-gray-200'
            )}
          >
            B
          </button>
          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            disabled={!editor?.can().chain().focus().toggleItalic().run()}
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-md text-sm font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-50',
              editor?.isActive('italic') && 'bg-gray-200'
            )}
          >
            I
          </button>
          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleStrike().run()}
            disabled={!editor?.can().chain().focus().toggleStrike().run()}
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-md text-sm font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-50',
              editor?.isActive('strike') && 'bg-gray-200'
            )}
          >
            S
          </button>
          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
            className={cn(
              'flex h-8 items-center justify-center rounded-md px-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-50',
              editor?.isActive('orderedList') && 'bg-gray-200'
            )}
          >
            OL
          </button>
          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
            className={cn(
              'flex h-8 items-center justify-center rounded-md px-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-50',
              editor?.isActive('bulletList') && 'bg-gray-200'
            )}
          >
            UL
          </button>
          <button
            type="button"
            onClick={() => editor?.chain().focus().unsetAllMarks().clearNodes().run()}
            className="flex h-8 items-center justify-center rounded-md px-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-50"
          >
            Clear
          </button>
        </div>
        <div className="relative">
          {placeholder && !editor?.getText().trim() && (
            <div className="pointer-events-none absolute left-4 top-3 text-sm text-gray-400">
              {placeholder}
            </div>
          )}
          <EditorContent editor={editor} className="rich-text-editor" />
        </div>
      </div>
      {error && <p className="input-error-msg">{error}</p>}
    </div>
  );
};
