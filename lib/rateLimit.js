/**
 * Rate limiting utility for Vercel deployment
 * Supports both in-memory (development) and Vercel KV (production)
 */

// In-memory rate limit store (fallback for development)
const inMemoryStore = new Map();

/**
 * Initialize KV client if available
 */
function initKvClient() {
  try {
    if (process.env.VERCEL_KV_URL && process.env.VERCEL_KV_REST_API_TOKEN) {
      // Dynamic import to avoid build issues if not needed
      return {
        url: process.env.VERCEL_KV_URL,
        token: process.env.VERCEL_KV_REST_API_TOKEN,
      };
    }
  } catch (error) {
    console.warn("Failed to initialize KV client, using in-memory store:", error.message);
  }
  return null;
}

const kvClient = initKvClient();

/**
 * Get rate limit key
 */
function getRateLimitKey(clientId, prefix = "ratelimit") {
  // Sanitize clientId for KV compatibility
  const sanitized = clientId
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .substring(0, 100);
  return `${prefix}:${sanitized}`;
}

/**
 * Get current request count from KV
 */
async function getKvCount(key) {
  try {
    const response = await fetch(`${kvClient.url}/get/${key}`, {
      headers: {
        Authorization: `Bearer ${kvClient.token}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      return data.result ? parseInt(data.result) : 0;
    }
  } catch (error) {
    console.error("KV get error:", error.message);
  }
  return 0;
}

/**
 * Set request count in KV with TTL
 */
async function setKvCount(key, count, ttlSeconds = 60) {
  try {
    await fetch(`${kvClient.url}/set/${key}/${count}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${kvClient.token}`,
      },
      body: JSON.stringify({
        ex: ttlSeconds,
      }),
    });
  } catch (error) {
    console.error("KV set error:", error.message);
  }
}

/**
 * Increment counter in KV
 */
async function incrementKvCounter(key, ttlSeconds = 60) {
  try {
    const response = await fetch(`${kvClient.url}/incr/${key}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${kvClient.token}`,
      },
    });

    if (response.ok) {
      // Set expiry if first increment
      const count = await getKvCount(key);
      if (count === 1) {
        await setKvCount(key, count, ttlSeconds);
      }
      return count;
    }
  } catch (error) {
    console.error("KV increment error:", error.message);
  }
  return null;
}

/**
 * Check if client has exceeded rate limit
 */
export async function checkRateLimit(
  clientId,
  maxRequests = 30,
  windowSeconds = 60
) {
  const key = getRateLimitKey(clientId);

  // Use KV in production if available
  if (kvClient) {
    try {
      const count = await incrementKvCounter(key, windowSeconds);
      if (count !== null) {
        return {
          allowed: count <= maxRequests,
          remaining: Math.max(0, maxRequests - count),
          retryAfter: windowSeconds,
          limit: maxRequests,
        };
      }
    } catch (error) {
      console.error("Rate limit check failed:", error);
      // Fail open - allow request if KV fails
      return {
        allowed: true,
        remaining: maxRequests - 1,
        retryAfter: windowSeconds,
        limit: maxRequests,
      };
    }
  }

  // Fall back to in-memory store for development
  const now = Date.now();
  let clientData = inMemoryStore.get(clientId) || {
    requests: [],
    windowStart: now,
  };

  // Reset window if expired
  if (now - clientData.windowStart > windowSeconds * 1000) {
    clientData = { requests: [], windowStart: now };
  }

  // Add current request
  clientData.requests.push(now);

  // Remove old requests
  clientData.requests = clientData.requests.filter(
    (time) => now - time < windowSeconds * 1000
  );

  inMemoryStore.set(clientId, clientData);

  const remaining = Math.max(0, maxRequests - clientData.requests.length);

  return {
    allowed: clientData.requests.length <= maxRequests,
    remaining,
    retryAfter: windowSeconds,
    limit: maxRequests,
  };
}

/**
 * Get rate limit status for client
 */
export async function getRateLimitStatus(clientId) {
  if (kvClient) {
    try {
      const count = await getKvCount(getRateLimitKey(clientId));
      return {
        currentCount: count,
        using: "vercel-kv",
      };
    } catch (error) {
      console.error("Failed to get rate limit status:", error);
    }
  }

  const clientData = inMemoryStore.get(clientId);
  return {
    currentCount: clientData ? clientData.requests.length : 0,
    using: "in-memory",
  };
}

/**
 * Reset rate limit for client (admin function)
 */
export async function resetRateLimit(clientId) {
  const key = getRateLimitKey(clientId);

  if (kvClient) {
    try {
      await fetch(`${kvClient.url}/del/${key}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${kvClient.token}`,
        },
      });
      return true;
    } catch (error) {
      console.error("Failed to reset KV rate limit:", error);
    }
  }

  inMemoryStore.delete(clientId);
  return true;
}
