"use client";

import { SignUp } from "@clerk/nextjs";
import { BrainCircuit, FileStack, Rocket, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";

export default function Page() {
  const router = useRouter();
  return (
    <div className="soft-breathe-fast relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <button 
        onClick={() => router.push("/")} 
        className="absolute left-4 top-4 z-20 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border/70 bg-background/80 text-muted-foreground transition hover:bg-accent/70 hover:text-foreground"
        aria-label="Go back to home"
      >
        <ArrowLeft className="h-5 w-5" />
      </button>
      <div className="absolute right-4 top-4 z-20">
        <ThemeToggle />
      </div>
      <div className="float-soft absolute -left-20 top-10 h-64 w-64 rounded-full bg-accent/35 blur-3xl" />
      <div className="float-soft absolute -bottom-16 right-0 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />

      <div className="relative mx-auto grid w-full max-w-6xl items-center gap-8 lg:grid-cols-2">
        <section className="reveal-pop panel-luxe hidden rounded-3xl p-8 lg:block">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Start Free</p>
          <h1 className="mt-3 text-5xl font-semibold leading-tight">Build a smarter knowledge system from PDFs.</h1>
          <p className="mt-4 text-muted-foreground">Upload, analyze, and turn dense documents into clean, useful notes.</p>
          <div className="mt-8 grid gap-3">
            {[
              [FileStack, "Upload and organize files in one workspace"],
              [BrainCircuit, "Ask AI questions grounded in your document"],
              [Rocket, "Move from reading to actionable notes faster"],
            ].map(([Icon, text], idx) => (
              <div key={text} className={`fade-rise flex items-center gap-3 rounded-xl border border-border/70 bg-background/70 px-4 py-3 text-sm ${idx === 0 ? 'stagger-1' : idx === 1 ? 'stagger-2' : 'stagger-3'}`}>
                <Icon className="h-4 w-4 text-primary" />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="fade-slide-left flex justify-center">
          <div className="panel-luxe w-full max-w-md rounded-3xl p-4">
            <SignUp redirectUrl="/dashboard" />
          </div>
        </section>
      </div>
    </div>
  );
}
