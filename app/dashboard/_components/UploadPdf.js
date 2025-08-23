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

    try {
      setLoading(true);
      const postUrl = await generateUploadUrl();

      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": file?.type },
        body: file,
      });
      const { storageId } = await result.json();
      const fileId = uuid4();
      const fileurl = await getFileurl({ storageId });

      await addFileEntry({
        fileId,
        storageId,
        fileName: fileName || "Untitled File",
        fileUrl: fileurl,
        createdBy: user?.primaryEmailAddress?.emailAddress,
      });

      const ApiResp = await axios.get(
        "/api/pdf-loader?pdfurl=" + encodeURIComponent(fileurl)
      );

      await embeddDocument({
        splitText: ApiResp.data.result,
        fileId,
      });

      toast.success("✅ File uploaded & processed!");
      removeFile();
      setOpen(false);
    } catch (err) {
      toast.error("❌ Upload failed. Try again.");
      console.error(err);
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
          className="w-full"
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

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Upload a PDF
          </DialogTitle>
          <DialogDescription className="text-gray-500">
            {isMaxFile
              ? "🚫 You’ve reached your free limit of 5 files."
              : "Select or drag a PDF file to upload and index."}
          </DialogDescription>
        </DialogHeader>

        {!isMaxFile ? (
          <>
            {/* Upload Area */}
            <div className="mt-5 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition relative">
              {!file ? (
                <>
                  <UploadCloud className="mx-auto h-10 w-10 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-600">
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
                <div className="flex items-center justify-between gap-3 bg-gray-50 p-3 rounded-md">
                  <div className="flex items-center gap-2">
                    <FileText className="h-6 w-6 text-blue-600" />
                    <span className="text-gray-700 font-medium">
                      {file.name}
                    </span>
                  </div>
                  <button onClick={removeFile}>
                    <XCircle className="h-5 w-5 text-red-500 hover:text-red-700" />
                  </button>
                </div>
              )}
            </div>

            {/* File Name Input */}
            {file && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  File Name *
                </label>
                <Input
                  placeholder="Enter file name"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                />
              </div>
            )}

            <DialogFooter className="mt-6 sm:justify-end">
              <DialogClose asChild>
                <Button type="button" variant="secondary" onClick={removeFile}>
                  Cancel
                </Button>
              </DialogClose>
              <Button
                onClick={OnUpload}
                disabled={loading || !file}
                className="flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2Icon className="h-4 w-4 animate-spin" /> Uploading...
                  </>
                ) : (
                  "Upload"
                )}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <div className="mt-6 flex flex-col items-center text-center">
            <Lock className="h-10 w-10 text-red-500 mb-3" />
            <p className="text-gray-600">
              You’ve reached the free limit of {fileLimit} files.  
              Upgrade to premium for unlimited uploads.
            </p>
            <Link href="/pricing" className="mt-4">
              <Button className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-2 rounded-lg">
                Upgrade Now
              </Button>
            </Link>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
