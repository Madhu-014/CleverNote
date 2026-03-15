import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Validators } from "./utils/validators.js";
import { createLogger } from "./utils/logger.js";
import { ConflictError } from "./utils/errors.js";

const logger = createLogger("Users");

/**
 * Create a new user or return existing user
 */
export const createUser = mutation({
  args: {
    email: v.string(),
    userName: v.string(),
    imageUrl: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      // Validate inputs
      const email = Validators.email(args.email);
      const userName = Validators.username(args.userName);
      const imageUrl = args.imageUrl?.trim() || "";

      if (!imageUrl) {
        throw new Error("Image URL is required");
      }

      // Check if user exists
      const existingUser = await ctx.db
        .query("users")
        .filter((q) => q.eq(q.field("email"), email))
        .first();

      const timestamp = Date.now();

      if (existingUser) {
        // Update existing user if needed
        await ctx.db.patch(existingUser._id, {
          updatedAt: timestamp,
          isActive: true,
        });
        logger.info("Existing user updated", { email });
        return {
          success: true,
          message: "User already exists",
          userId: existingUser._id,
        };
      }

      // Create new user
      const userId = await ctx.db.insert("users", {
        email,
        userName,
        imageUrl,
        createdAt: timestamp,
        updatedAt: timestamp,
        isActive: true,
      });

      logger.info("New user created", { email, userName });

      return {
        success: true,
        message: "User created successfully",
        userId,
      };
    } catch (error) {
      logger.error("Failed to create user", error, { email: args.email });
      throw error;
    }
  },
});

/**
 * Get user by email
 */
export const GetUserByEmail = query({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      const email = Validators.email(args.email);

      const user = await ctx.db
        .query("users")
        .filter((q) => q.eq(q.field("email"), email))
        .first();

      return user || null;
    } catch (error) {
      logger.error("Failed to get user", error, { email: args.email });
      throw error;
    }
  },
});

/**
 * Update user profile
 */
export const UpdateUserProfile = mutation({
  args: {
    email: v.string(),
    userName: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    try {
      const email = Validators.email(args.email);

      const user = await ctx.db
        .query("users")
        .filter((q) => q.eq(q.field("email"), email))
        .first();

      if (!user) {
        throw new Error("User not found");
      }

      const updateData = {
        updatedAt: Date.now(),
      };

      if (args.userName) {
        updateData.userName = Validators.username(args.userName);
      }

      if (args.imageUrl) {
        updateData.imageUrl = args.imageUrl.trim();
      }

      await ctx.db.patch(user._id, updateData);

      logger.info("User profile updated", { email });

      return {
        success: true,
        message: "Profile updated successfully",
      };
    } catch (error) {
      logger.error("Failed to update user profile", error, { email: args.email });
      throw error;
    }
  },
});

/**
 * Deactivate user account
 */
export const DeactivateUser = mutation({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      const email = Validators.email(args.email);

      const user = await ctx.db
        .query("users")
        .filter((q) => q.eq(q.field("email"), email))
        .first();

      if (!user) {
        throw new Error("User not found");
      }

      await ctx.db.patch(user._id, {
        isActive: false,
        updatedAt: Date.now(),
      });

      logger.info("User deactivated", { email });

      return {
        success: true,
        message: "Account deactivated",
      };
    } catch (error) {
      logger.error("Failed to deactivate user", error, { email: args.email });
      throw error;
    }
  },
});
