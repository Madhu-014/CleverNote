import React from "react";

function PdfViewer({ fileUrl }) {
  return (
    <div className="h-full min-h-[45vh] w-full overflow-hidden rounded-xl lg:min-h-0">
      <iframe
        src={fileUrl} // remove #toolbar=0
        title="PDF document viewer"
        width="100%"
        height="100%"
        className="rounded-xl border border-border/70 bg-background"
      />
    </div>
  );
}

export default PdfViewer;
