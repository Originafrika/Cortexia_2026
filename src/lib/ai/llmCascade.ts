// LLM Cascade Service - CocoBoard LLM fallback chain
// Order: Cloudflare → Groq → Nvidia → Kie AI
// Used ONLY for CocoBoard text generation (NOT image/video)

import { Redis } from '@upstash/redis';

// Environment detection - works in both browser (Vite) and Node.js
const getEnv = (key: string): string | undefined => {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env[key];
  }
  if (typeof process !== 'undefined' && process.env) {
    // Convert VITE_ prefix to non-VITE for Node
    const nodeKey = key.replace(/^VITE_/, '');
    return process.env[key] || process.env[nodeKey];
  }
  return undefined;
};

const redis = new Redis({
  url: getEnv('VITE_UPSTASH_REDIS_REST_URL') || '',
  token: getEnv('VITE_UPSTASH_REDIS_REST_TOKEN') || '',
});

// LLM Provider configurations
export const LLM_PROVIDERS = {
  cloudflare: {
    name: 'cloudflare',
    priority: 1,
    models: {
      fast: '@cf/meta/llama-2-7b-chat-int8',
      smart: '@cf/meta/llama-3-8b-instruct',
    },
    freeNeuronsPerDay: 10000,
    costPer1MInput: 0.27,
    costPer1MOutput: 0.85,
  },
  groq: {
    name: 'groq',
    priority: 2,
    models: {
      fast: 'llama-3.1-8b-instant',
      smart: 'llama-3.3-70b-versatile',
      best: 'moonshotai/kimi-k2-instruct',
      code: 'qwen/qwen3-32b',
    },
    freeRPD: {
      'llama-3.1-8b-instant': 14400,
      'llama-3.3-70b-versatile': 1000,
      'moonshotai/kimi-k2-instruct': 1000,
      'qwen/qwen3-32b': 1000,
    },
    isFree: true,
  },
  nvidia: {
    name: 'nvidia',
    priority: 3,
    models: {
      fast: 'meta/llama-3.1-8b-instruct',
      smart: 'meta/llama-4-scout-17b-16e-instruct',
    },
    baseUrl: 'https://integrate.api.nvidia.com/v1',
    isFree: true,
  },
  kie: {
    name: 'kie',
    priority: 4,
    models: {
      fast: 'gemini-2.5-flash-openai',
      smart: 'gemini-3-flash-openai',
    },
    costPerRequest: 1, // 1 credit per request
    isPaid: true,
  },
} as const;

export type LLMProvider = keyof typeof LLM_PROVIDERS;

export interface LLMRequest {
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
  maxTokens?: number;
  modelPreference?: 'fast' | 'smart';
}

export interface LLMResponse {
  success: boolean;
  content?: string;
  provider: LLMProvider;
  model: string;
  cost?: number;
  error?: string;
  retryable?: boolean;
}

export interface CascadeResult {
  success: boolean;
  response?: LLMResponse;
  attempts: { provider: LLMProvider; success: boolean; error?: string }[];
  totalCost: number;
}

// Rate limit tracking keys
const getRateLimitKey = (provider: string, model: string) => `llm:ratelimit:${provider}:${model}`;
const getDailyUsageKey = (provider: string) => `llm:daily:${provider}:${new Date().toISOString().split('T')[0]}`;

class LLMCascadeService {
  private async checkCloudflareBudget(): Promise<boolean> {
    const today = new Date().toISOString().split('T')[0];
    const key = `cloudflare:neurons:${today}`;
    const used = await redis.get(key) as number || 0;
    return used < LLM_PROVIDERS.cloudflare.freeNeuronsPerDay;
  }

