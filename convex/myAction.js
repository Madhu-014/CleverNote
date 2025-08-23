import { ConvexVectorStore } from "@langchain/community/vectorstores/convex";
import { action } from "./_generated/server.js";
import { GoogleGenerativeAI, TaskType } from "@google/generative-ai";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { v } from "convex/values";

export const ingest = action({
  args: {
    splitText: v.array(v.string()),  // ✅ make it an array of text chunks 
    fileId: v.string()
  },
  handler: async (ctx, args) => { 
    await ConvexVectorStore.fromTexts(
      args.splitText, // the actual texts
      args.splitText.map(() => ({ fileId: args.fileId })), // ✅ metadata objects
      new GoogleGenerativeAIEmbeddings({
        apiKey: 'AIzaSyBFEHu1cPFJNZKABvDDkNo2mDI77B7NF0c',
        model: "text-embedding-004",
        taskType: TaskType.RETRIEVAL_DOCUMENT,
        title: "Document title",
      }),
      { ctx }
    );
    return "Completed..";
  },
});
export const search = action({
  args: {
    query: v.string(),
    fileId: v.string()
  },
  handler: async (ctx, args) => {
    const vectorStore = new ConvexVectorStore(
      new GoogleGenerativeAIEmbeddings({
        apiKey: 'AIzaSyBFEHu1cPFJNZKABvDDkNo2mDI77B7NF0c',
        model: "text-embedding-004",
        taskType: TaskType.RETRIEVAL_DOCUMENT,
        title: "Document title",
      }),
      { ctx }
    );
    const resultOne = (await vectorStore.similaritySearch(args.query, 3))
  .filter(q => q.metadata.fileId === args.fileId);
    console.log(resultOne);

    return JSON.stringify(resultOne);
  },
});