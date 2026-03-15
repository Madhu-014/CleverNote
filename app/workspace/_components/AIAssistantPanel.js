"use client";

import React, { useMemo, useState } from "react";
import { Sparkles, WandSparkles, ListChecks, BookText, Send, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const presets = [
  {
    id: "summary",
    label: "Summarize",
    icon: BookText,
    prompt: "Summarize the selected text into concise key points.",
  },
  {
    id: "insights",
    label: "Key Insights",
    icon: Sparkles,
    prompt: "Extract 5 key insights from the selected text in bullet points.",
  },
  {
    id: "actions",
    label: "Action Items",
    icon: ListChecks,
    prompt: "Generate actionable next steps from the selected text.",
  },
  {
    id: "rewrite",
    label: "Polish",
    icon: WandSparkles,
    prompt: "Rewrite the selected text clearly in a premium, concise style.",
  },
];

export default function AIAssistantPanel({ onRunPrompt, loading }) {
  const [customPrompt, setCustomPrompt] = useState("");

  const canSend = useMemo(() => customPrompt.trim().length > 0 && !loading, [customPrompt, loading]);

  return (
    <section className="panel-luxe border-b border-border/70 bg-card/70 px-3 py-3 fade-rise rounded-t-xl">
      <div className="mb-3 flex items-center gap-2.5">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-border/70 bg-background/85 text-primary shadow-sm">
          <Bot className="h-4 w-4" />
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">AI Assistant</p>
          <p className="text-[11px] text-muted-foreground/80">Document-aware writing actions</p>
        </div>
      </div>

      <div className="mb-3 flex flex-wrap gap-2">
        {presets.map(({ id, label, icon: Icon, prompt }, idx) => (
          <button
            key={id}
            type="button"
            onClick={() => onRunPrompt(prompt, label)}
            disabled={loading}
            className={`fade-rise hover-lift button-press inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-background/88 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-accent/68 hover:text-accent-foreground disabled:cursor-not-allowed disabled:opacity-60 ${idx === 0 ? 'stagger-1' : idx === 1 ? 'stagger-2' : idx === 2 ? 'stagger-3' : 'stagger-4'}`}
          >
            <Icon className="h-3.5 w-3.5 text-primary" />
            {label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <Input
          value={customPrompt}
          onChange={(e) => setCustomPrompt(e.target.value)}
          placeholder="Custom AI prompt for selected text..."
          className="h-9 smooth-transition focus-visible:ring-2 focus-visible:ring-primary/50"
        />
        <Button
          type="button"
          size="sm"
          onClick={() => {
            onRunPrompt(
              "Answer the user question clearly using document context when relevant. If not found in the document, answer directly.",
              "Custom",
              customPrompt
            );
            setCustomPrompt("");
          }}
          disabled={!canSend}
          className="h-9 rounded-full px-3 pulse-glow button-press hover-scale"
        >
          <Send className="h-3.5 w-3.5" />
        </Button>
      </div>
    </section>
  );
}
