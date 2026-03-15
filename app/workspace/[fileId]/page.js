"use client";
import { useParams } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import WorkspaceHeader from "../_components/WorkspaceHeader";
import PdfViewer from "../_components/PdfViewer";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import TextEditor from "../_components/TextEditor";
import Link from "next/link";
import { ArrowLeft, GripVertical } from "lucide-react";

function Workspace() {
  const { fileId } = useParams();
  const fileInfo = useQuery(api.fileStorage.GetFileRecord, { fileId });
  const splitContainerRef = useRef(null);
  const [leftPaneWidth, setLeftPaneWidth] = useState(50);
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (event) => {
      if (!splitContainerRef.current) return;
      const bounds = splitContainerRef.current.getBoundingClientRect();
      const nextPercent = ((event.clientX - bounds.left) / bounds.width) * 100;
      const clamped = Math.min(70, Math.max(30, nextPercent));
      setLeftPaneWidth(clamped);
    };

    const handleMouseUp = () => setIsResizing(false);

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);

  if (!fileInfo) {
    return <div className="p-4 text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <WorkspaceHeader fileName={fileInfo.fileName} />

      {/* Main Content */}
      <div className="relative flex flex-1 flex-col overflow-hidden p-4 lg:p-5">
        <div className="pointer-events-none absolute inset-0 lux-grid opacity-20" />

        <div className="relative z-10 mb-3 flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-background/80 px-3 py-1.5 text-xs font-semibold text-foreground transition hover:bg-accent/65"
              aria-label="Go back to dashboard"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back
            </Link>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Workspace</p>
          </div>
          <p className="text-xs text-muted-foreground">Drag the divider to resize Notes and Document</p>
        </div>

        <div className="relative z-10 flex flex-1 flex-col gap-4 overflow-hidden lg:hidden">
          <div className="fade-slide-right panel-luxe min-h-[45vh] overflow-hidden rounded-2xl">
            <TextEditor fileId={fileId} />
          </div>
          <div className="fade-slide-left panel-luxe min-h-[45vh] overflow-hidden rounded-2xl p-2">
            <PdfViewer fileUrl={fileInfo?.fileUrl} />
          </div>
        </div>

        <div
          ref={splitContainerRef}
          className="relative z-10 hidden h-full min-h-0 flex-1 overflow-hidden lg:grid"
          style={{
            gridTemplateColumns: `${leftPaneWidth}fr 14px ${100 - leftPaneWidth}fr`,
          }}
        >
          <div className="fade-slide-right panel-luxe min-h-0 overflow-hidden rounded-2xl">
            <TextEditor fileId={fileId} />
          </div>

          <button
            type="button"
            aria-label="Resize notes and document panes"
            onMouseDown={() => setIsResizing(true)}
            className={`group my-2 flex items-center justify-center rounded-full border border-border/70 bg-background/90 text-muted-foreground transition ${
              isResizing ? "cursor-col-resize bg-accent/70 text-foreground" : "cursor-col-resize hover:bg-accent/60 hover:text-foreground"
            }`}
          >
            <GripVertical className="h-4 w-4 transition group-hover:scale-110" />
          </button>

          <div className="fade-slide-left panel-luxe min-h-0 overflow-hidden rounded-2xl p-1.5">
            <PdfViewer fileUrl={fileInfo?.fileUrl} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Workspace;
