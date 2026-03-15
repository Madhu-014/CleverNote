"use client";

import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { UserButton, useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, BrainCircuit, FileStack, Sparkles, Timer, ShieldCheck, Linkedin, Github, Orbit } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

export default function Home() {
  const { user } = useUser();
  const createUser = useMutation(api.user.createUser);

  useEffect(() => {
    user && checkUser();
  }, [user]);

  const checkUser = async () => {
    if (!user?.primaryEmailAddress?.emailAddress) return;

    await createUser({
      email: user?.primaryEmailAddress?.emailAddress,
      imageUrl: user?.imageUrl || "",
      userName: user?.fullName || user?.firstName || "User",
    });
  };

  return (
    <div className="min-h-screen scroll-smooth">
      <header className="sticky top-0 z-50 border-b border-border/60 glass-surface">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 md:px-8">
          <Link href="/" className="logo-shell fade-rise lift-on-hover">
            <Image
              src="/logo.svg"
              alt="App Logo"
              width={150}
              height={150}
              className="rounded-md cursor-pointer"
            />
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-semibold text-muted-foreground md:flex">
            <a href="#features" className="nav-link-lux transition-colors hover:text-foreground">
            Features
          </a>
            <a href="#how" className="nav-link-lux transition-colors hover:text-foreground">
              How It Works
          </a>
            <a href="#contact" className="nav-link-lux transition-colors hover:text-foreground">
            Contact Us
          </a>
        </nav>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            {!user ? (
              <>
              <Link href="/sign-in">
                  <Button variant="ghost" className="rounded-full px-5 font-semibold">
                  Sign In
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button
                    className="rounded-full px-6 font-semibold"
                >
                  Sign Up
                </Button>
              </Link>
              </>
            ) : (
              <>
                <Link href="/dashboard">
                  <Button className="rounded-full px-5">Go to Dashboard</Button>
                </Link>
                <UserButton afterSignOutUrl="/" />
              </>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 pb-20 pt-12 md:px-8 md:pt-16">
        <section className="soft-breathe-fast relative overflow-hidden rounded-3xl border border-border/50 bg-card p-8 md:p-12">
          <div className="lux-grid absolute inset-0 opacity-30" />
          <div className="float-soft absolute -right-24 -top-20 h-64 w-64 rounded-full bg-accent/40 blur-3xl" />
          <div className="float-soft absolute -left-20 bottom-0 h-56 w-56 rounded-full bg-primary/20 blur-3xl" />
          <div className="float-soft absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-3xl" />

          <div className="relative grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="reveal-pop">
              <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/80 px-4 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5" />
                Built For Deep Work
              </p>
              <h1 className="max-w-3xl text-5xl font-semibold leading-[1.02] text-foreground md:text-7xl">
                <span className="text-shimmer">Premium</span>
                <span className="text-primary"> AI Note-Taking </span>
                for every PDF.
        </h1>
              <p className="mt-6 max-w-2xl text-base text-muted-foreground md:text-lg">
                CleverNote turns dense PDFs into searchable insights, structured summaries, and clean personal knowledge bases. Move from reading to understanding in minutes.
        </p>
              <div className="mt-6 grid max-w-xl grid-cols-3 gap-2">
                {[
                  ["10x", "Faster review"],
                  ["1 Click", "AI assistance"],
                  ["Zero Chaos", "Structured notes"],
                ].map(([value, label], idx) => (
                  <div key={label} className={`fade-rise rounded-xl border border-border/70 bg-background/70 px-3 py-2 text-center ${idx === 0 ? 'stagger-1' : idx === 1 ? 'stagger-2' : 'stagger-3'}`}>
                    <p className="text-base font-semibold text-foreground">{value}</p>
                    <p className="text-[11px] text-muted-foreground">{label}</p>
                  </div>
                ))}
              </div>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link href={user ? "/dashboard" : "/sign-up"}>
                  <Button className="pulse-glow h-11 rounded-full px-7 text-base font-semibold">
                    {user ? "Open Workspace" : "Start Free"}
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/sign-in">
                  <Button variant="outline" className="h-11 rounded-full px-7 text-base">
                    See Demo
                  </Button>
                </Link>
                <a
                  href="https://www.linkedin.com/in/madhusudhan-chandar-581b49309/"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-11 items-center gap-2 rounded-full border border-border/70 bg-background/80 px-5 text-sm font-semibold text-foreground transition hover:bg-accent/70 hover:text-accent-foreground"
                >
                  <Linkedin className="h-4 w-4" /> LinkedIn
                </a>
                <a
                  href="https://github.com/Madhu-014"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-11 items-center gap-2 rounded-full border border-border/70 bg-background/80 px-5 text-sm font-semibold text-foreground transition hover:bg-accent/70 hover:text-accent-foreground"
                >
                  <Github className="h-4 w-4" /> GitHub
                </a>
              </div>
            </div>

            <div className="fade-rise-delay">
              <div className="glass-surface gradient-stroke rich-card tilt-soft lift-on-hover rounded-2xl p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Workflow Snapshot
                </p>
                <div className="mt-4 space-y-3">
                  {[
                    "Upload a PDF and auto-extract key sections",
                    "Ask context-aware questions across pages",
                    "Save polished notes back into your workspace",
                  ].map((line, idx) => (
                    <div key={line} className={`fade-rise rounded-xl border border-border/70 bg-background/75 px-4 py-3 text-sm text-foreground ${idx === 0 ? 'stagger-1' : idx === 1 ? 'stagger-2' : 'stagger-3'}`}>
                      {line}
                    </div>
                  ))}
                </div>
                <div className="mt-4 rounded-xl border border-border/70 bg-background/75 p-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5 text-foreground">
                    <Orbit className="h-3.5 w-3.5 text-primary" />
                    Live Knowledge Loop:
                  </span>{" "}
                  {"Upload -> Ask -> Refine -> Export"}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-3 rounded-2xl border border-border/60 bg-card/80 p-4 md:grid-cols-3">
          {[
            ["Smart Capture", "Extract meaning from long papers instantly"],
            ["Context Answers", "Questions are answered with PDF-backed context"],
            ["Premium Workspace", "Beautiful UI that stays productive at scale"],
          ].map(([title, desc], idx) => (
            <div key={title} className={`fade-zoom hover-glow rich-card rounded-xl border border-border/70 bg-background/75 px-4 py-3 ${idx === 0 ? 'stagger-1' : idx === 1 ? 'stagger-2' : 'stagger-3'}`}>
              <p className="text-sm font-semibold text-foreground">{title}</p>
              <p className="mt-1 text-xs text-muted-foreground">{desc}</p>
            </div>
          ))}
        </section>

        <section id="features" className="mt-16">
          <div className="fade-rise-delay-2 mb-8 flex items-end justify-between gap-4">
            <h2 className="text-3xl font-semibold text-foreground md:text-4xl">Designed for a premium study flow</h2>
            <p className="max-w-md text-right text-sm text-muted-foreground">
              Clean visuals, focused tools, and responsive interactions on desktop and mobile.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              {
                icon: BrainCircuit,
                title: "Context Aware AI",
                desc: "Answers anchored to your actual document sections, not generic text.",
              },
              {
                icon: FileStack,
                title: "Structured Workspace",
                desc: "Every file, summary, and note stays discoverable in one place.",
              },
              {
                icon: Timer,
                title: "Faster Comprehension",
                desc: "Compress long reading sessions into concise, actionable insights.",
              },
              {
                icon: ShieldCheck,
                title: "Reliable Notes",
                desc: "Your edits stay persistent so you can continue where you left off.",
              },
            ].map(({ icon: Icon, title, desc }, idx) => (
              <article key={title} className={`fade-zoom panel-luxe rich-card tilt-soft lift-on-hover rounded-2xl p-5 ${idx === 0 ? 'stagger-1' : idx === 1 ? 'stagger-2' : idx === 2 ? 'stagger-3' : 'stagger-4'}`}>
                <div className="mb-4 inline-flex rounded-xl bg-accent/70 p-2.5 text-foreground">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-semibold">{title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="how" className="mt-16 grid gap-4 rounded-3xl border border-border/60 bg-card/90 p-6 md:grid-cols-3 md:p-8">
          {[
            ["1", "Upload", "Drop in your PDF and let CleverNote index it instantly."],
            ["2", "Interrogate", "Select text, ask questions, and get contextual responses."],
            ["3", "Synthesize", "Convert answers into polished notes and export any time."],
          ].map(([step, title, desc], idx) => (
            <div key={step} className={`fade-zoom panel-luxe rich-card rounded-2xl p-5 ${idx === 0 ? 'stagger-1' : idx === 1 ? 'stagger-2' : 'stagger-3'}`}>
              <p className="text-sm font-semibold text-primary">Step {step}</p>
              <h3 className="mt-2 text-2xl font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </section>

        <section className="mt-16">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-semibold md:text-4xl">Why Choose CleverNote?</h2>
            <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
              CleverNote stands out by combining powerful AI with a focus on document-grounded answers and user experience.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Document-First AI",
                desc: "Unlike generic AI chat, CleverNote anchors all answers to your actual PDF content. No hallucinations, just verified insights.",
              },
              {
                title: "One-Click Intelligence",
                desc: "No complex workflows or multiple tools. Select text → Ask → Get answer. Everything happens in one beautiful interface.",
              },
              {
                title: "Persistent Notes Workspace",
                desc: "Your questions and answers automatically become part of your structured notes. Build knowledge, not just chat history.",
              },
              {
                title: "Free to Start",
                desc: "5 PDF uploads to test the entire workflow. See if CleverNote fits your learning style before upgrading.",
              },
              {
                title: "Privacy Focused",
                desc: "Your PDFs and notes stay secure. No vendor lock-in, clean exports, complete data ownership.",
              },
              {
                title: "Built for Learners",
                desc: "Designed by a developer passionate about knowledge work. Every feature prioritizes deep understanding over busywork.",
              },
            ].map(({ title, desc }, idx) => (
              <div key={title} className={`fade-zoom panel-luxe rich-card tilt-soft lift-on-hover rounded-2xl p-5 ${idx % 3 === 0 ? 'stagger-1' : idx % 3 === 1 ? 'stagger-2' : 'stagger-3'}`}>
                <h3 className="text-lg font-semibold text-primary">{title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="contact" className="mt-16 text-center">
          <h2 className="text-3xl font-semibold md:text-4xl">Talk to the team</h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Questions, feature ideas, or enterprise needs. We are happy to help you build a smarter note workflow.
          </p>
          <div className="mx-auto mt-6 grid max-w-3xl gap-3 md:grid-cols-3">
            <a href="mailto:madhusudhan.chandar@gmail.com" className="fade-zoom panel-luxe hover-glow rounded-2xl px-4 py-4 text-left">
              <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Email</p>
              <p className="mt-1 break-all text-xs font-semibold text-foreground sm:text-sm">madhusudhan.chandar@gmail.com</p>
            </a>
            <a href="https://www.linkedin.com/in/madhusudhan-chandar-581b49309/" target="_blank" rel="noreferrer" className="fade-zoom panel-luxe hover-glow rounded-2xl px-4 py-4 text-left stagger-1">
              <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">LinkedIn</p>
              <p className="mt-1 inline-flex items-center gap-2 text-sm font-semibold text-foreground"><Linkedin className="h-4 w-4 text-primary" /> Connect</p>
            </a>
            <a href="https://github.com/Madhu-014" target="_blank" rel="noreferrer" className="fade-zoom panel-luxe hover-glow rounded-2xl px-4 py-4 text-left stagger-2">
              <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">GitHub</p>
              <p className="mt-1 inline-flex items-center gap-2 text-sm font-semibold text-foreground"><Github className="h-4 w-4 text-primary" /> @Madhu-014</p>
            </a>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/70 px-4 py-6 text-center text-sm text-muted-foreground md:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 md:flex-row">
          <p>© {new Date().getFullYear()} CleverNote. Developed by <span className="font-semibold text-foreground">Madhusudhan Chandar</span></p>
          <div className="flex items-center gap-4">
            <a href="https://www.linkedin.com/in/madhusudhan-chandar-581b49309/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors">
              <Linkedin className="h-4 w-4" /> LinkedIn
            </a>
            <a href="https://github.com/Madhu-014" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors">
              <Github className="h-4 w-4" /> GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
