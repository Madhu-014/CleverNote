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
  Bot,
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
import AIAssistantPanel from './AIAssistantPanel';

function EditorExtension({ editor }) {
  const { fileId } = useParams();
  const [, setEditorState] = useState(0);
  const [aiLoading, setAiLoading] = useState(false);
  const { user } = useUser();
  const saveNotes = useMutation(api.notes.AddNotes);
  const SearchAI = useAction(api.myAction.search);
  const MAX_CONTEXT_CHARS = 7000;

  const cleanHtmlResponse = (text = "") =>
    text
      .replace(/^```html\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();

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
    `p-2 rounded-lg smooth-transition button-press ${active ? 'bg-primary/15 text-primary shadow-md' : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground'}`;


  // Manual save
  const handleSave = async () => {
    if (!editor) return;
    const email = user?.primaryEmailAddress?.emailAddress;
    if (!email) {
      toast.error("Please sign in again before saving notes.");
      return;
    }

    try {
      const html = editor.getHTML();
      if (!html || html.trim().length === 0) {
        toast.error("Cannot save empty notes.");
        return;
      }

      const result = await saveNotes({
        notes: html,
        fileId,
        createdBy: email
      });

      if (!result) {
        throw new Error("Save failed: no response from server.");
      }

      toast.success("✅ Notes saved successfully!");
    } catch (err) {
      console.error("Save error:", err);
      const errorMessage = err?.message || "Failed to save notes. Please check your connection and try again.";
      toast.error(`❌ ${errorMessage}`);
    }
  };

  // Download as PDF
  const handleDownload = () => {
    if (!editor) return;
    
    try {
      const html = editor.getHTML();
      if (!html || html.trim().length === 0 || html === "<p></p>") {
        toast.error("Cannot download empty notes. Add content first.");
        return;
      }

      const timestamp = new Date().toISOString().slice(0, 10);
      const filename = `notes_${timestamp}.pdf`;

      const doc = new jsPDF("p", "pt", "a4");
      doc.html(html, {
        callback: (pdf) => {
          try {
            pdf.save(filename);
            toast.success("✅ PDF downloaded successfully!");
          } catch (saveErr) {
            console.error("PDF save error:", saveErr);
            toast.error("Failed to save PDF file. Please try again.");
          }
        },
        onError: (err) => {
          console.error("PDF generation error:", err);
          toast.error("Failed to generate PDF. Please try again.");
        },
        x: 20,
        y: 20,
        width: 500,
        windowWidth: 800
      });
    } catch (err) {
      console.error("Download error:", err);
      toast.error("Failed to download PDF. Please try again.");
    }
  };

  // AI Button
  const runAiPrompt = async (
    instruction = "Answer this using PDF context",
    label = "Answer",
    explicitQuery = ""
  ) => {
    if (!editor) return;
    if (aiLoading) return;

    toast("AI is generating your answer...");
    setAiLoading(true);

    try {
      const selectedText = editor.state.doc.textBetween(
        editor.state.selection.from,
        editor.state.selection.to,
        ' '
      )?.trim();

      const userQuery = (explicitQuery || selectedText || "").trim();

      if (!userQuery) {
        toast.error("Select text or ask a question in the AI input.");
        return;
      }

      const GENERAL_PROMPT = `Question: ${userQuery}
Task: ${instruction}

The question may be outside the uploaded document. Answer directly using your general knowledge in concise, valid HTML only.`;

      let finalPrompt = GENERAL_PROMPT;
      let retrievalAttempted = false;

      // Retrieval failures must not block answer generation.
      try {
        const result = await SearchAI({ query: userQuery, fileId });
        const parsed = typeof result === "string" ? JSON.parse(result) : result;

        const matches = Array.isArray(parsed) ? parsed : (parsed?.matches || []);
        const hasRelevantContext = Array.isArray(parsed)
          ? matches.length > 0
          : !!parsed?.hasRelevantContext;
        const retrievalMode = Array.isArray(parsed) ? "legacy" : (parsed?.retrievalMode || "unknown");
        const relevanceScore = (parsed?.relevanceScore || 0);
        
        retrievalAttempted = true;

        const contextBlocks = matches
          .map((item, idx) => `Context ${idx + 1}:\n${item.pageContent}`)
          .join("\n\n---\n\n")
          .slice(0, MAX_CONTEXT_CHARS);

        // ✅ KEY FIX: If ANY context blocks found, use document-grounded prompt
        if (contextBlocks.trim() && contextBlocks.length > 100) {
          finalPrompt = `You are answering based ONLY on the retrieved PDF context. If the context doesn't answer the question, explicitly say "This information is not in the document."

Question: ${userQuery}
Task: ${instruction}

Context from document:
${contextBlocks}

Return concise, valid HTML only. Base your answer ONLY on the context provided.`;

          toast(`📄 Document-grounded answer (${retrievalMode}, relevance: ${(relevanceScore * 100).toFixed(0)}%)`);
        } else if (hasRelevantContext && contextBlocks.trim()) {
          // Fallback for when some context exists but is small
          finalPrompt = `You are answering based on the retrieved PDF context.
Question: ${userQuery}
Task: ${instruction}

Use this context:
${contextBlocks}

Return concise, valid HTML only. If context is insufficient, say so.`;
          toast("📄 Document context available (limited).");
        } else {
          // No context found - use AI directly (graceful fallback, not an error)
          toast("✨ Couldn't find strong document matches. Using AI to answer your question.");
        }
      } catch (retrievalError) {
        console.error("Retrieval failed, falling back to general AI:", retrievalError);
        toast("✨ Unable to retrieve from document. Using AI to answer your question.");
      }

      const aiModelResult = await chatSession.sendMessage(finalPrompt);
      const rawAnswer =
        aiModelResult?.response?.candidates?.[0]?.content?.parts?.[0]?.text || "";
      const finalAnswer = cleanHtmlResponse(rawAnswer) || "<p>Unable to generate a response right now.</p>";

      const allText = editor.getHTML();
      editor.commands.setContent(
        allText +
          `<section class="ai-answer-card"><p class="ai-answer-label">${label}</p><div class="ai-answer-body">${finalAnswer}</div></section>`
      );
    } catch (err) {
      console.error("AI generation failed:", err);
      toast.error(err?.message || "Failed to generate answer. Please try again.");
    } finally {
      setAiLoading(false);
    }
  };

  const onAiClick = async () => runAiPrompt();

  return (
    editor && (
      <div className="rounded-t-xl">
        <AIAssistantPanel onRunPrompt={runAiPrompt} loading={aiLoading} />
        <div className="border-b border-border/70 p-2 flex flex-nowrap gap-1 overflow-x-auto bg-card/80 items-center">
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

        <div className="mx-1 h-6 w-px bg-border/80" />

        <div className="ml-auto inline-flex items-center gap-1">
          {/* AI Button */}
          <button
            onClick={onAiClick}
            disabled={aiLoading}
            className="rounded-lg border border-border/70 bg-background/80 p-2 text-primary smooth-transition button-press hover-scale hover:bg-accent/70 disabled:opacity-60"
            aria-label="Run AI assistant"
          >
            <Bot className="h-[18px] w-[18px]" />
          </button>

          {/* Save & Download */}
          <button onClick={handleSave} disabled={aiLoading} className="p-2 rounded-lg smooth-transition button-press hover:bg-accent/80 text-primary disabled:opacity-60 disabled:cursor-not-allowed">
            <Save />
          </button>
          <button onClick={handleDownload} disabled={aiLoading} className="p-2 rounded-lg smooth-transition button-press hover:bg-accent/80 text-primary disabled:opacity-60 disabled:cursor-not-allowed">
            <Download />
          </button>
        </div>
        </div>
      </div>
    )
  );
}

export default EditorExtension;
