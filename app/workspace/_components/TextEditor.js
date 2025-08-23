"use client"
import React, { useEffect } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Highlight from '@tiptap/extension-highlight';
import Subscript from '@tiptap/extension-subscript';
import TextAlign from '@tiptap/extension-text-align';
import EditorExtension from './EditorExtension';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useParams } from 'next/navigation';

function TextEditor() {
  const { fileId } = useParams();
  const savedNotes = useQuery(api.notes.GetNotes, { fileId });

  const editor = useEditor({
    extensions: [
      StarterKit,
      Highlight,
      Subscript,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({ placeholder: 'Ask a question about this PDF…' }),
    ],
    editorProps: {
      attributes: { class: 'focus:outline-none p-5' }, // remove h-screen
    },
    immediatelyRender: false,
  });

  // Load saved notes HTML content
  useEffect(() => {
    if (editor && savedNotes) {
      editor.commands.setContent(savedNotes);
    }
  }, [savedNotes, editor]);

  if (!editor) return null;

  return (
    <div className="h-[90vh] flex flex-col border rounded-md">
      {/* Toolbar */}
      <EditorExtension editor={editor} />
      
      {/* Scrollable Editor */}
      <div className="flex-1 overflow-y-auto">
        <EditorContent editor={editor} className="min-h-full" />
      </div>
    </div>
  );
}

export default TextEditor;
