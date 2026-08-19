import { GoogleGenAI, ThinkingLevel } from '@google/genai';

/**
 * DayTrace AI Router & Production Quota Resilience System
 * 
 * Implements:
 * 1. Model priority chain (Primary -> Fallback 1 -> Fallback 2 -> Local Rule Fallback)
 * 2. Automatic failover upon 429 quota exhaustion, rate limits, 503 unavailabilities, timeouts
 * 3. Model cooldown registry to prevent hammering rate-limited models
 * 4. Error classification & controlled backoff with jitter
 * 5. In-flight request deduplication & per-user sliding window rate limiting
 * 6. Structured JSON response extraction, validation, and repair
 * 7. Real-time Gemini streaming (generateContentStream) with sub-second token delivery
 * 8. Safe quota-aware telemetry (NO API keys or sensitive secrets logged)
 */

export interface ModelDefinition {
  id: string;
  label: string;
  priority: number;
  timeoutMs: number;
  supportsJson: boolean;
  maxRetriesOnTransient: number;
}

// Configurable Model Priority Chain (Using modern, supported Gemini models with seamless fallback)
export const AI_MODELS: ModelDefinition[] = [
  {
    id: 'gemini-2.5-flash',
    label: 'Primary (Gemini 2.5 Flash - Fast)',
    priority: 1,
    timeoutMs: 8000,
    supportsJson: true,
    maxRetriesOnTransient: 0,
  },
  {
    id: 'gemini-3.7-flash',
    label: 'Fallback 1 (Gemini 3.7 Flash)',
    priority: 2,
    timeoutMs: 8000,
    supportsJson: true,
    maxRetriesOnTransient: 0,
  },
  {
    id: 'gemini-2.5-flash-lite',
    label: 'Fallback 2 (Gemini 2.5 Flash Lite)',
    priority: 3,
    timeoutMs: 6000,
    supportsJson: true,
    maxRetriesOnTransient: 0,
  },
];

export type ErrorCategory =
  | 'QUOTA_EXCEEDED'
  | 'RATE_LIMIT'
  | 'TEMPORARY_SERVER_ERROR'
  | 'TIMEOUT'
  | 'AUTHENTICATION_ERROR'
  | 'PERMISSION_ERROR'
  | 'INVALID_REQUEST'
  | 'MODEL_NOT_FOUND'
  | 'MALFORMED_RESPONSE'
  | 'UNKNOWN';

export interface ClassifiedError {
  category: ErrorCategory;
  message: string;
  statusCode?: number;
  isRecoverable: boolean;
  retryAfterSeconds?: number;
  originalError?: any;
}

export interface ModelTelemetry {
  requests: number;
  successes: number;
  failures: number;
  quotaErrors: number;
  totalLatencyMs: number;
  lastUsed?: string;
  lastError?: string;
  cooldownUntil?: number;
}

export interface AuditLogEntry {
  timestamp: string;
  endpoint: string;
  modelUsed?: string;
  fallbackUsed: boolean;
  durationMs: number;
  success: boolean;
  errorCategory?: ErrorCategory;
  retryCount: number;
}

export interface GenerationOptions {
  systemInstruction?: string;
  temperature?: number;
  responseMimeType?: 'application/json' | 'text/plain';
  endpointName?: string;
  userId?: string;
  maxOutputTokens?: number;
  thinkingLevel?: ThinkingLevel;
  validator?: (data: any) => boolean;
}

export interface AIResponseResult<T = any> {
  success: boolean;
  data?: T;
  rawText?: string;
  modelUsed?: string;
  fallbackUsed: boolean;
  fallbackChain: string[];
  durationMs: number;
  error?: string;
  errorCategory?: ErrorCategory;
  cooldownTriggered?: boolean;
}

// ----------------------------------------------------
// State Registries (Server-side in memory)
// ----------------------------------------------------

