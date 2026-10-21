import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Speech from 'expo-speech';

const KEY = 'kenni:voice:v1';
export type NarratorVoice = { identifier: string; name: string; language: string; quality?: string; available: boolean };

// Pin the app to one device-native Apple voice; no downloaded voice assets are used.
const NATIVE_VOICE = /samantha/i;
const DEFAULT_VOICE: NarratorVoice = { identifier: 'kenni-native-samantha', name: 'Samantha', language: 'en-US', available: true };

export async function availableNarrators(): Promise<NarratorVoice[]> {
  let voices: Awaited<ReturnType<typeof Speech.getAvailableVoicesAsync>> = [];
  try { voices = await Speech.getAvailableVoicesAsync(); } catch { /* Native speech still resolves the platform default. */ }
  const match = voices.find(v => NATIVE_VOICE.test(v.name) && v.language.toLowerCase().startsWith('en'));
  return [{ ...DEFAULT_VOICE, identifier: match?.identifier ?? DEFAULT_VOICE.identifier, language: match?.language ?? DEFAULT_VOICE.language, quality: match ? String(match.quality ?? '') : '', available: Boolean(match) }];
}

export async function savedNarrator(): Promise<string | null> { return AsyncStorage.getItem(KEY); }
export async function savedAvailableNarrator(): Promise<string | null> {
  const voice = (await availableNarrators())[0];
  return voice?.available ? voice.identifier : null;
}
export async function saveNarrator(id: string | null): Promise<void> {
  if (id) await AsyncStorage.setItem(KEY, id);
  else await AsyncStorage.removeItem(KEY);
}
export const VOICE_PREVIEW = 'Welcome to kenni. Every good book deserves a voice you love listening to.';

export async function narrationVoice(_identifier: string | null): Promise<string | undefined> {
  const voice = (await availableNarrators())[0];
  return voice?.available ? voice.identifier : undefined;
}
