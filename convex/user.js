// convex/user.ts
import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const createUser = mutation({
  args: {
    email: v.string(),
    userName: v.string(),       
    imageUrl: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if user exists
    const existingUsers = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), args.email))
      .collect();

    if (existingUsers.length === 0) {
      await ctx.db.insert("users", {
        email: args.email,
        userName: args.userName,
        imageUrl: args.imageUrl,
      });
      return "Inserted new user";
    }

    return "User already exists";
  },
});