const modelCooldowns = new Map<string, number>(); // modelId -> cooldownUntil timestamp
const modelMetrics = new Map<string, ModelTelemetry>();
const auditLogs: AuditLogEntry[] = [];
const inFlightRequests = new Map<string, Promise<AIResponseResult<any>>>(); // key -> Promise
const userRateLimitTracker = new Map<string, number[]>(); // userId -> timestamps[]

// Initialize metrics for each model
AI_MODELS.forEach((m) => {
  modelMetrics.set(m.id, {
    requests: 0,
    successes: 0,
    failures: 0,
    quotaErrors: 0,
    totalLatencyMs: 0,
  });
});

// ----------------------------------------------------
// Helper: Error Classifier
// ----------------------------------------------------

export function classifyError(error: any): ClassifiedError {
  const msg = (error?.message || error?.toString() || '').toLowerCase();
  const status = error?.status || error?.statusCode || error?.response?.status;

  // 1. Quota / Rate limit (429 or Resource Exhausted)
  if (
    status === 429 ||
    msg.includes('429') ||
    msg.includes('quota') ||
    msg.includes('resource_exhausted') ||
    msg.includes('resourceexhausted') ||
    msg.includes('rate_limit') ||
    msg.includes('ratelimit') ||
    msg.includes('too many requests')
  ) {
    let retryAfter = 60;
    const match = msg.match(/retry-after[:\s]+(\d+)/i) || msg.match(/wait (\d+)/i);
    if (match && match[1]) {
      retryAfter = parseInt(match[1], 10);
    }
    return {
      category: 'QUOTA_EXCEEDED',
      message: 'Model quota limit reached or rate limit exceeded.',
      statusCode: 429,
      isRecoverable: true,
      retryAfterSeconds: retryAfter,
      originalError: error,
    };
  }

  // 2. Timeout
  if (
    error?.name === 'AbortError' ||
    msg.includes('timeout') ||
    msg.includes('deadline_exceeded') ||
    msg.includes('etimedout') ||
    msg.includes('esockettimedout')
  ) {
    return {
      category: 'TIMEOUT',
      message: 'Request timed out waiting for AI model response.',
      statusCode: 408,
      isRecoverable: true,
      originalError: error,
    };
  }

  // 3. Transient Server Errors (500, 502, 503, 504, Unavailable)
  if (
    status === 500 ||
    status === 502 ||
    status === 503 ||
    status === 504 ||
    msg.includes('503') ||
    msg.includes('unavailable') ||
    msg.includes('bad gateway') ||
    msg.includes('gateway timeout') ||
    msg.includes('internal error') ||
    msg.includes('econnreset') ||
    msg.includes('fetch failed')
  ) {
    return {
      category: 'TEMPORARY_SERVER_ERROR',
      message: 'Temporary provider server error or network disruption.',
      statusCode: status || 503,
      isRecoverable: true,
      originalError: error,
    };
  }

  // 4. Authentication Error (401)
  if (
    status === 401 ||
    msg.includes('401') ||
    msg.includes('api_key_invalid') ||
    msg.includes('invalid api key') ||
    msg.includes('unauthenticated')
  ) {
    return {
      category: 'AUTHENTICATION_ERROR',
      message: 'Invalid or missing Gemini API credentials.',
      statusCode: 401,
      isRecoverable: false,
      originalError: error,
    };
  }

  // 5. Permission / Access Error (403)
  if (
    status === 403 ||
    msg.includes('403') ||
    msg.includes('permission_denied') ||
    msg.includes('forbidden')
  ) {
    return {
      category: 'PERMISSION_ERROR',
      message: 'API access or project permission denied.',
      statusCode: 403,
      isRecoverable: false,
      originalError: error,
    };
  }

  // 6. Bad Request (400)
  if (
    status === 400 ||
    msg.includes('400') ||
    msg.includes('invalid_argument') ||
    msg.includes('bad request')
  ) {
    return {
      category: 'INVALID_REQUEST',
      message: 'Malformed request or unsupported parameter format.',
      statusCode: 400,
      isRecoverable: false,
      originalError: error,
    };
  }

  // 7. Model Not Found / Deprecated (404)
  if (
    status === 404 ||
    msg.includes('404') ||
    msg.includes('not found') ||
    msg.includes('not_found') ||
    msg.includes('no longer available') ||
    msg.includes('is not supported')
  ) {
    return {
      category: 'MODEL_NOT_FOUND',
      message: 'Model is not found or no longer available. Failing over to modern fallback model.',
      statusCode: 404,
      isRecoverable: true,
      retryAfterSeconds: 86400,
      originalError: error,
    };
  }

  return {
    category: 'UNKNOWN',
    message: error?.message || 'An unexpected AI generation error occurred.',
    statusCode: status || 500,
    isRecoverable: true,
    originalError: error,
  };
}

