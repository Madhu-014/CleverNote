import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Add or update notes (HTML content)
export const AddNotes = mutation({
  args: {
    fileId: v.string(),
    notes: v.string(), // <- full HTML
    createdBy: v.string(),
  },
  handler: async (ctx, args) => {
    const record = await ctx.db
      .query("notes")
      .filter(q => q.eq(q.field("fileId"), args.fileId))
      .first();

    if (!record) {
      await ctx.db.insert("notes", {
        fileId: args.fileId,
        notes: args.notes,
        createdBy: args.createdBy,
      });
    } else {
      await ctx.db.patch(record._id, {
        notes: args.notes,
      });
    }
  },
});

// Get saved HTML for a file
export const GetNotes = query({
  args: { fileId: v.string() },
  handler: async (ctx, args) => {
    const record = await ctx.db
      .query("notes")
      .filter(q => q.eq(q.field("fileId"), args.fileId))
      .first();

    return record?.notes || ""; // return HTML string
  },
});
