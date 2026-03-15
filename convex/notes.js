import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Validators } from "./utils/validators.js";
import { createLogger } from "./utils/logger.js";
import { NotFoundError, AuthorizationError } from "./utils/errors.js";

const logger = createLogger("Notes");

const MAX_NOTES_SIZE = 1000000; // 1MB

/**
 * Add or update notes (HTML content)
 */
export const AddNotes = mutation({
  args: {
    fileId: v.string(),
    notes: v.string(),
    createdBy: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      // Validate inputs
      const fileId = Validators.fileId(args.fileId);
      const notes = Validators.notes(args.notes);
      const createdBy = Validators.email(args.createdBy);

      // Verify file exists and user owns it
      const fileRecord = await ctx.db
        .query("pdfFiles")
        .filter((q) => q.eq(q.field("fileId"), fileId))
        .first();

      if (!fileRecord) {
        throw new NotFoundError("PDF File", fileId);
      }

      if (fileRecord.createdBy !== createdBy) {
        throw new AuthorizationError("You do not have permission to edit notes for this file");
      }

      const timestamp = Date.now();
      const record = await ctx.db
        .query("notes")
        .filter((q) => q.eq(q.field("fileId"), fileId))
        .first();

      if (!record) {
        await ctx.db.insert("notes", {
          fileId,
          notes,
          createdBy,
          createdAt: timestamp,
          updatedAt: timestamp,
        });
        logger.info("Notes created", { fileId, size: notes.length });
      } else {
        await ctx.db.patch(record._id, {
          notes,
          updatedAt: timestamp,
        });
        logger.info("Notes updated", { fileId, size: notes.length });
      }

      return { success: true, message: "Notes saved successfully" };
    } catch (error) {
      logger.error("Failed to save notes", error, { fileId: args.fileId });
      throw error;
    }
  },
});

/**
 * Get saved HTML for a file
 */
export const GetNotes = query({
  args: { fileId: v.string() },
  handler: async (ctx, args) => {
    try {
      const fileId = Validators.fileId(args.fileId);

      const record = await ctx.db
        .query("notes")
        .filter((q) => q.eq(q.field("fileId"), fileId))
        .first();

      return record?.notes || "";
    } catch (error) {
      logger.error("Failed to get notes", error, { fileId: args.fileId });
      throw error;
    }
  },
});

/**
 * Delete notes for a file
 */
export const DeleteNotes = mutation({
  args: {
    fileId: v.string(),
    createdBy: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      const fileId = Validators.fileId(args.fileId);
      const createdBy = Validators.email(args.createdBy);

      // Verify ownership
      const fileRecord = await ctx.db
        .query("pdfFiles")
        .filter((q) => q.eq(q.field("fileId"), fileId))
        .first();

      if (!fileRecord) {
        throw new NotFoundError("PDF File", fileId);
      }

      if (fileRecord.createdBy !== createdBy) {
        throw new AuthorizationError("You do not have permission to delete notes for this file");
      }

      const record = await ctx.db
        .query("notes")
        .filter((q) => q.eq(q.field("fileId"), fileId))
        .first();

      if (!record) {
        logger.debug("Notes not found for deletion", { fileId });
        return { success: true, message: "No notes to delete" };
      }

      await ctx.db.delete(record._id);
      logger.info("Notes deleted", { fileId });

      return { success: true, message: "Notes deleted successfully" };
    } catch (error) {
      logger.error("Failed to delete notes", error, { fileId: args.fileId });
      throw error;
    }
  },
});
