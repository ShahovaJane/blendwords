/**
 * ElevenLabs Speech-to-Text and Text-to-Speech API
 */

import * as FileSystem from 'expo-file-system/legacy';

import {
  DEFAULT_STT_MODEL,
  DEFAULT_TTS_MODEL_ID,
  DEFAULT_VOICE_ID,
  ELEVENLABS_STT_URL,
  ELEVENLABS_TTS_BASE,
} from '@/constants/elevenlabs';

import { trim } from '@/utils/trim';

function getApiKey(): string {
  const key = process.env.EXPO_PUBLIC_ELEVENLABS_API_KEY;
  if (!key) {
    throw new Error(
      'Missing EXPO_PUBLIC_ELEVENLABS_API_KEY. Set it in .env or app config.'
    );
  }
  return key;
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  if (typeof btoa !== 'undefined') {
    return btoa(binary);
  }
  const base64Chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let result = '';
  for (let i = 0; i < binary.length; i += 3) {
    const a = binary.charCodeAt(i);
    const b = i + 1 < binary.length ? binary.charCodeAt(i + 1) : 0;
    const c = i + 2 < binary.length ? binary.charCodeAt(i + 2) : 0;
    result +=
      base64Chars[a >> 2] +
      base64Chars[((a & 3) << 4) | (b >> 4)] +
      (i + 1 < binary.length ? base64Chars[((b & 15) << 2) | (c >> 6)] : '=') +
      (i + 2 < binary.length ? base64Chars[c & 63] : '=');
  }
  return result;
}

export type TranscribeResult = {
  text: string;
  language_code?: string;
};

/**
 * Transcribe an audio file (local URI) using ElevenLabs Speech-to-Text.
 * @param audioUri - Local file URI from recording (e.g. file:///...)
 * @param options - model_id, language_code
 * @returns Transcribed text result
 */
export async function transcribe(
  audioUri: string,
  options?: { model_id?: string; language_code?: string }
): Promise<TranscribeResult> {
  const apiKey = getApiKey();
  const modelId = options?.model_id ?? DEFAULT_STT_MODEL;

  const formData = new FormData();
  formData.append('model_id', modelId);
  if (options?.language_code) {
    formData.append('language_code', options.language_code);
  }

  const fileName = audioUri.split('/').pop() ?? 'recording.m4a';
  const mimeType = fileName.endsWith('.caf') ? 'audio/x-caf' : 'audio/mp4';
  formData.append('file', {
    uri: audioUri,
    type: mimeType,
    name: fileName,
  } as unknown as Blob);

  const response = await fetch(ELEVENLABS_STT_URL, {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
      Accept: 'application/json',
    },
    body: formData,
  });

  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`ElevenLabs STT failed (${response.status}): ${errBody}`);
  }

  const data = (await response.json()) as {
    text?: string;
    language_code?: string;
  };
  const text = trim(data?.text);
  return { text, language_code: data.language_code };
}

export type SpeakOptions = {
  voice_id?: string;
  model_id?: string;
};

/**
 * Convert text to speech using ElevenLabs and return a local file URI.
 * @param text - Text to speak
 * @param options - voice_id, model_id
 * @returns Local file URI (file://...) of the generated MP3
 */
export async function textToSpeech(
  text: string,
  options?: SpeakOptions
): Promise<string> {
  const apiKey = getApiKey();
  const voiceId = options?.voice_id ?? DEFAULT_VOICE_ID;
  const modelId = options?.model_id ?? DEFAULT_TTS_MODEL_ID;
  const url = `${ELEVENLABS_TTS_BASE}/${voiceId}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
      'Content-Type': 'application/json',
      Accept: 'audio/mpeg',
    },
    body: JSON.stringify({
      text: trim(text),
      model_id: modelId,
    }),
  });

  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`ElevenLabs TTS failed (${response.status}): ${errBody}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const base64 = arrayBufferToBase64(arrayBuffer);
  const fileName = `tts-${Date.now()}.mp3`;
  const fileUri = `${FileSystem.cacheDirectory}${fileName}`;
  await FileSystem.writeAsStringAsync(fileUri, base64, {
    encoding: 'base64',
  });
  return fileUri;
}