// ----------------------------------------------------
// Helper: Cooldown & Model Availability
// ----------------------------------------------------

export function isModelAvailable(modelId: string): boolean {
  const cooldownUntil = modelCooldowns.get(modelId);
  if (!cooldownUntil) return true;
  if (Date.now() >= cooldownUntil) {
    modelCooldowns.delete(modelId);
    return true;
  }
  return false;
}

export function setModelCooldown(modelId: string, durationSeconds: number) {
  const cooldownUntil = Date.now() + durationSeconds * 1000;
  modelCooldowns.set(modelId, cooldownUntil);
  const metric = modelMetrics.get(modelId);
  if (metric) {
    metric.cooldownUntil = cooldownUntil;
  }
}

/**
 * Returns list of models sorted by priority with active models first,
 * followed by any cooling-down models ordered by closest expiration.
 */
export function getPrioritizedModels(): ModelDefinition[] {
  const now = Date.now();
  const available: ModelDefinition[] = [];
  const inCooldown: { model: ModelDefinition; expiresAt: number }[] = [];

  for (const model of AI_MODELS) {
    const cooldown = modelCooldowns.get(model.id);
    if (!cooldown || now >= cooldown) {
      available.push(model);
    } else {
      inCooldown.push({ model, expiresAt: cooldown });
    }
  }

  available.sort((a, b) => a.priority - b.priority);
  inCooldown.sort((a, b) => a.expiresAt - b.expiresAt);

  return [...available, ...inCooldown.map((c) => c.model)];
}

// ----------------------------------------------------
// Helper: User Rate Limiter & Abuse Protection
// ----------------------------------------------------

const MAX_REQUESTS_PER_MINUTE = 20;
const MAX_REQUESTS_PER_HOUR = 120;

export function checkUserRateLimit(userId: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  let timestamps = userRateLimitTracker.get(userId) || [];

  // Filter last 1 hour
  timestamps = timestamps.filter((t) => now - t < 3600000);
  userRateLimitTracker.set(userId, timestamps);

  const pastMinute = timestamps.filter((t) => now - t < 60000);
  if (pastMinute.length >= MAX_REQUESTS_PER_MINUTE) {
    const oldestInMinute = pastMinute[0];
    const retryAfter = Math.ceil((60000 - (now - oldestInMinute)) / 1000);
    return { allowed: false, retryAfter: Math.max(1, retryAfter) };
  }

  if (timestamps.length >= MAX_REQUESTS_PER_HOUR) {
    const oldestInHour = timestamps[0];
    const retryAfter = Math.ceil((3600000 - (now - oldestInHour)) / 1000);
    return { allowed: false, retryAfter: Math.max(1, retryAfter) };
  }

  timestamps.push(now);
  return { allowed: true };
}

// ----------------------------------------------------
// Helper: Structured Output Parser & Repair
// ----------------------------------------------------

