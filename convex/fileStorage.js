import { useMutation } from "convex/react";
import { action, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Validators } from "./utils/validators.js";
import { createLogger } from "./utils/logger.js";
import { NotFoundError, AuthorizationError } from "./utils/errors.js";

const logger = createLogger("FileStorage");

/**
 * Generate a file upload URL
 */
export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    try {
      const url = await ctx.storage.generateUploadUrl();
      logger.debug("Upload URL generated");
      return url;
    } catch (error) {
      logger.error("Upload URL generation failed", error);
      throw error;
    }
  },
});

/**
 * Add a PDF file entry to the database
 */
export const AddFileEntryToDb = mutation({
  args: {
    fileId: v.string(),
    storageId: v.id("_storage"),
    fileName: v.string(),
    fileUrl: v.string(),
    createdBy: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      // Validate inputs
      const fileId = Validators.fileId(args.fileId);
      const fileName = Validators.fileName(args.fileName);
      const createdBy = Validators.email(args.createdBy);

      if (!args.storageId || !args.fileUrl) {
        throw new Error("Storage ID and file URL are required");
      }

      const timestamp = Date.now();

      const result = await ctx.db.insert("pdfFiles", {
        fileId,
        fileName,
        storageId: args.storageId,
        fileUrl: args.fileUrl,
        createdBy,
        createdAt: timestamp,
        updatedAt: timestamp,
        totalChunks: 0,
        totalPages: 0,
        isIndexed: false,
      });

      logger.info("File entry added", { fileId, fileName, createdBy });
      return { success: true, id: result };
    } catch (error) {
      logger.error("Failed to add file entry", error, { fileId: args.fileId });
      throw error;
    }
  },
});

/**
 * Get the URL of an uploaded file from storage
 */
export const getFileurl = action({
  args: {
    storageId: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      const url = await ctx.storage.getUrl(args.storageId);
      if (!url) {
        throw new Error("File URL not found in storage");
      }
      return url;
    } catch (error) {
      logger.error("Failed to get file URL", error, { storageId: args.storageId });
      throw error;
    }
  },
});

/**
 * Fetch the file record using its fileId
 */
export const GetFileRecord = query({
  args: {
    fileId: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      const fileId = Validators.fileId(args.fileId);

      const result = await ctx.db
        .query("pdfFiles")
        .filter((q) => q.eq(q.field("fileId"), fileId))
        .first();

      if (!result) {
        logger.debug("File record not found", { fileId });
        return null;
      }

      return result;
    } catch (error) {
      logger.error("Failed to get file record", error, { fileId: args.fileId });
      throw error;
    }
  },
});

/**
 * Insert a document with fileId in metadata
 */
export const insertDocumentWithFileId = mutation({
  args: {
    embedding: v.array(v.number()),
    text: v.string(),
    fileId: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      const fileId = Validators.fileId(args.fileId);

      if (!args.embedding || args.embedding.length === 0) {
        throw new Error("Embedding array is required and must not be empty");
      }

      if (!args.text || args.text.trim().length === 0) {
        throw new Error("Text content is required");
      }

      const result = await ctx.db.insert("documents", {
        embedding: args.embedding,
        text: args.text,
        metadata: {
          fileId: fileId,
        },
        createdAt: Date.now(),
      });

      return { success: true, id: result };
    } catch (error) {
      logger.error("Failed to insert document", error, { fileId: args.fileId });
      throw error;
    }
  },
});

/**
 * Get all files for a user
 */
export const GetUserFiles = query({
  args: {
    userEmail: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    try {
      if (!args?.userEmail) {
        logger.warn("GetUserFiles called without email");
        return [];
      }

      const userEmail = Validators.email(args.userEmail);

      const result = await ctx.db
        .query("pdfFiles")
        .filter((q) => q.eq(q.field("createdBy"), userEmail))
        .collect();

      logger.debug("User files retrieved", { userEmail, count: result.length });
      return result;
    } catch (error) {
      logger.error("Failed to get user files", error, { userEmail: args.userEmail });
      throw error;
    }
  },
});

/**
 * Rename a PDF file
 */
