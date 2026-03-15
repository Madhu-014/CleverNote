/**
 * Structured logging utilities for Convex backend
 */

export const LogLevel = {
  DEBUG: "DEBUG",
  INFO: "INFO",
  WARN: "WARN",
  ERROR: "ERROR",
};

class Logger {
  constructor(module = "App") {
    this.module = module;
  }

  log(level, message, data = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      module: this.module,
      message,
      ...data,
    };
    console.log(JSON.stringify(logEntry));
  }

  debug(message, data = {}) {
    this.log(LogLevel.DEBUG, message, data);
  }

  info(message, data = {}) {
    this.log(LogLevel.INFO, message, data);
  }

  warn(message, data = {}) {
    this.log(LogLevel.WARN, message, data);
  }

  error(message, error = null, data = {}) {
    const errorData = error
      ? {
          errorName: error.name,
          errorMessage: error.message,
          errorStack: error.stack?.split("\n").slice(0, 5),
          ...data,
        }
      : data;

    this.log(LogLevel.ERROR, message, errorData);
  }
}

export function createLogger(module) {
  return new Logger(module);
}

/**
 * Log action execution
 */
export function logActionStart(actionName, args = {}) {
  const logger = createLogger(actionName);
  logger.info("Action started", { args: sanitizeArgs(args) });
}

/**
 * Log action completion
 */
export function logActionComplete(actionName, result = {}, duration = 0) {
  const logger = createLogger(actionName);
  logger.info("Action completed", { duration: `${duration}ms`, resultKeys: Object.keys(result) });
}

/**
 * Log action error
 */
export function logActionError(actionName, error, args = {}) {
  const logger = createLogger(actionName);
  logger.error("Action failed", error, { args: sanitizeArgs(args) });
}

/**
 * Sanitize sensitive data from logs
 */
function sanitizeArgs(args) {
  if (!args || typeof args !== "object") return args;

  const sanitized = { ...args };
  const sensitiveKeys = ["password", "apiKey", "token", "secret", "key"];

  for (const key of sensitiveKeys) {
    if (key in sanitized) {
      sanitized[key] = "[REDACTED]";
    }
  }

  return sanitized;
}

export default createLogger;