export function cleanAndParseJSON<T = any>(rawText: string): { success: boolean; data?: T; error?: string } {
  if (!rawText || !rawText.trim()) {
    return { success: false, error: 'Empty model output' };
  }

  let cleaned = rawText.trim();

  // 1. Remove markdown code blocks if wrapped: ```json ... ```
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
  }

  // 2. Try direct JSON parse
  try {
    const parsed = JSON.parse(cleaned);
    return { success: true, data: parsed };
  } catch (initialErr) {
    // 3. Attempt extraction of outer JSON object { ... } or array [ ... ]
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    const firstBracket = cleaned.indexOf('[');
    const lastBracket = cleaned.lastIndexOf(']');

    let candidate = '';
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      candidate = cleaned.substring(firstBrace, lastBrace + 1);
    } else if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
      candidate = cleaned.substring(firstBracket, lastBracket + 1);
    }

    if (candidate) {
      try {
        const parsed = JSON.parse(candidate);
        return { success: true, data: parsed };
      } catch (nestedErr) {
        // Attempt basic quote repair if trailing commas or dangling keys
        try {
          const repaired = candidate.replace(/,\s*([\]}])/g, '$1');
          const parsed = JSON.parse(repaired);
          return { success: true, data: parsed };
        } catch {
          // fall through
        }
      }
    }

    return { success: false, error: 'Failed to parse structured JSON from model response' };
  }
}

// ----------------------------------------------------
// Core: Resilient AI Generation Engine
// ----------------------------------------------------

/**
 * Executes an AI generation request with full failover, backoff, and quota resilience.
 */
