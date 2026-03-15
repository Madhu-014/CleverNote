import {defineSchema, defineTable} from "convex/server";
import {v} from "convex/values";

export default defineSchema({
    users: defineTable({
        userName: v.string(),
        email: v.string(),
        imageUrl: v.string(),
        createdAt: v.optional(v.number()),
        updatedAt: v.optional(v.number()),
        isActive: v.optional(v.boolean()),
    })
    .index("email", ["email"]),

    pdfFiles: defineTable({
        fileId: v.string(),
        storageId: v.id("_storage"),
        fileName: v.string(),
        fileUrl: v.string(),
        createdBy: v.string(),
        createdAt: v.optional(v.number()),
        updatedAt: v.optional(v.number()),
        totalChunks: v.optional(v.number()),
        totalPages: v.optional(v.number()),
        isIndexed: v.optional(v.boolean()),
        fileSize: v.optional(v.number()),
        mimeType: v.optional(v.string()),
    })
    .index("createdBy", ["createdBy"])
    .index("fileId", ["fileId"])
    .index("createdBy_createdAt", ["createdBy", "createdAt"]),
    
    documents: defineTable({
        embedding: v.array(v.number()),
        text: v.string(),
        metadata: v.object({
            fileId: v.string(),
            chunkIndex: v.number(),
            pageNumber: v.optional(v.number()),
        }),
        createdAt: v.number(),
    })
    .vectorIndex("byEmbedding", {
        vectorField: "embedding",
        dimensions: 768,
    })
    .index("fileId_metadata", ["metadata.fileId"]),

    notes: defineTable({
        fileId: v.string(),
        notes: v.string(),
        createdBy: v.string(),
        createdAt: v.optional(v.number()),
        updatedAt: v.optional(v.number()),
    })
    .index("fileId", ["fileId"])
    .index("createdBy_fileId", ["createdBy", "fileId"]),

    auditLog: defineTable({
        userId: v.string(),
        action: v.string(),
        resource: v.string(),
        resourceId: v.string(),
        status: v.string(), // "success" | "error"
        error: v.optional(v.string()),
        metadata: v.optional(v.object({})),
        timestamp: v.number(),
    })
    .index("userId", ["userId"])
    .index("timestamp", ["timestamp"])
    .index("userId_timestamp", ["userId", "timestamp"]),
})