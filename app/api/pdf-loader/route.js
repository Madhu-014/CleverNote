import { NextResponse } from "next/server";
import { WebPDFLoader } from "@langchain/community/document_loaders/web/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

const MAX_PDF_SIZE = 50 * 1024 * 1024; // 50MB
const REQUEST_TIMEOUT_MS = 120000; // 2 minutes
const MAX_CHUNKS = 5000;

function normalizePageText(text = "") {
  return text
    .replace(/\r/g, "")
    .replace(/-\n/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

/**
 * Validate PDF URL
 */
function validatePdfUrl(pdfUrl) {
  if (!pdfUrl || typeof pdfUrl !== "string") {
    throw new Error("Missing or invalid pdfurl query parameter");
  }

  try {
    new URL(pdfUrl);
  } catch {
    throw new Error("Invalid PDF URL format");
  }

  // Basic security check - ensure it's a valid Convex storage URL
  if (!pdfUrl.includes("convex.cloud") && !pdfUrl.includes("localhost")) {
    throw new Error("PDF URL must be from Convex storage");
  }

  return pdfUrl.trim();
}

async function fetchPdfWithTimeout(pdfUrl) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(pdfUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent": "AI-PDF-Noteaker/1.0",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch PDF: ${response.status} ${response.statusText}`);
    }

    // Check Content-Length if available
    const contentLength = response.headers.get("content-length");
    if (contentLength && parseInt(contentLength) > MAX_PDF_SIZE) {
      throw new Error(`PDF file exceeds maximum size of ${MAX_PDF_SIZE / (1024 * 1024)}MB`);
    }

    return response;
  } finally {
    clearTimeout(timeout);
  }
}

export async function GET(req) {
  const startTime = Date.now();

  try {
    const { searchParams } = new URL(req.url);
    const pdfUrl = searchParams.get("pdfurl");

    // Validate URL
    let validatedUrl;
    try {
      validatedUrl = validatePdfUrl(pdfUrl);
    } catch (validationError) {
      console.warn("PDF URL validation failed:", validationError.message);
      return NextResponse.json(
        {
          error: validationError.message,
          statusCode: 400,
        },
        { status: 400 }
      );
    }

    // Fetch PDF with timeout
    let response;
    try {
      response = await fetchPdfWithTimeout(validatedUrl);
    } catch (fetchError) {
      console.error("Failed to fetch PDF:", fetchError.message);

      const statusCode = fetchError.name === "AbortError" ? 504 : 400;
      const errorMessage = fetchError.name === "AbortError" ? "PDF fetch timeout" : fetchError.message;

      return NextResponse.json(
        {
          error: errorMessage,
          statusCode,
        },
        { status: statusCode }
      );
    }

    // Convert response to blob
    const blob = await response.blob();

    if (blob.size > MAX_PDF_SIZE) {
      throw new Error(`PDF file exceeds maximum size of ${MAX_PDF_SIZE / (1024 * 1024)}MB`);
    }

    // Load PDF
    let docs;
    try {
      const loader = new WebPDFLoader(blob);
      docs = await loader.load();

      if (!docs || docs.length === 0) {
        throw new Error("PDF file is empty or couldn't be parsed");
      }
    } catch (parseError) {
      console.error("PDF parsing error:", parseError.message);
      return NextResponse.json(
        {
          error: "Failed to parse PDF file. Ensure it's a valid PDF.",
          statusCode: 400,
        },
        { status: 400 }
      );
    }

    // Split text into chunks
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1400,
      chunkOverlap: 260,
      separators: ["\n\n", "\n", ". ", " ", ""],
    });

    // Process pages
    const pageTexts = docs
      .map((doc, index) => {
        const pageNumber = doc?.metadata?.loc?.pageNumber || index + 1;
        const text = normalizePageText(doc.pageContent || "");

        if (!text || text.length === 0) {
          console.debug(`Skipping empty page ${pageNumber}`);
          return null;
        }

        return {
          pageNumber,
          content: text,
        };
      })
      .filter(Boolean);

    if (pageTexts.length === 0) {
      return NextResponse.json({
        result: [],
        totalPages: 0,
        totalChunks: 0,
        statusCode: 200,
      });
    }

    // Create chunks
    let output;
    try {
      output = await splitter.createDocuments(
        pageTexts.map((p) => p.content),
        pageTexts.map((p) => ({ pageNumber: p.pageNumber }))
      );
    } catch (chunkingError) {
      console.error("Chunking error:", chunkingError.message);
      return NextResponse.json(
        {
          error: "Failed to process PDF content",
          statusCode: 500,
        },
        { status: 500 }
      );
    }

    // Add chunk headers and filter
    const chunksWithHeaders = output
      .map((doc, idx) => {
        const page = doc?.metadata?.pageNumber || "?";
        const content = normalizePageText(doc.pageContent || "");

        if (!content || content.length === 0) {
          return null;
        }

        return `[Page ${page} | Chunk ${idx + 1}]\n${content}`;
      })
      .filter(Boolean);

    // Check chunk count
    if (chunksWithHeaders.length > MAX_CHUNKS) {
      console.warn(`PDF exceeds maximum chunks: ${chunksWithHeaders.length}`);
      return NextResponse.json(
        {
          error: `PDF file produces too many chunks (${chunksWithHeaders.length} > ${MAX_CHUNKS})`,
          statusCode: 413,
        },
        { status: 413 }
      );
    }

    const duration = Date.now() - startTime;
    console.info(`PDF processed successfully in ${duration}ms`, {
      totalPages: pageTexts.length,
      totalChunks: chunksWithHeaders.length,
      fileSize: blob.size,
    });

    return NextResponse.json({
      result: chunksWithHeaders,
      totalPages: pageTexts.length,
      totalChunks: chunksWithHeaders.length,
      statusCode: 200,
      processingTime: `${duration}ms`,
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error("Unexpected error in PDF loader:", error, { duration });

    return NextResponse.json(
      {
        error: "An unexpected error occurred while processing the PDF",
        statusCode: 500,
      },
      { status: 500 }
    );
  }
}