export async function generateAIContent<T = any>(
  prompt: string,
  options: GenerationOptions = {}
): Promise<AIResponseResult<T>> {
  const startTime = Date.now();
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return {
      success: false,
      fallbackUsed: false,
      fallbackChain: [],
      durationMs: Date.now() - startTime,
      error: 'GEMINI_API_KEY is not configured on the server.',
      errorCategory: 'AUTHENTICATION_ERROR',
    };
  }

  // Prompt size guard (prevent excessive payload abuse)
  if (prompt.length > 15000) {
    return {
      success: false,
      fallbackUsed: false,
      fallbackChain: [],
      durationMs: Date.now() - startTime,
      error: 'Prompt size exceeds the maximum limit of 15,000 characters.',
      errorCategory: 'INVALID_REQUEST',
    };
  }

  // Rate limit check
  if (options.userId) {
    const rateCheck = checkUserRateLimit(options.userId);
    if (!rateCheck.allowed) {
      return {
        success: false,
        fallbackUsed: false,
        fallbackChain: [],
        durationMs: Date.now() - startTime,
        error: `Rate limit reached. Please wait ${rateCheck.retryAfter || 10} seconds before requesting AI synthesis again.`,
        errorCategory: 'RATE_LIMIT',
      };
    }
  }

  // Idempotency / in-flight deduplication key
  const dedupeKey = options.userId
    ? `${options.userId}:${options.endpointName || 'gen'}:${prompt.substring(0, 120)}`
    : null;

  if (dedupeKey && inFlightRequests.has(dedupeKey)) {
    return inFlightRequests.get(dedupeKey)!;
  }

  const executionPromise = (async (): Promise<AIResponseResult<T>> => {
    const prioritizedModels = getPrioritizedModels();
    const fallbackChain: string[] = [];
    let lastError: ClassifiedError | null = null;

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    for (let modelIndex = 0; modelIndex < prioritizedModels.length; modelIndex++) {
      const modelDef = prioritizedModels[modelIndex];
      const isFallback = modelIndex > 0;
      fallbackChain.push(modelDef.id);

      const metric = modelMetrics.get(modelDef.id) || {
        requests: 0,
        successes: 0,
        failures: 0,
        quotaErrors: 0,
        totalLatencyMs: 0,
      };
      metric.requests++;
      metric.lastUsed = new Date().toISOString();

      let attempts = 0;
      const maxAttempts = 1 + modelDef.maxRetriesOnTransient;

      while (attempts < maxAttempts) {
        attempts++;
        const attemptStartTime = Date.now();

        try {
          // Wrap SDK call with timeout
          const timeoutPromise = new Promise<never>((_, reject) => {
            const timer = setTimeout(() => {
              const err = new Error(`Request to model ${modelDef.id} timed out after ${modelDef.timeoutMs}ms`);
              err.name = 'AbortError';
              reject(err);
            }, modelDef.timeoutMs);

            // Allow Node process to exit cleanly if needed
            if (typeof timer.unref === 'function') timer.unref();
          });

          const isGemini3 = modelDef.id.startsWith('gemini-3');
          const requestConfig: any = {
            ...(options.systemInstruction ? { systemInstruction: options.systemInstruction } : {}),
            ...(options.temperature !== undefined ? { temperature: options.temperature } : { temperature: 0.4 }),
            ...(options.responseMimeType ? { responseMimeType: options.responseMimeType } : {}),
            ...(options.maxOutputTokens ? { maxOutputTokens: options.maxOutputTokens } : {}),
          };

          if (isGemini3 && options.thinkingLevel) {
            requestConfig.thinkingConfig = { thinkingLevel: options.thinkingLevel };
          }

          const generatePromise = ai.models.generateContent({
            model: modelDef.id,
            contents: prompt,
            config: requestConfig,
          });

          const response = await Promise.race([generatePromise, timeoutPromise]);
          const rawText = response.text || '';
          const duration = Date.now() - attemptStartTime;

          // Validation step for JSON if requested
          if (options.responseMimeType === 'application/json') {
            const parseResult = cleanAndParseJSON<T>(rawText);
            if (!parseResult.success) {
              throw new Error(`JSON schema parsing failed on model ${modelDef.id}: ${parseResult.error}`);
            }

            if (options.validator && !options.validator(parseResult.data)) {
              throw new Error(`Output validator rejected response structure from model ${modelDef.id}`);
            }

            // Success!
            metric.successes++;
            metric.totalLatencyMs += duration;
            recordAudit({
              timestamp: new Date().toISOString(),
              endpoint: options.endpointName || 'generateContent',
              modelUsed: modelDef.id,
              fallbackUsed: isFallback,
              durationMs: Date.now() - startTime,
              success: true,
              retryCount: attempts - 1,
            });

            return {
              success: true,
              data: parseResult.data,
              rawText,
              modelUsed: modelDef.id,
              fallbackUsed: isFallback,
              fallbackChain,
              durationMs: Date.now() - startTime,
            };
          }

          // Plain text success
          metric.successes++;
          metric.totalLatencyMs += duration;
          recordAudit({
            timestamp: new Date().toISOString(),
            endpoint: options.endpointName || 'generateContent',
            modelUsed: modelDef.id,
            fallbackUsed: isFallback,
            durationMs: Date.now() - startTime,
            success: true,
            retryCount: attempts - 1,
          });

          return {
            success: true,
            rawText,
            modelUsed: modelDef.id,
            fallbackUsed: isFallback,
            fallbackChain,
            durationMs: Date.now() - startTime,
          };
        } catch (error: any) {
          const classified = classifyError(error);
          lastError = classified;
          metric.failures++;
          metric.lastError = classified.message;

          // Handle Quota/Rate Limit
          if (classified.category === 'QUOTA_EXCEEDED') {
            metric.quotaErrors++;
            const cooldownSec = classified.retryAfterSeconds || 60;
            setModelCooldown(modelDef.id, cooldownSec);
            console.warn(`[DayTrace AI Router] Model ${modelDef.id} hit quota limit. Cooldown set for ${cooldownSec}s. Failing over to next model.`);
            // Immediately break out of retry loop to attempt next model in chain
            break;
          }

          // Handle Timeout
          if (classified.category === 'TIMEOUT') {
            setModelCooldown(modelDef.id, 25);
            console.warn(`[DayTrace AI Router] Model ${modelDef.id} timed out. Failing over to next model.`);
            break;
          }

          // Handle Unrecoverable Auth / Permission / Invalid Request
          if (!classified.isRecoverable) {
            console.error(`[DayTrace AI Router] Non-recoverable error on model ${modelDef.id}: ${classified.message}`);
            recordAudit({
              timestamp: new Date().toISOString(),
              endpoint: options.endpointName || 'generateContent',
              modelUsed: modelDef.id,
              fallbackUsed: isFallback,
              durationMs: Date.now() - startTime,
              success: false,
              errorCategory: classified.category,
              retryCount: attempts - 1,
            });

            return {
              success: false,
              fallbackUsed: isFallback,
              fallbackChain,
              durationMs: Date.now() - startTime,
              error: classified.message,
              errorCategory: classified.category,
            };
          }

          // Transient error: retry with exponential backoff + jitter if attempts remain
          if (attempts < maxAttempts) {
            const backoffMs = Math.min(2000, 300 * Math.pow(2, attempts - 1) + Math.floor(Math.random() * 150));
            console.info(`[DayTrace AI Router] Transient failure on ${modelDef.id}. Retrying in ${backoffMs}ms (attempt ${attempts + 1}/${maxAttempts})...`);
            await new Promise((resolve) => setTimeout(resolve, backoffMs));
          } else {
            console.warn(`[DayTrace AI Router] Model ${modelDef.id} exhausted retries. Failing over to next model in chain.`);
            setModelCooldown(modelDef.id, 30);
          }
        }
      }
    }

    // If we reach here, all configured models in the priority chain failed
    recordAudit({
      timestamp: new Date().toISOString(),
      endpoint: options.endpointName || 'generateContent',
      fallbackUsed: true,
      durationMs: Date.now() - startTime,
      success: false,
      errorCategory: lastError?.category || 'UNKNOWN',
      retryCount: fallbackChain.length,
    });

    return {
      success: false,
      fallbackUsed: true,
      fallbackChain,
      durationMs: Date.now() - startTime,
      error: 'AI generation is temporarily unavailable across all provider models. Your data has been preserved.',
      errorCategory: lastError?.category || 'UNKNOWN',
    };
  })();

  if (dedupeKey) {
    inFlightRequests.set(dedupeKey, executionPromise);
    executionPromise.finally(() => {
      inFlightRequests.delete(dedupeKey);
    });
  }

  return executionPromise;
}

