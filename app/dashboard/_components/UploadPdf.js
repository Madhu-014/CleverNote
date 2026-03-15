"use client";

import React, { useState, useRef } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAction, useMutation, useQuery } from "convex/react";
import { Loader2Icon, UploadCloud, FileText, XCircle, Lock } from "lucide-react";
import { api } from "@/convex/_generated/api";
import uuid4 from "uuid4";
import { useUser } from "@clerk/nextjs";
import axios from "axios";
import { toast } from "sonner";
import Link from "next/link";

export default function UploadPdf() {
  const generateUploadUrl = useMutation(api.fileStorage.generateUploadUrl);
  const addFileEntry = useMutation(api.fileStorage.AddFileEntryToDb);
  const getFileurl = useAction(api.fileStorage.getFileurl);
  const embeddDocument = useAction(api.myAction.ingest);
  const { user } = useUser();

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState("");
  const [open, setOpen] = useState(false);

  const fileInputRef = useRef(null);

  // Fetch current user's files
  const fileList = useQuery(api.fileStorage.GetUserFiles, {
    userEmail: user?.primaryEmailAddress?.emailAddress,
  });

  // Limit check (Free plan = 5 files)
  const fileLimit = 5;
  const isMaxFile = fileList && fileList.length >= fileLimit;

  const onFileSelect = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name.replace(".pdf", ""));
    }
  };

  const removeFile = () => {
    setFile(null);
    setFileName("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const OnUpload = async () => {
    if (!file) return;

    let fileId = null;
    let storageId = null;

    try {
      setLoading(true);
      const postUrl = await generateUploadUrl();

      // Step 1: Upload file to Convex storage
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": file?.type },
        body: file,
      });

      if (!result.ok) {
        throw new Error(`Storage upload failed: ${result.status} ${result.statusText}`);
      }

      const uploadData = await result.json();
      storageId = uploadData?.storageId;
      if (!storageId) {
        throw new Error("No storage ID returned from upload");
      }

      fileId = uuid4();
      const fileurl = await getFileurl({ storageId });

      if (!fileurl) {
        throw new Error("Failed to get file URL from storage");
      }

      // Step 2: Add file entry to database
      const fileEntryResult = await addFileEntry({
        fileId,
        storageId,
        fileName: fileName || "Untitled File",
        fileUrl: fileurl,
        createdBy: user?.primaryEmailAddress?.emailAddress,
      });

      if (!fileEntryResult) {
        throw new Error("Failed to create file entry in database");
      }

      // Step 3: Extract PDF chunks
      let ApiResp;
      try {
        ApiResp = await axios.get(
          "/api/pdf-loader?pdfurl=" + encodeURIComponent(fileurl),
          { timeout: 130000 }
        );
      } catch (pdfError) {
        if (pdfError.response?.status === 400) {
          throw new Error("Invalid PDF file. Please ensure it's a valid PDF document.");
        } else if (pdfError.response?.status === 413) {
          throw new Error("PDF is too large. Please use a smaller PDF file.");
        } else if (pdfError.response?.status === 504) {
          throw new Error("PDF processing timed out. Please try a smaller file.");
        } else if (pdfError.code === 'ECONNABORTED') {
          throw new Error("PDF processing took too long. Please try a smaller file.");
        }
        throw new Error(`Failed to process PDF: ${pdfError.message}`);
      }

      const chunks = ApiResp?.data?.result || [];
      if (!Array.isArray(chunks)) {
        throw new Error("Invalid response format from PDF processor");
      }

      if (chunks.length === 0) {
        throw new Error("No readable text found in PDF. Please ensure the PDF contains extractable text.");
      }

      if (chunks.length > 5000) {
        throw new Error(`PDF produces too many chunks (${chunks.length}). Please use a smaller PDF.`);
      }

      // Step 4: Generate embeddings
      const embedResult = await embeddDocument({
        splitText: chunks,
        fileId,
      });

      if (!embedResult) {
        throw new Error("Failed to generate embeddings for PDF content");
      }

      toast.success("✅ File uploaded & processed successfully!");
      removeFile();
      setOpen(false);
    } catch (err) {
      console.error("Upload error:", err);
      const errorMessage = err?.message || err?.response?.data?.message || "Upload failed. Please try again.";
      toast.error(`❌ ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          onClick={() => setOpen(true)}
          disabled={isMaxFile}
          className="w-full smooth-transition button-press hover-scale"
        >
          {isMaxFile ? (
            <span className="flex items-center gap-2 text-gray-500">
              <Lock className="h-4 w-4" /> Upgrade to add more files
            </span>
          ) : (
            "+ Upload PDF File"
          )}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg rounded-2xl border-border/60 bg-card/95 scale-in">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold fade-slide-bottom">
            Upload a PDF
          </DialogTitle>
          <DialogDescription className="text-gray-500 fade-slide-bottom">
            {isMaxFile
              ? "🚫 You’ve reached your free limit of 5 files."
              : "Select or drag a PDF file to upload and index."}
          </DialogDescription>
        </DialogHeader>

        {!isMaxFile ? (
          <>
            {/* Upload Area */}
            <div className="relative mt-5 rounded-xl border-2 border-dashed border-border p-6 text-center smooth-transition hover:border-primary/60 bg-background/65 fade-slide-bottom">
              {!file ? (
                <>
                  <UploadCloud className="mx-auto h-10 w-10 text-muted-foreground smooth-spin" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    Drag & drop your PDF here, or click to browse
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf"
                    onChange={onFileSelect}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </>
              ) : (
                <div className="flex items-center justify-between gap-3 rounded-md border border-border/70 bg-card p-3 scale-in">
                  <div className="flex items-center gap-2">
                    <FileText className="h-6 w-6 text-primary" />
                    <span className="text-foreground font-medium">
                      {file.name}
                    </span>
                  </div>
                  <button onClick={removeFile} className="smooth-transition hover:scale-110">
                    <XCircle className="h-5 w-5 text-red-500 hover:text-red-700" />
                  </button>
                </div>
              )}
            </div>

            {/* File Name Input */}
            {file && (
              <div className="mt-4 fade-slide-bottom">
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  File Name *
                </label>
                <Input
                  placeholder="Enter file name"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  className="smooth-transition focus-visible:ring-2"
                />
              </div>
            )}

            <DialogFooter className="mt-6 sm:justify-end">
              <DialogClose asChild>
                <Button type="button" variant="secondary" onClick={removeFile} className="smooth-transition button-press">
                  Cancel
                </Button>
              </DialogClose>
              <Button
                onClick={OnUpload}
                disabled={loading || !file}
                className="flex items-center gap-2 smooth-transition button-press hover-scale"
              >
                {loading ? (
                  <>
                    <Loader2Icon className="h-4 w-4 smooth-spin" /> Uploading...
                  </>
                ) : (
                  "Upload"
                )}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <div className="mt-6 flex flex-col items-center text-center fade-slide-bottom">
            <Lock className="h-10 w-10 text-red-500 mb-3 gentle-shake" />
            <p className="text-muted-foreground">
              You've reached the free limit of {fileLimit} files.  
              Upgrade to premium for unlimited uploads.
            </p>
            <Link href="/dashboard/upgrade" className="mt-4">
              <Button className="px-6 py-2 rounded-lg smooth-transition button-press hover-lift">
                Upgrade Now
              </Button>
            </Link>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
