"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { FolderOpenDot, Sparkles, Gauge, HardDrive, Rocket, ShieldCheck, BookOpenText, ArrowRight, Pencil } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

function RenamePdfDialog({ file, onRename }) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(file.fileName || "");
  const [saving, setSaving] = useState(false);

  const handleRename = async () => {
    const nextName = value.trim();
    if (!nextName) {
      toast.error("Please enter a valid file name.");
      return;
    }

    try {
      setSaving(true);
      await onRename(file.fileId, nextName);
      toast.success("File renamed successfully.");
      setOpen(false);
    } catch (error) {
      toast.error(error?.message || "Failed to rename file.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border/70 bg-background/88 text-muted-foreground transition hover:bg-accent/70 hover:text-foreground"
          aria-label={`Rename ${file.fileName}`}
          onClick={() => setValue(file.fileName || "")}
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rename PDF</DialogTitle>
          <DialogDescription>Update the file name shown in your dashboard and workspace.</DialogDescription>
        </DialogHeader>

        <div className="mt-2">
          <Input
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder="Enter new file name"
            maxLength={120}
          />
        </div>

        <DialogFooter>
          <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleRename} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Dashboard() {
  const { user } = useUser();
  const renamePdfFile = useMutation(api.fileStorage.RenamePdfFile);

  // Fetch files belonging to the logged-in user
  const fileList = useQuery(api.fileStorage.GetUserFiles, {
    userEmail: user?.primaryEmailAddress?.emailAddress,
  });

  // Placeholder array while loading
  const placeholders = Array.from({ length: 6 });

  const handleRename = async (fileId, newFileName) => {
    const userEmail = user?.primaryEmailAddress?.emailAddress;
    if (!userEmail) {
      throw new Error("Please sign in again and retry.");
    }

    await renamePdfFile({
      fileId,
      newFileName,
      createdBy: userEmail,
    });
  };

  return (
    <div className="pt-6 md:pt-8">
      <div className="reveal-pop panel-luxe mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl p-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">Dashboard</p>
          <h2 className="mt-1 text-3xl font-semibold text-foreground md:text-4xl">Your Workspace</h2>
          <p className="mt-2 text-sm text-muted-foreground">Organize files, query documents, and build polished notes faster.</p>
        </div>
        <p className="rounded-full border border-border/70 bg-background/80 px-4 py-1.5 text-sm text-muted-foreground">
          {fileList ? `${fileList.length} file(s)` : "Loading..."}
        </p>
      </div>

      <div className="mb-7 grid gap-3 md:grid-cols-3">
        <div className="reveal-pop panel-luxe rich-card lift-on-hover rounded-2xl p-4 stagger-1">
          <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Library</p>
          <p className="mt-2 flex items-center gap-2 text-2xl font-semibold"><HardDrive className="h-5 w-5 text-primary" /> {fileList?.length || 0} Files</p>
        </div>
        <div className="reveal-pop panel-luxe rich-card lift-on-hover rounded-2xl p-4 stagger-2">
          <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Capacity</p>
          <p className="mt-2 flex items-center gap-2 text-2xl font-semibold"><Gauge className="h-5 w-5 text-primary" /> {Math.max(5 - (fileList?.length || 0), 0)} Slots Left</p>
        </div>
        <div className="reveal-pop panel-luxe rich-card lift-on-hover rounded-2xl p-4 stagger-3">
          <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">AI Status</p>
          <p className="mt-2 flex items-center gap-2 text-2xl font-semibold"><Sparkles className="h-5 w-5 text-primary" /> Ready</p>
        </div>
      </div>

      <div className="mb-8 grid gap-3 md:grid-cols-3">
        <Link href="/dashboard/upgrade" className="reveal-pop panel-luxe hover-glow rounded-2xl p-4 stagger-1">
          <p className="inline-flex items-center gap-2 text-sm font-semibold text-foreground"><Rocket className="h-4 w-4 text-primary" /> Unlock More</p>
          <p className="mt-2 text-xs text-muted-foreground">Upgrade for higher file limits and premium support.</p>
          <p className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary">See plans <ArrowRight className="h-3.5 w-3.5" /></p>
        </Link>
        <article className="reveal-pop panel-luxe rounded-2xl p-4 stagger-2">
          <p className="inline-flex items-center gap-2 text-sm font-semibold text-foreground"><BookOpenText className="h-4 w-4 text-primary" /> Best Practice</p>
          <p className="mt-2 text-xs text-muted-foreground">Use specific selected text before asking AI for the highest quality answers.</p>
        </article>
        <article className="reveal-pop panel-luxe rounded-2xl p-4 stagger-3">
          <p className="inline-flex items-center gap-2 text-sm font-semibold text-foreground"><ShieldCheck className="h-4 w-4 text-primary" /> Retrieval Mode</p>
          <p className="mt-2 text-xs text-muted-foreground">Document-first retrieval is active with intelligent fallback when context is weak.</p>
        </article>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Documents</h3>
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">Recent uploads</p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {fileList
          ? fileList.map((file, index) => (
              <div
                key={file.fileId || index}
                className={`group reveal-pop panel-luxe rich-card lift-on-hover relative overflow-hidden rounded-2xl p-5 ${index % 4 === 0 ? 'stagger-1' : index % 4 === 1 ? 'stagger-2' : index % 4 === 2 ? 'stagger-3' : 'stagger-4'}`}
              >
                <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-accent/25 blur-2xl" />
                <div className="relative mb-1 flex items-start justify-between gap-2">
                  <div className="relative w-16 h-16 flex items-center justify-center rounded-xl bg-background/90 border border-border/60">
                    <Image src="/pdf.png" alt="file" width={40} height={40} />
                  </div>
                  <RenamePdfDialog file={file} onRename={handleRename} />
                </div>

                <Link href={`/workspace/${file.fileId}`} className="relative block">
                  <h2 className="relative mt-4 text-base font-semibold text-foreground line-clamp-2">
                    {file.fileName}
                  </h2>
                  <p className="relative mt-2 text-xs text-muted-foreground">Open notes and PDF view</p>
                  <p className="relative mt-3 inline-flex items-center gap-1 rounded-full border border-border/70 bg-background/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                    Ready
                  </p>
                </Link>
              </div>
            ))
          : placeholders.map((_, index) => (
              <div
                key={index}
                className="animate-pulse rounded-2xl border border-border/70 bg-card/80 p-5"
              >
                <div className="mb-3 h-16 w-16 rounded-xl bg-muted"></div>
                <div className="h-4 w-24 rounded bg-muted"></div>
              </div>
            ))}
      </div>

      {fileList?.length === 0 && (
        <div className="reveal-pop panel-luxe mt-10 rounded-2xl border border-dashed p-10 text-center">
          <FolderOpenDot className="mx-auto h-10 w-10 text-muted-foreground" />
          <h3 className="mt-3 text-xl font-semibold">No files yet</h3>
          <p className="mt-2 text-sm text-muted-foreground">Upload your first PDF from the sidebar to start your premium workspace.</p>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
