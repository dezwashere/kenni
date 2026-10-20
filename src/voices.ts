import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Speech from 'expo-speech';

const KEY = 'kenni:voice:v1';
export type NarratorVoice = { identifier: string; name: string; language: string; quality?: string; available: boolean };

const NATIVE_OPTIONS = [
  { key: 'female', name: 'Samantha', language: 'en-US', match: /samantha/i },
  { key: 'male', name: 'Daniel', language: 'en-GB', match: /daniel/i },
] as const;

export async function availableNarrators(): Promise<NarratorVoice[]> {
  let voices: Awaited<ReturnType<typeof Speech.getAvailableVoicesAsync>> = [];
  try { voices = await Speech.getAvailableVoicesAsync(); } catch { /* Use iOS default voice when the catalog is unavailable. */ }
  return NATIVE_OPTIONS.map(option => {
    const matches = voices.filter(v => option.match.test(v.name) && v.language.toLowerCase().startsWith(option.language.slice(0, 2)));
    const voice = matches.find(v => /enhanced/i.test(String(v.quality))) ?? matches[0];
    return {
      identifier: voice?.identifier ?? `kenni-native-${option.key}`,
      name: option.name,
      language: voice?.language ?? option.language,
      quality: voice ? String(voice.quality ?? '') : '',
      available: Boolean(voice),
    };
  });
}
export async function savedNarrator(): Promise<string | null> { return AsyncStorage.getItem(KEY); }
export async function savedAvailableNarrator(): Promise<string | null> {
  const saved = await savedNarrator();
  if (!saved) return null;
  const voices = await availableNarrators();
  const match = voices.find(v => v.identifier === saved || (v.name === 'Samantha' && saved === 'kenni-native-female') || (v.name === 'Daniel' && saved === 'kenni-native-male'));
  return match?.identifier ?? null;
}
export async function saveNarrator(id: string | null): Promise<void> {
  if (id) await AsyncStorage.setItem(KEY, id);
  else await AsyncStorage.removeItem(KEY);
}
export const VOICE_PREVIEW = 'Welcome to kenni. Every good book deserves a voice you love listening to.';

export function narrationVoice(identifier: string | null): string | undefined {
  if (!identifier) return undefined;
  return identifier.startsWith('kenni-native-') ? undefined : identifier;
}
