import { ConvexVectorStore } from "@langchain/community/vectorstores/convex";
import { action } from "./_generated/server.js";
import { TaskType } from "@google/generative-ai";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { v } from "convex/values";
import { createLogger } from "./utils/logger.js";
import { withTimeout, TimeoutError } from "./utils/errors.js";
import { Validators } from "./utils/validators.js";

const geminiApiKey = process.env.GEMINI_API_KEY;
const logger = createLogger("SearchAI");

const MAX_CONTEXT_CHUNKS = 8;
const SEARCH_CANDIDATE_K = 30;
const EMBEDDING_TIMEOUT_MS = 30000; // 30 seconds
const VECTOR_SEARCH_TIMEOUT_MS = 15000; // 15 seconds

const OVERVIEW_QUERY_REGEX = /(what|explain|describe|tell|overview|summar(y|ize)|high\s*level|about\s+(this|the|a)+\s*(module|document|pdf)|general\s+(idea|overview|summary))/i;

function normalizeText(text = "") {
  return text
    .replace(/\r/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function isOverviewQuery(query = "") {
  return OVERVIEW_QUERY_REGEX.test(query.trim());
}

function tokenize(text = "") {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length >= 2);
}

function relevanceFromOverlap(query, docs) {
  const stopWords = new Set([
    "what",
    "is",
    "the",
    "a",
    "an",
    "and",
    "or",
    "but",
    "in",
    "on",
    "at",
    "to",
    "for",
    "of",
    "by",
    "with",
    "that",
    "this",
    "are",
    "be",
    "have",
    "has",
    "was",
    "were",
  ]);

  let queryTokens = Array.from(new Set(tokenize(query)));
  const contentTokens = queryTokens.filter((token) => !stopWords.has(token));

  if (!contentTokens.length || !docs?.length) {
    return 0.2;
  }

  const contextTokens = new Set(tokenize(docs.map((d) => d.pageContent || "").join(" ")));
  const overlapCount = contentTokens.filter((token) => contextTokens.has(token)).length;
  return overlapCount / contentTokens.length;
}

async function getAllFileDocs(ctx, fileId) {
  try {
    const allDocs = await ctx.db.query("documents").collect();
    const scoped = allDocs.filter((doc) => doc?.metadata?.fileId === fileId);

    return scoped.map((doc) => ({
      pageContent: normalizeText(doc.text),
      metadata: doc.metadata,
      createdAt: doc._creationTime,
    }));
  } catch (err) {
    logger.error("Error fetching docs for fileId", err, { fileId });
    return [];
  }
}

function lexicalFallbackSearch(fileDocs, query) {
  const scoped = fileDocs || [];

  const stopWords = new Set([
    "what",
    "is",
    "the",
    "a",
    "an",
    "and",
    "or",
    "but",
    "in",
    "on",
    "at",
    "to",
    "for",
    "of",
    "by",
    "with",
    "that",
    "this",
    "are",
    "be",
    "have",
    "has",
    "was",
    "were",
  ]);
  const qTokens = tokenize(query).filter((token) => !stopWords.has(token));

  const hasContentTokens = qTokens.length > 0;

  const ranked = scoped
    .map((doc) => {
      let score = 0;
      if (hasContentTokens) {
        const docText = (doc.pageContent || "").toLowerCase();
        const hasExactPhrase = qTokens.every((token) => docText.includes(token));

        if (hasExactPhrase) {
          score = 1.0;
        } else {
          const docTokens = new Set(tokenize(doc.pageContent));
          const matches = qTokens.filter((token) => docTokens.has(token)).length;
          score = qTokens.length > 0 ? matches / qTokens.length : 0;
        }
      } else {
        score = doc.pageContent?.length > 100 ? 0.5 : 0;
      }

      return {
        pageContent: doc.pageContent,
        metadata: doc.metadata,
        score,
      };
    })
    .filter((doc) => doc.score >= 0.3)
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_CONTEXT_CHUNKS);

  return ranked;
}