  private async incrementCloudflareUsage(neurons: number): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    const key = `cloudflare:neurons:${today}`;
    await redis.incrby(key, neurons);
    await redis.expire(key, 86400); // 24h
  }

  private async checkGroqRateLimit(model: string): Promise<boolean> {
    const key = getRateLimitKey('groq', model);
    const today = new Date().toISOString().split('T')[0];
    const usage = await redis.hget(key, today) as number || 0;
    const limit = LLM_PROVIDERS.groq.freeRPD[model as keyof typeof LLM_PROVIDERS.groq.freeRPD] || 1000;
    return usage < limit;
  }

  private async incrementGroqUsage(model: string): Promise<void> {
    const key = getRateLimitKey('groq', model);
    const today = new Date().toISOString().split('T')[0];
    await redis.hincrby(key, today, 1);
    await redis.expire(key, 86400);
  }

  private async callCloudflare(request: LLMRequest): Promise<LLMResponse> {
    try {
      const hasBudget = await this.checkCloudflareBudget();
      if (!hasBudget) {
        return {
          success: false,
          provider: 'cloudflare',
          model: request.modelPreference || 'fast',
          error: 'Daily neuron budget exhausted',
          retryable: true,
        };
      }

      const accountId = getEnv('VITE_CF_ACCOUNT_ID') || getEnv('CF_ACCOUNT_ID');
      const apiToken = getEnv('VITE_CF_API_TOKEN') || getEnv('CF_API_TOKEN');
      const model = LLM_PROVIDERS.cloudflare.models[request.modelPreference || 'fast'];

      const response = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${model}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: [
              { role: 'system', content: request.systemPrompt },
              { role: 'user', content: request.userPrompt },
            ],
            temperature: request.temperature ?? 0.7,
            max_tokens: request.maxTokens ?? 4096,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.text();
        return {
          success: false,
          provider: 'cloudflare',
          model,
          error: `Cloudflare error: ${response.status} - ${error}`,
          retryable: response.status === 429 || response.status >= 500,
        };
      }

      const result = await response.json();
      
      // Estimate neuron usage (rough calculation)
      const inputTokens = request.systemPrompt.length / 4 + request.userPrompt.length / 4;
      const outputTokens = result.result?.response?.length / 4 || 0;
      const neurons = Math.ceil((inputTokens + outputTokens) * 0.01);
      await this.incrementCloudflareUsage(neurons);

      return {
        success: true,
        content: result.result?.response,
        provider: 'cloudflare',
        model,
        cost: neurons * LLM_PROVIDERS.cloudflare.costPer1MInput / 1000000,
      };
    } catch (error) {
      return {
        success: false,
        provider: 'cloudflare',
        model: request.modelPreference || 'fast',
        error: error instanceof Error ? error.message : 'Unknown error',
        retryable: true,
      };
    }
  }

  private async callGroq(request: LLMRequest): Promise<LLMResponse> {
    try {
      const model = LLM_PROVIDERS.groq.models[request.modelPreference || 'smart'];
      
      const hasBudget = await this.checkGroqRateLimit(model);
      if (!hasBudget) {
        return {
          success: false,
          provider: 'groq',
          model,
          error: 'Daily rate limit reached',
          retryable: true,
        };
      }

      const apiKey = getEnv('VITE_GROQ_API_KEY') || getEnv('GROQ_API_KEY');

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: request.systemPrompt },
            { role: 'user', content: request.userPrompt },
          ],
          temperature: request.temperature ?? 0.7,
          max_tokens: request.maxTokens ?? 4096,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        return {
          success: false,
          provider: 'groq',
          model,
          error: `Groq error: ${response.status} - ${error}`,
          retryable: response.status === 429 || response.status >= 500,
        };
      }

      const result = await response.json();
      await this.incrementGroqUsage(model);

      return {
        success: true,
        content: result.choices?.[0]?.message?.content,
        provider: 'groq',
        model,
        cost: 0, // Free tier
      };
    } catch (error) {
      return {
        success: false,
        provider: 'groq',
        model: request.modelPreference || 'smart',
        error: error instanceof Error ? error.message : 'Unknown error',
        retryable: true,
      };
    }
  }

  private async callNvidia(request: LLMRequest): Promise<LLMResponse> {
    try {
      const apiKey = getEnv('VITE_NVIDIA_API_KEY') || getEnv('NVIDIA_API_KEY');
      const model = LLM_PROVIDERS.nvidia.models[request.modelPreference || 'smart'];

      const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: `nvidia/${model}`,
          messages: [
            { role: 'system', content: request.systemPrompt },
            { role: 'user', content: request.userPrompt },
          ],
          temperature: request.temperature ?? 0.7,
          max_tokens: request.maxTokens ?? 4096,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        return {
          success: false,
          provider: 'nvidia',
          model,
          error: `Nvidia error: ${response.status} - ${error}`,
          retryable: response.status === 429 || response.status >= 500,
        };
      }

      const result = await response.json();

      return {
        success: true,
        content: result.choices?.[0]?.message?.content,
        provider: 'nvidia',
        model,
        cost: 0, // Free tier
      };
    } catch (error) {
      return {
        success: false,
        provider: 'nvidia',
        model: request.modelPreference || 'smart',
        error: error instanceof Error ? error.message : 'Unknown error',
        retryable: true,
      };
    }
  }

  private async callKie(request: LLMRequest): Promise<LLMResponse> {
    try {
      const apiKey = getEnv('VITE_KIE_API_KEY') || getEnv('KIE_API_KEY');
      const model = LLM_PROVIDERS.kie.models[request.modelPreference || 'smart'];

      const response = await fetch('https://api.kie.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: request.systemPrompt },
            { role: 'user', content: request.userPrompt },
          ],
          temperature: request.temperature ?? 0.7,
          max_tokens: request.maxTokens ?? 4096,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        return {
          success: false,
          provider: 'kie',
          model,
          error: `Kie AI error: ${response.status} - ${error}`,
          retryable: false, // Paid - don't retry on error
        };
      }

      const result = await response.json();

      return {
        success: true,
        content: result.choices?.[0]?.message?.content,
        provider: 'kie',
        model,
        cost: LLM_PROVIDERS.kie.costPerRequest,
      };
    } catch (error) {
      return {
        success: false,
        provider: 'kie',
        model: request.modelPreference || 'smart',
        error: error instanceof Error ? error.message : 'Unknown error',
        retryable: false,
      };
    }
  }

  /**
   * Call LLM with automatic fallback cascade
   * Order: Cloudflare → Groq → Nvidia → Kie AI
   */
  async callWithFallback(request: LLMRequest): Promise<CascadeResult> {
    const attempts: { provider: LLMProvider; success: boolean; error?: string }[] = [];
    let totalCost = 0;

    // Try Cloudflare first
    const cloudflareResult = await this.callCloudflare(request);
    attempts.push({ provider: 'cloudflare', success: cloudflareResult.success, error: cloudflareResult.error });
    if (cloudflareResult.success) {
      return {
        success: true,
        response: cloudflareResult,
        attempts,
        totalCost: cloudflareResult.cost || 0,
      };
    }

    // Fallback to Groq
    const groqResult = await this.callGroq(request);
    attempts.push({ provider: 'groq', success: groqResult.success, error: groqResult.error });
    if (groqResult.success) {
      return {
        success: true,
        response: groqResult,
        attempts,
        totalCost: 0,
      };
    }

    // Fallback to Nvidia
    const nvidiaResult = await this.callNvidia(request);
    attempts.push({ provider: 'nvidia', success: nvidiaResult.success, error: nvidiaResult.error });
    if (nvidiaResult.success) {
      return {
        success: true,
        response: nvidiaResult,
        attempts,
        totalCost: 0,
      };
    }

    // Last resort: Kie AI (paid)
    const kieResult = await this.callKie(request);
    attempts.push({ provider: 'kie', success: kieResult.success, error: kieResult.error });
    if (kieResult.success) {
      return {
        success: true,
        response: kieResult,
        attempts,
        totalCost: kieResult.cost || 0,
      };
    }

    // All failed
    return {
      success: false,
      attempts,
      totalCost,
    };
  }

  /**
   * Call specific provider (for explicit provider selection)
   */
  async callProvider(provider: LLMProvider, request: LLMRequest): Promise<LLMResponse> {
    switch (provider) {
      case 'cloudflare':
        return this.callCloudflare(request);
      case 'groq':
        return this.callGroq(request);
      case 'nvidia':
        return this.callNvidia(request);
      case 'kie':
        return this.callKie(request);
      default:
        return {
          success: false,
          provider,
          model: '',
          error: 'Unknown provider',
          retryable: false,
        };
    }
  }
}

export const llmCascade = new LLMCascadeService();
