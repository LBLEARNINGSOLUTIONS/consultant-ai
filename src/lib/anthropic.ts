import Anthropic from '@anthropic-ai/sdk';

const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;

if (!apiKey) {
  throw new Error('Missing Anthropic API key. Please check your .env file.');
}

export const anthropic = new Anthropic({
  apiKey,
  // For browser usage, you may need to use a proxy or backend service
  // to avoid CORS issues. This setup assumes you're making requests from a server
  // or have configured CORS appropriately.
  dangerouslyAllowBrowser: true // Only for development/testing
});

// Export model configurations
export const CLAUDE_MODELS = {
  SONNET: 'claude-sonnet-4-5-20250929',
  OPUS: 'claude-3-opus-20240229',
  HAIKU: 'claude-3-5-haiku-20241022'
} as const;

export const DEFAULT_MODEL = CLAUDE_MODELS.SONNET;
export const MAX_TOKENS = 4096;
export const DEFAULT_TEMPERATURE = 0.3;
