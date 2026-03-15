/**
 * Structured error handling for Convex backend
 */

export class ApiError extends Error {
  constructor(message, statusCode = 500, details = {}) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }

  toJSON() {
    return {
      error: this.message,
      statusCode: this.statusCode,
      details: this.details,
      timestamp: this.timestamp,
    };
  }
}

export class ValidationError extends ApiError {
  constructor(message, details = {}) {
    super(message, 400, details);
    this.name = "ValidationError";
  }
}

export class AuthorizationError extends ApiError {
  constructor(message = "Unauthorized access", details = {}) {
    super(message, 401, details);
    this.name = "AuthorizationError";
  }
}

export class NotFoundError extends ApiError {
  constructor(resource = "Resource", id = null) {
    const message = id ? `${resource} with id ${id} not found` : `${resource} not found`;
    super(message, 404, { resource, id });
    this.name = "NotFoundError";
  }
}

export class ConflictError extends ApiError {
  constructor(message, details = {}) {
    super(message, 409, details);
    this.name = "ConflictError";
  }
}

export class RateLimitError extends ApiError {
  constructor(message = "Rate limit exceeded", retryAfter = 60) {
    super(message, 429, { retryAfter });
    this.name = "RateLimitError";
  }
}

export class TimeoutError extends ApiError {
  constructor(message = "Request timeout", details = {}) {
    super(message, 504, details);
    this.name = "TimeoutError";
  }
}

/**
 * Execute async operation with timeout
 */
export async function withTimeout(promise, timeoutMs = 30000, operationName = "Operation") {
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(
      () => reject(new TimeoutError(`${operationName} exceeded ${timeoutMs}ms timeout`)),
      timeoutMs
    )
  );
  return Promise.race([promise, timeoutPromise]);
}

/**
 * Safely handle errors and log them
 */
export function handleError(error, context = {}) {
  const errorResponse = {
    message: error.message || "An error occurred",
    timestamp: new Date().toISOString(),
    ...context,
  };

  if (error instanceof ApiError) {
    return {
      statusCode: error.statusCode,
      ...error.toJSON(),
    };
  }

  // Unknown error - log and return 500
  console.error("Unexpected error:", error, context);
  return {
    statusCode: 500,
    error: "Internal server error",
    ...errorResponse,
  };
}
