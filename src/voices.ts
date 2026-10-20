import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Speech from 'expo-speech';

const KEY = 'kenni:voice:v1';
export type NarratorVoice = { identifier: string; name: string; language: string; quality?: string };

export async function availableNarrators(): Promise<NarratorVoice[]> {
  const voices = await Speech.getAvailableVoicesAsync();
  return voices.map(v => ({ identifier: v.identifier, name: v.name, language: v.language, quality: String(v.quality ?? '') }))
    .sort((a, b) => a.language.localeCompare(b.language) || a.name.localeCompare(b.name));
}
export async function savedNarrator(): Promise<string | null> { return AsyncStorage.getItem(KEY); }
export async function saveNarrator(id: string | null): Promise<void> {
  if (id) await AsyncStorage.setItem(KEY, id);
  else await AsyncStorage.removeItem(KEY);
}
export const VOICE_PREVIEW = 'Welcome to kenni. Every good book deserves a voice you love listening to.';
