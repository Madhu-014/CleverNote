"use client";
import { useParams } from "next/navigation";
import React, { useEffect } from "react";
import WorkspaceHeader from "../_components/WorkspaceHeader";
import PdfViewer from "../_components/PdfViewer";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import TextEditor from "../_components/TextEditor";

function Workspace() {
  const { fileId } = useParams();
  const fileInfo = useQuery(api.fileStorage.GetFileRecord, { fileId });

  useEffect(() => {
    console.log(fileInfo);
  }, [fileInfo]);

  if (!fileInfo) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <WorkspaceHeader fileName={fileInfo.fileName} />

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Text Editor */}
        <div className="flex-1 overflow-y-auto border-r">
          <TextEditor fileId={fileId} />
        </div>

        {/* PDF Viewer */}
        <div className="flex-1 overflow-y-auto">
          <PdfViewer fileUrl={fileInfo?.fileUrl} />
        </div>
      </div>
    </div>
  );
}

export default Workspace;