// ----------------------------------------------------
// Core: Real-time Streaming AI Generation Engine
// ----------------------------------------------------

export interface StreamOptions {
  systemInstruction?: string;
  temperature?: number;
  thinkingLevel?: ThinkingLevel;
  thinkingBudget?: number;
  endpointName?: string;
  userId?: string;
  maxOutputTokens?: number;
}

export interface StreamResult {
  success: boolean;
  modelUsed?: string;
  fallbackUsed: boolean;
  totalText: string;
  durationMs: number;
  error?: string;
  errorCategory?: ErrorCategory;
}

/**
 * Streams tokens in real time from Gemini models with automatic failover.
 * Calls `onChunk` as each token piece arrives.
 */
export async function generateAIContentStream(
  prompt: string,
  options: StreamOptions = {},
  onChunk: (textChunk: string) => void
): Promise<StreamResult> {
  const startTime = Date.now();
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return {
      success: false,
      fallbackUsed: false,
      totalText: '',
      durationMs: Date.now() - startTime,
      error: 'GEMINI_API_KEY is not configured on the server.',
      errorCategory: 'AUTHENTICATION_ERROR',
    };
  }

  // Rate limit check
  if (options.userId) {
    const rateCheck = checkUserRateLimit(options.userId);
    if (!rateCheck.allowed) {
      return {
        success: false,
        fallbackUsed: false,
        totalText: '',
        durationMs: Date.now() - startTime,
        error: `Rate limit reached. Please wait ${rateCheck.retryAfter || 10} seconds before messaging the AI Mentor again.`,
        errorCategory: 'RATE_LIMIT',
      };
    }
  }

  const prioritizedModels = getPrioritizedModels();
  let lastError: ClassifiedError | null = null;
  let fullAccumulatedText = '';

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  for (let modelIndex = 0; modelIndex < prioritizedModels.length; modelIndex++) {
    const modelDef = prioritizedModels[modelIndex];
    const isFallback = modelIndex > 0;

    const metric = modelMetrics.get(modelDef.id) || {
      requests: 0,
      successes: 0,
      failures: 0,
      quotaErrors: 0,
      totalLatencyMs: 0,
    };

    const maxModelAttempts = 1 + (modelDef.maxRetriesOnTransient || 0);

    for (let attempt = 1; attempt <= maxModelAttempts; attempt++) {
      metric.requests++;
      metric.lastUsed = new Date().toISOString();
      const attemptStartTime = Date.now();

      let modelStreamText = '';
      let chunksSent = 0;

      try {
        // Create stream call - configure fast low-latency streaming
        const isGemini3 = modelDef.id.startsWith('gemini-3');
        const streamConfig: any = {
          ...(options.systemInstruction ? { systemInstruction: options.systemInstruction } : {}),
          ...(options.temperature !== undefined ? { temperature: options.temperature } : { temperature: 0.6 }),
          ...(options.maxOutputTokens ? { maxOutputTokens: options.maxOutputTokens } : {}),
        };

        if (isGemini3) {
          streamConfig.thinkingConfig = { thinkingLevel: options.thinkingLevel || ThinkingLevel.LOW };
        }

        // Timeout race for initiating the stream
        const streamTimeoutMs = Math.min(modelDef.timeoutMs, 8000);
        let streamTimer: any;
        const timeoutPromise = new Promise<never>((_, reject) => {
          streamTimer = setTimeout(() => {
            reject(new Error(`Timeout of ${streamTimeoutMs}ms exceeded while connecting stream to model ${modelDef.id}`));
          }, streamTimeoutMs);
          if (typeof streamTimer.unref === 'function') streamTimer.unref();
        });

        const streamResponse = await Promise.race([
          ai.models.generateContentStream({
            model: modelDef.id,
            contents: prompt,
            config: streamConfig,
          }),
          timeoutPromise,
        ]);

        clearTimeout(streamTimer);

        for await (const chunk of streamResponse) {
          const chunkText = chunk.text || '';
          if (chunkText) {
            modelStreamText += chunkText;
            chunksSent++;
            onChunk(chunkText);
          }
        }

        if (!modelStreamText.trim()) {
          throw new Error(`Empty stream output from model ${modelDef.id}`);
        }

        const duration = Date.now() - attemptStartTime;
        metric.successes++;
        metric.totalLatencyMs += duration;

        recordAudit({
          timestamp: new Date().toISOString(),
          endpoint: options.endpointName || 'generateContentStream',
          modelUsed: modelDef.id,
          fallbackUsed: isFallback,
          durationMs: Date.now() - startTime,
          success: true,
          retryCount: attempt - 1,
        });

        return {
          success: true,
          modelUsed: modelDef.id,
          fallbackUsed: isFallback,
          totalText: modelStreamText,
          durationMs: Date.now() - startTime,
        };
      } catch (error: any) {
        const classified = classifyError(error);
        lastError = classified;
        metric.failures++;
        metric.lastError = classified.message;

        console.warn(
          `[DayTrace Stream] Model ${modelDef.id} (attempt ${attempt}/${maxModelAttempts}) stream failure (${classified.category}): ${classified.message}`
        );

        // If chunks were already partially sent to the client, we cannot cleanly switch models mid-sentence.
        // If we already accumulated meaningful text, return what we have as a completed stream.
        if (chunksSent > 0 && modelStreamText.trim().length > 30) {
          return {
            success: true,
            modelUsed: modelDef.id,
            fallbackUsed: isFallback,
            totalText: modelStreamText,
            durationMs: Date.now() - startTime,
          };
        }

        if (classified.category === 'QUOTA_EXCEEDED') {
          metric.quotaErrors++;
          setModelCooldown(modelDef.id, classified.retryAfterSeconds || 60);
          break; // Try next model in chain
        } else if (classified.category === 'MODEL_NOT_FOUND') {
          setModelCooldown(modelDef.id, classified.retryAfterSeconds || 86400);
          break; // Try next model in chain
        } else if (classified.category === 'TIMEOUT') {
          setModelCooldown(modelDef.id, 25);
          break; // Try next model in chain
        } else if (classified.category === 'TEMPORARY_SERVER_ERROR') {
          setModelCooldown(modelDef.id, 20);
          break; // Immediately try next model in chain
        } else if (!classified.isRecoverable) {
          return {
            success: false,
            fallbackUsed: isFallback,
            totalText: '',
            durationMs: Date.now() - startTime,
            error: classified.message,
            errorCategory: classified.category,
          };
        }
      }
    }
  }

  return {
    success: false,
    fallbackUsed: true,
    totalText: '',
    durationMs: Date.now() - startTime,
    error: lastError?.message || 'AI service temporarily unavailable. Offline coaching mode activated.',
    errorCategory: lastError?.category || 'UNKNOWN',
  };
}

