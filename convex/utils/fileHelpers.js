/**
 * Common helper functions for file operations
 */

/**
 * Calculate total size of chunks
 */
export function calculateTotalSize(chunks) {
  if (!Array.isArray(chunks)) return 0;
  return chunks.reduce((total, chunk) => total + (chunk?.length || 0), 0);
}

/**
 * Estimate reading time in minutes
 */
export function estimateReadingTime(text) {
  if (!text || typeof text !== "string") return 0;
  const wordsPerMinute = 200;
  const words = text.trim().split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes) {
  if (!bytes) return "0 B";

  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

/**
 * Extract text summary from content
 */
export function extractSummary(text, maxLength = 200) {
  if (!text || typeof text !== "string") return "";

  // Remove markdown, special characters
  const cleaned = text
    .replace(/[#*_`\[\]()]/g, "")
    .replace(/\n+/g, " ")
    .trim();

  if (cleaned.length <= maxLength) return cleaned;

  // Find last complete sentence
  const truncated = cleaned.substring(0, maxLength);
  const lastPeriod = truncated.lastIndexOf(".");

  return lastPeriod > 0 ? truncated.substring(0, lastPeriod + 1) : truncated + "...";
}

/**
 * Sanitize file name
 */
export function sanitizeFileName(name) {
  if (!name || typeof name !== "string") return "document";

  return name
    .replace(/[^a-zA-Z0-9\s._-]/g, "")
    .replace(/\s+/g, "_")
    .substring(0, 255);
}

/**
 * Check if file is too large
 */
export function isFileTooLarge(sizeInBytes, maxSizeInMB = 50) {
  return sizeInBytes > maxSizeInMB * 1024 * 1024;
}

/**
 * Retry async operation with exponential backoff
 */
export async function retryWithBackoff(
  operation,
  maxRetries = 3,
  baseDelay = 1000,
  backoffMultiplier = 2
) {
  let lastError;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      if (attempt < maxRetries - 1) {
        const delay = baseDelay * Math.pow(backoffMultiplier, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

/**
 * Batch array into chunks
 */
export function batchArray(array, batchSize) {
  const batches = [];
  for (let i = 0; i < array.length; i += batchSize) {
    batches.push(array.slice(i, i + batchSize));
  }
  return batches;
}

/**
 * Deduplicate array while preserving order
 */
export function deduplicateArray(array, key = null) {
  const seen = new Set();
  return array.filter((item) => {
    const identifier = key ? item[key] : item;
    if (seen.has(identifier)) return false;
    seen.add(identifier);
    return true;
  });
}

export default {
  calculateTotalSize,
  estimateReadingTime,
  formatFileSize,
  extractSummary,
  sanitizeFileName,
  isFileTooLarge,
  retryWithBackoff,
  batchArray,
  deduplicateArray,
};