function overviewFallback(fileDocs) {
  if (!fileDocs?.length) return [];

  return fileDocs
    .filter((doc) => doc.pageContent?.length > 80)
    .sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0))
    .slice(0, MAX_CONTEXT_CHUNKS)
    .map((doc) => ({
      pageContent: doc.pageContent,
      metadata: doc.metadata,
      score: 1,
    }));
}

function getEmbeddings(taskType = TaskType.RETRIEVAL_DOCUMENT) {
  if (!geminiApiKey) {
    logger.debug("Embeddings API key not configured", { taskType });
    return null;
  }

  return new GoogleGenerativeAIEmbeddings({
    apiKey: geminiApiKey,
    model: "text-embedding-004",
    taskType,
    title: "Document title",
  });
}

export const ingest = action({
  args: {
    splitText: v.array(v.string()),
    fileId: v.string(),
  },
  handler: async (ctx, args) => {
    const startTime = Date.now();

    try {
      // Validate inputs
      const fileId = Validators.fileId(args.fileId);
      const splitText = Validators.array(args.splitText, Validators.query, 1, 50000);

      logger.info("Ingest started", { fileId, chunkCount: splitText.length });

      const embeddings = getEmbeddings(TaskType.RETRIEVAL_DOCUMENT);
      if (!embeddings) {
        logger.warn("Ingest skipped - no embeddings provider", { fileId });
        return "Ingest skipped: GEMINI_API_KEY not configured";
      }

      // Clean and filter chunks
      const cleanedChunks = splitText
        .map((chunk) => normalizeText(chunk || ""))
        .filter((chunk) => chunk.length >= 160);

      if (!cleanedChunks.length) {
        logger.warn("No meaningful chunks after filtering", { fileId });
        return "Ingest completed: no meaningful chunks to index";
      }

      logger.info("Processing chunks", { fileId, cleanedCount: cleanedChunks.length });

      // Ingest with timeout
      await withTimeout(
        ConvexVectorStore.fromTexts(
          cleanedChunks,
          cleanedChunks.map((_, idx) => ({ fileId, chunkIndex: idx })),
          embeddings,
          { ctx }
        ),
        EMBEDDING_TIMEOUT_MS,
        "Embedding ingestion"
      );

      const duration = Date.now() - startTime;
      logger.info("Ingest completed successfully", {
        fileId,
        chunkCount: cleanedChunks.length,
        duration,
      });

      return `Ingest completed: ${cleanedChunks.length} chunks indexed`;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error("Ingest failed", error, { fileId: args.fileId, duration });

      if (error instanceof TimeoutError) {
        return `Ingest timeout: ${error.message}`;
      }

      return `Ingest error: ${error.message || "Unknown error"}`;
    }
  },
});

