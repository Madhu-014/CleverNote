"use client"
import {
  Bold,
  Italic,
  Underline,
  List,
  Quote,
  Highlighter,
  Subscript,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Sparkles,
  Type,
  Save,
  Download
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useParams } from "next/navigation"; 
import { useAction, useMutation } from 'convex/react'; 
import { api } from '../../../convex/_generated/api';
import { chatSession } from '@/configs/AIModel';
import { toast } from 'sonner';
import { useUser } from '@clerk/nextjs';
import jsPDF from 'jspdf';   // ✅ make sure jspdf is installed

function EditorExtension({ editor }) {
  const { fileId } = useParams();
  const [, setEditorState] = useState(0);
  const { user } = useUser();
  const saveNotes = useMutation(api.notes.AddNotes);
  const SearchAI = useAction(api.myAction.search);

  useEffect(() => {
    if (!editor) return;

    const updateHandler = () => setEditorState(Math.random());
    editor.on('selectionUpdate', updateHandler);
    editor.on('transaction', updateHandler);

    return () => {
      editor.off('selectionUpdate', updateHandler);
      editor.off('transaction', updateHandler);
    };
  }, [editor]);

  const buttonClass = (active) =>
    `p-2 rounded hover:bg-gray-200 ${active ? 'text-blue-500' : 'text-gray-700'}`;

  // Manual save
  const handleSave = async () => {
    if (!editor) return;
    const html = editor.getHTML();
    await saveNotes({
      notes: html,
      fileId,
      createdBy: user?.primaryEmailAddress?.emailAddress
    });
    toast.success("Notes saved!");
  };

  // Download as PDF
  const handleDownload = () => {
    if (!editor) return;
    const doc = new jsPDF("p", "pt", "a4");
    doc.html(editor.getHTML(), {
      callback: (pdf) => {
        pdf.save("notes.pdf");
      },
      x: 20,
      y: 20,
      width: 500,
      windowWidth: 800
    });
    toast.success("PDF downloaded!");
  };

  // AI Button
  const onAiClick = async () => {
    if (!editor) return;
    toast("AI is generating your answer...");

    try {
      const selectedText = editor.state.doc.textBetween(
        editor.state.selection.from,
        editor.state.selection.to,
        ' '
      );

      const result = await SearchAI({ query: selectedText, fileId });
      const UnformattedAns = JSON.parse(result);

      let AllUnformattedAns = '';
      UnformattedAns?.forEach(item => {
        AllUnformattedAns += item.pageContent;
      });

      const PROMPT = `For question: ${selectedText}, and with the given content as answer, 
      please give the appropriate answer in HTML format. The answer content is: ${AllUnformattedAns}`;

      const AiModelResult = await chatSession.sendMessage(PROMPT);

      const FinalAns =
        AiModelResult?.response?.candidates?.[0]?.content?.parts?.[0]?.text
          ?.replace(/```/g, "")
          ?.replace(/html/g, "") || "⚠️ No answer generated";

      const AllText = editor.getHTML();
      editor.commands.setContent(
        AllText + `<p><strong>Answer:</strong> ${FinalAns}</p>`
      );
    } catch (err) {
      console.error("AI Error:", err);
      toast.error("Failed to generate answer. Please try again.");
    }
  };

  return (
    editor && (
      <div className="border-b p-2 flex flex-nowrap gap-1 overflow-x-auto bg-white shadow-sm items-center">
        {/* Text Styles */}
        <button onClick={() => editor.chain().focus().toggleBold().run()} className={buttonClass(editor.isActive('bold'))}><Type /></button>
        <button onClick={() => editor.chain().focus().toggleItalic().run()} className={buttonClass(editor.isActive('italic'))}><Italic /></button>
        <button onClick={() => editor.chain().focus().toggleUnderline().run()} className={buttonClass(editor.isActive('underline'))}><Underline /></button>

        {/* Headings */}
        {[1,2,3].map(level => (
          <button key={level} onClick={() => editor.chain().focus().toggleHeading({ level }).run()} className={buttonClass(editor.isActive('heading', { level }))}>H{level}</button>
        ))}

        {/* Lists & Quotes */}
        <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={buttonClass(editor.isActive('bulletList'))}><List /></button>
        <button onClick={() => editor.chain().focus().toggleBlockquote().run()} className={buttonClass(editor.isActive('blockquote'))}><Quote /></button>

        {/* Highlight & Subscript */}
        <button onClick={() => editor.chain().focus().toggleHighlight().run()} className={buttonClass(editor.isActive('highlight'))}><Highlighter /></button>
        <button onClick={() => editor.chain().focus().toggleSubscript().run()} className={buttonClass(editor.isActive('subscript'))}><Subscript /></button>

        {/* Alignment */}
        <button onClick={() => editor.chain().focus().setTextAlign('left').run()} className={buttonClass(editor.isActive({ textAlign: 'left' }))}><AlignLeft /></button>
        <button onClick={() => editor.chain().focus().setTextAlign('center').run()} className={buttonClass(editor.isActive({ textAlign: 'center' }))}><AlignCenter /></button>
        <button onClick={() => editor.chain().focus().setTextAlign('right').run()} className={buttonClass(editor.isActive({ textAlign: 'right' }))}><AlignRight /></button>

        {/* AI Button */}
        <button onClick={onAiClick} className="p-2 rounded hover:bg-blue-100 text-blue-600"><Sparkles /></button>

        {/* Save & Download */}
        <button onClick={handleSave} className="p-2 rounded hover:bg-green-200 text-green-600">
          <Save />
        </button>
        <button onClick={handleDownload} className="p-2 rounded hover:bg-purple-200 text-purple-600">
          <Download />
        </button>
      </div>
    )
  );
}

export default EditorExtension;
