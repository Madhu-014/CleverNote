/**
 * Input validation utilities
 */

import { ValidationError } from "./errors.js";

export const Validators = {
  email: (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(email)) {
      throw new ValidationError("Invalid email format", { field: "email", value: email });
    }
    return email.toLowerCase();
  },

  username: (username) => {
    if (!username || username.length < 2 || username.length > 50) {
      throw new ValidationError("Username must be between 2 and 50 characters", {
        field: "username",
        length: username?.length,
      });
    }
    return username.trim();
  },

  fileName: (fileName) => {
    if (!fileName || fileName.length < 1 || fileName.length > 255) {
      throw new ValidationError("File name must be between 1 and 255 characters", {
        field: "fileName",
        length: fileName?.length,
      });
    }
    // Prevent path traversal attacks
    if (fileName.includes("..") || fileName.includes("/") || fileName.includes("\\")) {
      throw new ValidationError("Invalid file name characters", { field: "fileName" });
    }
    return fileName.trim();
  },

  fileId: (fileId) => {
    if (!fileId || typeof fileId !== "string" || fileId.length < 1) {
      throw new ValidationError("Invalid file ID", { field: "fileId" });
    }
    return fileId.trim();
  },

  query: (query) => {
    if (!query || typeof query !== "string" || query.length < 1) {
      throw new ValidationError("Query cannot be empty", { field: "query" });
    }
    if (query.length > 5000) {
      throw new ValidationError("Query exceeds maximum length of 5000 characters", {
        field: "query",
        length: query.length,
      });
    }
    return query.trim();
  },

  prompt: (prompt) => {
    if (!prompt || typeof prompt !== "string" || prompt.length < 1) {
      throw new ValidationError("Prompt cannot be empty", { field: "prompt" });
    }
    if (prompt.length > 10000) {
      throw new ValidationError("Prompt exceeds maximum length of 10000 characters", {
        field: "prompt",
        length: prompt.length,
      });
    }
    return prompt.trim();
  },

  notes: (notes) => {
    if (typeof notes !== "string") {
      throw new ValidationError("Notes must be a string", { field: "notes" });
    }
    if (notes.length > 1000000) {
      throw new ValidationError("Notes exceed maximum size", {
        field: "notes",
        maxSize: "1MB",
      });
    }
    return notes;
  },

  array: (arr, itemValidator = null, minLength = 0, maxLength = 1000) => {
    if (!Array.isArray(arr)) {
      throw new ValidationError("Expected an array", { field: "array" });
    }
    if (arr.length < minLength || arr.length > maxLength) {
      throw new ValidationError(
        `Array length must be between ${minLength} and ${maxLength}`,
        { length: arr.length }
      );
    }
    if (itemValidator) {
      return arr.map((item, index) => {
        try {
          return itemValidator(item);
        } catch (e) {
          throw new ValidationError(`Invalid array item at index ${index}: ${e.message}`);
        }
      });
    }
    return arr;
  },

  optional: (value, validator) => {
    if (value === null || value === undefined) {
      return value;
    }
    return validator(value);
  },
};

export function validateRequired(value, fieldName) {
  if (value === null || value === undefined || value === "") {
    throw new ValidationError(`${fieldName} is required`, { field: fieldName });
  }
  return value;
}

export function validateObject(obj, schema) {
  const errors = {};
  const validated = {};

  for (const [key, validator] of Object.entries(schema)) {
    try {
      validated[key] = validator(obj[key]);
    } catch (e) {
      errors[key] = e.message;
    }
  }

  if (Object.keys(errors).length > 0) {
    throw new ValidationError("Validation failed", { errors });
  }

  return validated;
}

export default Validators;