export const search = action({
  args: {
    query: v.string(),
    fileId: v.string(),
  },
  handler: async (ctx, args) => {
    const startTime = Date.now();

    try {
      // Validate inputs
      const query = Validators.query(args.query);
      const fileId = Validators.fileId(args.fileId);

      const normalizedQuery = normalizeText(query);
      const wantsOverview = isOverviewQuery(normalizedQuery);

      logger.debug("Search initiated", { fileId, query: query.substring(0, 100), wantsOverview });

      // Fetch all documents for this file
      const fileDocs = await withTimeout(
        getAllFileDocs(ctx, fileId),
        VECTOR_SEARCH_TIMEOUT_MS,
        "Fetching file documents"
      );

      if (!fileDocs.length) {
        logger.info("Search completed - no documents", { fileId });
        return JSON.stringify({
          matches: [],
          hasRelevantContext: false,
          relevanceScore: 0,
          retrievalMode: "no-docs",
        });
      }

      let resultOne = [];
      let retrievalMode = "none";

      // STAGE 1: Lexical search
      logger.debug("Starting lexical search", { fileId });
      const lexicalResults = lexicalFallbackSearch(fileDocs, normalizedQuery);

      if (lexicalResults.length > 0) {
        resultOne = lexicalResults;
        retrievalMode = "lexical";
        logger.debug("Lexical search successful", { fileId, matchCount: resultOne.length });

        const relevanceScore = relevanceFromOverlap(query, resultOne);
        const hasRelevantContext = relevanceScore >= 0.2;

        const duration = Date.now() - startTime;
        logger.info("Search completed via lexical", {
          fileId,
          relevanceScore,
          duration,
        });

        return JSON.stringify({
          matches: resultOne,
          hasRelevantContext,
          relevanceScore,
          retrievalMode,
        });
      }

      // STAGE 2: Vector search (only if lexical failed)
      if (!wantsOverview) {
        logger.debug("Trying vector search", { fileId });
        const embeddings = getEmbeddings(TaskType.RETRIEVAL_QUERY);

        if (embeddings) {
          try {
            const vectorStore = new ConvexVectorStore(embeddings, { ctx });

            let vectorCandidates = [];
            if (typeof vectorStore.similaritySearchWithScore === "function") {
              const withScores = await withTimeout(
                vectorStore.similaritySearchWithScore(normalizedQuery, SEARCH_CANDIDATE_K),
                VECTOR_SEARCH_TIMEOUT_MS,
                "Vector similarity search"
              );

              vectorCandidates = withScores
                .filter(([doc]) => doc?.metadata?.fileId === fileId)
                .slice(0, MAX_CONTEXT_CHUNKS)
                .map(([doc, score]) => ({
                  pageContent: normalizeText(doc.pageContent),
                  metadata: doc.metadata,
                  score,
                }));
            } else {
              const results = await withTimeout(
                vectorStore.similaritySearch(normalizedQuery, SEARCH_CANDIDATE_K),
                VECTOR_SEARCH_TIMEOUT_MS,
                "Vector search"
              );

              vectorCandidates = results
                .filter((q) => q.metadata?.fileId === fileId)
                .slice(0, MAX_CONTEXT_CHUNKS)
                .map((doc) => ({
                  pageContent: normalizeText(doc.pageContent),
                  metadata: doc.metadata,
                  score: null,
                }));
            }

            if (vectorCandidates.length > 0) {
              resultOne = vectorCandidates;
              retrievalMode = "vector";
              logger.debug("Vector search successful", { fileId, matchCount: resultOne.length });
            }
          } catch (vectorError) {
            logger.warn("Vector search failed, falling back to overview", vectorError, { fileId });
          }
        }
      }

      // STAGE 3: Overview fallback
      if ((wantsOverview && resultOne.length === 0) || resultOne.length === 0) {
        logger.debug("Using overview fallback", { fileId });
        const overviewResults = overviewFallback(fileDocs);
        if (overviewResults.length > 0) {
          resultOne = overviewResults;
          retrievalMode = "overview";
        }
      }

      // Final relevance check
      const relevanceScore = relevanceFromOverlap(query, resultOne);
      const hasRelevantContext = resultOne.length > 0 && relevanceScore >= 0.2;

      const duration = Date.now() - startTime;
      logger.info("Search completed", {
        fileId,
        retrievalMode,
        matchCount: resultOne.length,
        relevanceScore,
        duration,
      });

      return JSON.stringify({
        matches: resultOne,
        hasRelevantContext,
        relevanceScore,
        retrievalMode,
      });
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error("Search failed", error, { fileId: args.fileId, duration });

      if (error instanceof TimeoutError) {
        return JSON.stringify({
          matches: [],
          hasRelevantContext: false,
          relevanceScore: 0,
          retrievalMode: "timeout",
          error: error.message,
        });
      }

      return JSON.stringify({
        matches: [],
        hasRelevantContext: false,
        relevanceScore: 0,
        retrievalMode: "error",
        error: error.message || "Unknown error during search",
      });
    }
  },
});