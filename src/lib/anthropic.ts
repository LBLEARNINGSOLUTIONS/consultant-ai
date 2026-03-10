import { supabase } from './supabase';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

/**
 * Call the Anthropic API via Supabase Edge Function (server-side proxy).
 * The API key never leaves the server.
 */
export async function callAnalyzeFunction(params: {
  transcript: string;
  systemPrompt?: string;
  type?: 'analyze' | 'executive-summary';
}): Promise<{ content: Array<{ type: string; text: string }>; usage: { input_tokens: number; output_tokens: number } }> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error('Not authenticated. Please sign in.');
  }

  const response = await fetch(`${SUPABASE_URL}/functions/v1/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({
      transcript: params.transcript,
      systemPrompt: params.systemPrompt,
      type: params.type || 'analyze',
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
    throw new Error(errorData.error || `Edge function error: ${response.status}`);
  }

  return response.json();
}
