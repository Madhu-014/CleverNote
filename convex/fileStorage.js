import { useMutation } from "convex/react";
import { action, mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Generate a file upload URL
export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

// Add a PDF file entry to the "pdfFiles" table
export const AddFileEntryToDb = mutation({
  args: {
    fileId: v.string(),
    storageId: v.id("_storage"),
    fileName: v.string(),
    fileUrl: v.string(),
    createdBy: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("pdfFiles", {
      fileId: args.fileId,
      fileName: args.fileName,
      storageId: args.storageId,
      fileUrl: args.fileUrl,
      createdBy: args.createdBy,
    });

    return "Inserted";
  },
});

// Get the URL of the uploaded file from storage
export const getFileurl = action({
  args: {
    storageId: v.string(),
  },
  handler: async (ctx, args) => {
    const url = await ctx.storage.getUrl(args.storageId);
    return url;
  },
});

// Fetch the file record using its fileId
export const GetFileRecord = query({
  args: {
    fileId: v.string(),
  },
  handler: async (ctx, args) => {
    const result = await ctx.db
      .query("pdfFiles")
      .filter((q) => q.eq(q.field("fileId"), args.fileId))
      .first();
    return result;
  },
});

// ✅ Insert a document with fileId stored inside metadata
export const insertDocumentWithFileId = mutation({
  args: {
    embedding: v.array(v.number()),
    text: v.string(),
    fileId: v.string(), // ✅ Pass fileId directly
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("documents", {
      embedding: args.embedding,
      text: args.text,
      metadata: {
        fileId: args.fileId, // ✅ fileId goes inside metadata here
      },
    });

    return "Document inserted with fileId in metadata.";
  },
});

export const GetUserFiles=query({
  args:{
    userEmail:v.optional(v.string())
  },
  handler:async(ctx,args)=>{

    if(!args?.userEmail){
      return;
    }
    const result = await ctx.db.query("pdfFiles").filter((q) => q.eq(q.field("createdBy"), args?.userEmail)).collect();
    return result;
  }
})