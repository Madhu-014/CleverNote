import React from "react";

function PdfViewer({ fileUrl }) {
  return (
    <div className="h-[90vh] w-full">
      <iframe
        src={fileUrl} // remove #toolbar=0
        width="100%"
        height="100%"
        className="border rounded-md"
      />
    </div>
  );
}

export default PdfViewer;
