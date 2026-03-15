/**
 * Backend configuration and constants
 */

// API Timeouts (ms)
export const TIMEOUTS = {
  PDF_FETCH: 120000, // 2 minutes
  EMBEDDING: 30000, // 30 seconds
  VECTOR_SEARCH: 15000, // 15 seconds
  GROQ_API: 60000, // 1 minute
  DEFAULT: 30000, // 30 seconds
};

// Rate Limiting
export const RATE_LIMITING = {
  ENABLED: true,
  WINDOW_MS: 60000, // 1 minute
  MAX_REQUESTS: 30, // 30 requests per minute
  MAX_REQUESTS_PER_HOUR: 1000,
};

// File Limits
export const FILE_LIMITS = {
  MAX_PDF_SIZE: 50 * 1024 * 1024, // 50MB
  MAX_CHUNK_SIZE: 1000000, // 1MB per chunk
  MAX_NOTES_SIZE: 1000000, // 1MB
  MAX_CHUNKS_PER_PDF: 5000,
  MIN_CHUNK_SIZE: 160, // chars
};

// Text Processing
export const TEXT_PROCESSING = {
  CHUNK_SIZE: 1400,
  CHUNK_OVERLAP: 260,
  MAX_EMBEDDING_BATCH_SIZE: 100,
};

// RAG Pipeline
export const RAG_PIPELINE = {
  MAX_CONTEXT_CHUNKS: 8,
  SEARCH_CANDIDATE_K: 30,
  RELEVANCE_THRESHOLD: 0.2, // 20% token match
  LEXICAL_SCORE_THRESHOLD: 0.3, // 30% match
};

// Embeddings
export const EMBEDDINGS = {
  MODEL: "text-embedding-004",
  DIMENSIONS: 768,
};

// Database
export const DATABASE = {
  MAX_QUERY_RESULTS: 1000,
  INDEX_BATCH_SIZE: 100,
};

// AI Models
export const AI_MODELS = {
  GROQ_DEFAULT: "openai/gpt-oss-120b",
  GROQ_ALT: "mixtral-8x7b-32768",
  GROQ_URL: "https://api.groq.com/openai/v1/chat/completions",
};

// Feature Flags
export const FEATURES = {
  ENABLE_VECTOR_SEARCH: true,
  ENABLE_LEXICAL_SEARCH: true,
  ENABLE_OVERVIEW_SEARCH: true,
  ENABLE_CACHING: false,
  ENABLE_AUDIT_LOG: true,
};

// Error Messages
export const ERROR_MESSAGES = {
  INVALID_PDF: "Invalid or corrupted PDF file",
  PDF_TOO_LARGE: "PDF file exceeds maximum allowed size",
  CHUNK_COUNT_EXCEEDED: "PDF produces too many chunks",
  EMPTY_PDF: "PDF file is empty",
  FETCH_TIMEOUT: "Request timeout while fetching PDF",
  PARSE_ERROR: "Failed to parse PDF content",
  NO_EMBEDDINGS_KEY: "Embedding service not configured",
  NO_GROQ_KEY: "AI service not configured",
  INVALID_PROMPT: "Invalid or empty prompt",
  RATE_LIMITED: "Rate limit exceeded. Please try again later",
  UNAUTHORIZED: "You do not have permission for this action",
  NOT_FOUND: "Requested resource not found",
};

// Validation Rules
export const VALIDATION = {
  MIN_USERNAME_LENGTH: 2,
  MAX_USERNAME_LENGTH: 50,
  MAX_FILENAME_LENGTH: 255,
  MAX_QUERY_LENGTH: 5000,
  MAX_PROMPT_LENGTH: 10000,
  MIN_PROMPT_LENGTH: 1,
};

// Audit
export const AUDIT = {
  ENABLED: true,
  RETENTION_DAYS: 90,
  LOG_SENSITIVE_QUERIES: false,
};

/**
 * Get environment configuration
 */
export const getEnvConfig = () => ({
  geminiApiKey: process.env.GEMINI_API_KEY,
  groqApiKey: process.env.GROQ_API_KEY,
  groqModel: process.env.GROQ_MODEL || AI_MODELS.GROQ_DEFAULT,
  convexDeployment: process.env.CONVEX_DEPLOYMENT,
  environment: process.env.NODE_ENV || "development",
  debug: process.env.DEBUG === "true",
});

/**
 * Validate environment setup
 */
export const validateEnvironment = () => {
  const config = getEnvConfig();
  const warnings = [];
  const errors = [];

  if (!config.groqApiKey) {
    errors.push("GROQ_API_KEY is not configured");
  }

  if (!config.geminiApiKey) {
    warnings.push("GEMINI_API_KEY not configured - embeddings will be skipped");
  }

  if (!config.convexDeployment) {
    errors.push("CONVEX_DEPLOYMENT is not configured");
  }

  return { valid: errors.length === 0, errors, warnings, config };
};

export default {
  TIMEOUTS,
  RATE_LIMITING,
  FILE_LIMITS,
  TEXT_PROCESSING,
  RAG_PIPELINE,
  EMBEDDINGS,
  DATABASE,
  AI_MODELS,
  FEATURES,
  ERROR_MESSAGES,
  VALIDATION,
  AUDIT,
  getEnvConfig,
  validateEnvironment,
};