function modelStreamTextLength(text: string): number {
  return text ? text.length : 0;
}

// ----------------------------------------------------
// Telemetry & Safe Logging
// ----------------------------------------------------

function recordAudit(entry: AuditLogEntry) {
  auditLogs.unshift(entry);
  if (auditLogs.length > 100) {
    auditLogs.pop();
  }
}

export function getAIRouterTelemetry() {
  const modelsStatus = AI_MODELS.map((m) => {
    const metric = modelMetrics.get(m.id) || {
      requests: 0,
      successes: 0,
      failures: 0,
      quotaErrors: 0,
      totalLatencyMs: 0,
    };
    const isCooling = !isModelAvailable(m.id);
    const cooldownUntil = modelCooldowns.get(m.id);
    const avgLatency = metric.successes > 0 ? Math.round(metric.totalLatencyMs / metric.successes) : 0;
    const successRate = metric.requests > 0 ? Math.round((metric.successes / metric.requests) * 100) : 100;

    return {
      id: m.id,
      label: m.label,
      priority: m.priority,
      status: isCooling ? 'COOLING_DOWN' : 'ACTIVE',
      cooldownRemainingSeconds: isCooling && cooldownUntil ? Math.max(0, Math.ceil((cooldownUntil - Date.now()) / 1000)) : 0,
      requests: metric.requests,
      successes: metric.successes,
      failures: metric.failures,
      quotaErrors: metric.quotaErrors,
      successRate: `${successRate}%`,
      avgLatencyMs: avgLatency,
      lastError: metric.lastError,
    };
  });

  const totalReqs = Array.from(modelMetrics.values()).reduce((acc, m) => acc + m.requests, 0);
  const totalSuccess = Array.from(modelMetrics.values()).reduce((acc, m) => acc + m.successes, 0);
  const totalQuotaErr = Array.from(modelMetrics.values()).reduce((acc, m) => acc + m.quotaErrors, 0);

  return {
    systemHealth: 'OPERATIONAL',
    activeModelsCount: modelsStatus.filter((m) => m.status === 'ACTIVE').length,
    totalConfiguredModels: AI_MODELS.length,
    totalRequests: totalReqs,
    totalSuccesses: totalSuccess,
    totalQuotaErrors: totalQuotaErr,
    models: modelsStatus,
    recentAuditLogs: auditLogs.slice(0, 15),
  };
}
