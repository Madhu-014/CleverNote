import { NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rateLimit";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const REQUEST_TIMEOUT_MS = 60000; // 60 seconds
const MAX_PROMPT_LENGTH = 10000;
const MIN_PROMPT_LENGTH = 1;
const RATE_LIMIT_MAX_REQUESTS = 30; // 30 requests per minute
const RATE_LIMIT_WINDOW = 60; // 60 seconds

function normalizeGroqContent(content) {
  if (!content) return "";
  if (typeof content === "string") return content;

  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === "string") return part;
        if (part && typeof part === "object") {
          if (typeof part.text === "string") return part.text;
          if (typeof part.content === "string") return part.content;
        }
        return "";
      })
      .join("\n")
      .trim();
  }

  if (typeof content === "object") {
    if (typeof content.text === "string") return content.text;
    if (typeof content.content === "string") return content.content;
  }

  return String(content);
}

/**
 * Validate prompt input
 */
function validatePrompt(prompt) {
  if (!prompt || typeof prompt !== "string") {
    throw new Error("Prompt must be a non-empty string");
  }

  const trimmedPrompt = prompt.trim();

  if (trimmedPrompt.length < MIN_PROMPT_LENGTH) {
    throw new Error(`Prompt must be at least ${MIN_PROMPT_LENGTH} character(s)`);
  }

  if (trimmedPrompt.length > MAX_PROMPT_LENGTH) {
    throw new Error(`Prompt must not exceed ${MAX_PROMPT_LENGTH} characters (received ${trimmedPrompt.length})`);
  }

  return trimmedPrompt;
}

/**
 * Execute Groq API call with timeout
 */
async function callGroqAPI(prompt, apiKey, model) {
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("Groq API request timeout")), REQUEST_TIMEOUT_MS)
  );

  const fetchPromise = fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 2048,
      temperature: 0.7,
    }),
  });

  return Promise.race([fetchPromise, timeoutPromise]);
}

export async function POST(req) {
  const startTime = Date.now();
  const clientId = req.headers.get("x-forwarded-for") || req.headers.get("user-agent") || "unknown";

  try {
    // Rate limiting check (now async with KV support)
    const rateLimitStatus = await checkRateLimit(clientId, RATE_LIMIT_MAX_REQUESTS, RATE_LIMIT_WINDOW);
    
    if (!rateLimitStatus.allowed) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded. Please try again in a moment.",
          statusCode: 429,
          timestamp: new Date().toISOString(),
          retryAfter: rateLimitStatus.retryAfter,
        },
        { 
          status: 429,
          headers: {
            "Retry-After": rateLimitStatus.retryAfter.toString(),
          },
        }
      );
    }

    const requestBody = await req.json().catch(() => ({}));
    const { prompt } = requestBody;

    // Validate prompt
    let validatedPrompt;
    try {
      validatedPrompt = validatePrompt(prompt);
    } catch (validationError) {
      return NextResponse.json(
        {
          error: validationError.message,
          statusCode: 400,
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    const apiKey = process.env.GROQ_API_KEY;
    const model = process.env.GROQ_MODEL || "openai/gpt-oss-120b";

    // Verify API key
    if (!apiKey || apiKey.trim().length === 0) {
      console.error("Missing GROQ_API_KEY");
      return NextResponse.json(
        {
          error: "AI service is not properly configured",
          statusCode: 500,
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }

    // Call Groq API with timeout
    let groqResponse;
    try {
      groqResponse = await callGroqAPI(validatedPrompt, apiKey, model);
    } catch (timeoutError) {
      console.error("Groq API timeout:", timeoutError.message);
      return NextResponse.json(
        {
          error: "AI service request timed out. Please try again.",
          statusCode: 504,
          timestamp: new Date().toISOString(),
        },
        { status: 504 }
      );
    }

    // Parse response
    if (!groqResponse.ok) {
      let errorMessage = "AI service request failed";
      let statusCode = groqResponse.status || 500;

      try {
        const errorPayload = await groqResponse.json();
        errorMessage = errorPayload?.error?.message || errorMessage;
      } catch (e) {
        console.error("Failed to parse error response:", e);
      }

      console.error(`Groq API error (${statusCode}):`, errorMessage);

      return NextResponse.json(
        {
          error: errorMessage,
          statusCode,
          timestamp: new Date().toISOString(),
        },
        { status: statusCode }
      );
    }

    // Extract content from response
    let payload;
    try {
      payload = await groqResponse.json();
    } catch (parseError) {
      console.error("Failed to parse Groq response:", parseError);
      return NextResponse.json(
        {
          error: "Failed to parse AI service response",
          statusCode: 502,
          timestamp: new Date().toISOString(),
        },
        { status: 502 }
      );
    }

    const rawContent = payload?.choices?.[0]?.message?.content;
    const text = normalizeGroqContent(rawContent);

    if (!text || text.length === 0) {
      console.warn("Empty response from Groq API");
      return NextResponse.json(
        {
          error: "AI service returned an empty response",
          statusCode: 502,
          timestamp: new Date().toISOString(),
        },
        { status: 502 }
      );
    }

    // Successful response
    const duration = Date.now() - startTime;
    console.info(`AI chat request completed in ${duration}ms`);

    return NextResponse.json({
      text,
      statusCode: 200,
      timestamp: new Date().toISOString(),
      processingTime: `${duration}ms`,
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error("Unexpected error in AI chat route:", error, { duration });

    return NextResponse.json(
      {
        error: "An unexpected error occurred while processing your request",
        statusCode: 500,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
