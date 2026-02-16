/**
 * Claude API – blend two texts with different mixing modes.
 */

import type { BlendMode } from '@/constants/blend-modes';
import {
  ANTHROPIC_MESSAGES_URL,
  ANTHROPIC_VERSION,
  DEFAULT_MODEL,
} from '@/constants/anthropic';

import { trim } from '@/utils/trim';

export type { BlendMode } from '@/constants/blend-modes';

function getApiKey(): string {
  const key =
    typeof process !== 'undefined' &&
    process.env?.EXPO_PUBLIC_ANTHROPIC_API_KEY;
  if (!key) {
    throw new Error(
      'Missing EXPO_PUBLIC_ANTHROPIC_API_KEY. Set it in .env or app config.'
    );
  }
  return key;
}

function buildPrompt(mode: BlendMode, text1: string, text2: string): string {
  const t1 = trim(text1);
  const t2 = trim(text2);
  const textsBlock = `Text 1:\n${t1}\n\nText 2:\n${t2}`;

  switch (mode) {
    case 'style_transfer':
      return `You are a creative writing assistant. Rewrite the following "Text 1" in the exact style, tone, and voice of "Text 2". Keep the meaning and topic of Text 1, but express it as if Text 2's author wrote it. Be playful and surprising where it fits. Output only the rewritten text, no preamble or explanation.\n\n${textsBlock}`;
    case 'mashup':
      return `You are a creative writing assistant. Creatively combine these two texts into one coherent piece. Weave together ideas, phrases, and tone from both. The result should feel like a single blended work, not two separate parts. Output only the combined text, no preamble or explanation.\n\n${textsBlock}`;
    case 'debate':
      return `You are a creative writing assistant. Turn these two texts into a short dialogue between two perspectives. Each speaker should embody the ideas and tone of one text. Make it read like a real back-and-forth (e.g. "A: ..." / "B: ..." or similar). Output only the dialogue, no preamble or explanation.\n\n${textsBlock}`;
    case 'poetry':
      return `You are a creative writing assistant. Blend both texts into a short poem. Use imagery, ideas, or phrases from both. The poem can be any form (free verse, couplets, etc.) but keep it concise. Output only the poem, no preamble or explanation.\n\n${textsBlock}`;
    default:
      return buildPrompt('style_transfer', text1, text2);
  }
}

/**
 * Blend two texts using Claude with the chosen mode.
 * @param text1 - First text
 * @param text2 - Second text
 * @param options - mode, model, max_tokens
 * @returns Blended text
 */
export async function blendWithClaude(
  text1: string,
  text2: string,
  options?: { mode?: BlendMode; model?: string; max_tokens?: number }
): Promise<string> {
  const apiKey = getApiKey();
  const model = options?.model ?? DEFAULT_MODEL;
  const maxTokens = options?.max_tokens ?? 1024;
  const mode = options?.mode ?? 'style_transfer';
  const prompt = buildPrompt(mode, text1, text2);

  const response = await fetch(ANTHROPIC_MESSAGES_URL, {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': ANTHROPIC_VERSION,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      messages: [{ role: 'user' as const, content: prompt }],
    }),
  });

  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`Claude API failed (${response.status}): ${errBody}`);
  }

  const data = (await response.json()) as {
    content?: Array<{ type: string; text?: string }>;
  };
  const firstText =
    trim(data?.content?.find((b) => b.type === 'text')?.text) || '';
  return firstText || 'No response from Claude.';
}