export const RenamePdfFile = mutation({
  args: {
    fileId: v.string(),
    newFileName: v.string(),
    createdBy: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      const fileId = Validators.fileId(args.fileId);
      const newFileName = Validators.fileName(args.newFileName);
      const createdBy = Validators.email(args.createdBy);

      const fileRecord = await ctx.db
        .query("pdfFiles")
        .filter((q) => q.eq(q.field("fileId"), fileId))
        .first();

      if (!fileRecord) {
        throw new NotFoundError("PDF File", fileId);
      }

      if (fileRecord.createdBy !== createdBy) {
        throw new AuthorizationError("You do not have permission to rename this file");
      }

      await ctx.db.patch(fileRecord._id, {
        fileName: newFileName,
        updatedAt: Date.now(),
      });

      logger.info("File renamed", { fileId, oldName: fileRecord.fileName, newName: newFileName });
      return { success: true, message: "File renamed successfully" };
    } catch (error) {
      logger.error("Failed to rename file", error, { fileId: args.fileId });
      throw error;
    }
  },
});

/**
 * Delete a PDF file and all associated documents
 */
export const DeletePdfFile = mutation({
  args: {
    fileId: v.string(),
    createdBy: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      const fileId = Validators.fileId(args.fileId);
      const createdBy = Validators.email(args.createdBy);

      // Get the file record
      const fileRecord = await ctx.db
        .query("pdfFiles")
        .filter((q) => q.eq(q.field("fileId"), fileId))
        .first();

      if (!fileRecord) {
        throw new NotFoundError("PDF File", fileId);
      }

      // Check authorization
      if (fileRecord.createdBy !== createdBy) {
        throw new AuthorizationError("You do not have permission to delete this file");
      }

      // Delete all documents associated with this file
      const documents = await ctx.db
        .query("documents")
        .filter((q) => q.eq(q.field("metadata.fileId"), fileId))
        .collect();

      for (const doc of documents) {
        await ctx.db.delete(doc._id);
      }

      // Delete notes associated with this file
      const notes = await ctx.db
        .query("notes")
        .filter((q) => q.eq(q.field("fileId"), fileId))
        .collect();

      for (const note of notes) {
        await ctx.db.delete(note._id);
      }

      // Delete the file record itself
      await ctx.db.delete(fileRecord._id);

      // Delete from storage if possible
      try {
        await ctx.storage.delete(fileRecord.storageId);
      } catch (storageError) {
        logger.warn("Failed to delete file from storage", storageError, { fileId });
      }

      logger.info("File deleted", { fileId, fileName: fileRecord.fileName, docsDeleted: documents.length });
      return { success: true, message: "File deleted successfully", deletedDocuments: documents.length };
    } catch (error) {
      logger.error("Failed to delete file", error, { fileId: args.fileId });
      throw error;
    }
  },
});

/**
 * Update file indexing status
 */
export const UpdateFileIndexingStatus = mutation({
  args: {
    fileId: v.string(),
    isIndexed: v.boolean(),
    totalChunks: v.number(),
    totalPages: v.number(),
  },
  handler: async (ctx, args) => {
    try {
      const fileId = Validators.fileId(args.fileId);

      const fileRecord = await ctx.db
        .query("pdfFiles")
        .filter((q) => q.eq(q.field("fileId"), fileId))
        .first();

      if (!fileRecord) {
        throw new NotFoundError("PDF File", fileId);
      }

      await ctx.db.patch(fileRecord._id, {
        isIndexed: args.isIndexed,
        totalChunks: args.totalChunks,
        totalPages: args.totalPages,
        updatedAt: Date.now(),
      });

      logger.info("File indexing status updated", { fileId, isIndexed: args.isIndexed });
      return { success: true };
    } catch (error) {
      logger.error("Failed to update file indexing status", error, { fileId: args.fileId });
      throw error;
    }
  },
});

/**
 * Get files that haven't been indexed yet
 */
export const GetUnindexedFiles = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    try {
      const limit = args.limit || 10;

      const result = await ctx.db
        .query("pdfFiles")
        .filter((q) => q.eq(q.field("isIndexed"), false))
        .collect();

      return result.slice(0, limit);
    } catch (error) {
      logger.error("Failed to get unindexed files", error);
      throw error;
    }
  },
});