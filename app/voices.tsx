import { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, Text, View } from 'react-native';
import { setAudioModeAsync } from 'expo-audio';
import { useFocusEffect, router } from 'expo-router';
import * as Speech from 'expo-speech';
import { availableNarrators, saveNarrator, VOICE_PREVIEW, type NarratorVoice } from '../src/voices';
import { Brand } from '../src/Brand';
import { colors } from '../src/theme';

export default function VoicePicker() {
  const [voice, setVoice] = useState<NarratorVoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState(false);
  const previewRun = useRef(0);

  useFocusEffect(useCallback(() => {
    let active = true;
    setLoading(true);
    availableNarrators().then(async list => {
      if (!active) return;
      const selected = list[0] ?? null;
      setVoice(selected);
      if (selected) await saveNarrator(selected.identifier);
    }).catch(e => { if (active) Alert.alert('Voice unavailable', String(e)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; previewRun.current++; void Speech.stop(); setPreview(false); };
  }, []));

  const togglePreview = async () => {
    const run = ++previewRun.current;
    try {
      await Speech.stop();
      if (preview) { setPreview(false); return; }
      await setAudioModeAsync({ playsInSilentMode: true, interruptionMode: 'doNotMix' });
      setPreview(true);
      Speech.speak(VOICE_PREVIEW, { ...(voice?.available ? { voice: voice.identifier } : {}), language: voice?.language ?? 'en-US', rate: 0.95,
        onDone: () => { if (previewRun.current === run) setPreview(false); },
        onStopped: () => { if (previewRun.current === run) setPreview(false); },
        onError: () => { if (previewRun.current === run) setPreview(false); },
      });
    } catch (e) { if (previewRun.current === run) setPreview(false); Alert.alert('Preview failed', String(e)); }
  };

  return <View style={{ flex: 1, backgroundColor: colors.background, padding: 22 }}>
    <Brand compact />
    <Text style={{ color: colors.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1.5, marginTop: 40 }}>READING & LISTENING</Text>
    <Text style={{ color: colors.text, fontSize: 36, fontWeight: '400', letterSpacing: -1.2, marginTop: 8 }}>One quiet voice.</Text>
    <Text style={{ color: colors.muted, fontSize: 15, lineHeight: 23, marginTop: 10 }}>Kenni uses a built-in Apple voice. It works offline and stays on this iPhone.</Text>
    {loading ? <ActivityIndicator color={colors.accent} style={{ marginTop: 28 }} /> : voice ? <View style={{ marginTop: 28, paddingVertical: 22, borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.border }}>
      <Text style={{ color: colors.text, fontSize: 21, fontWeight: '500' }}>{voice.name}</Text>
      <Text style={{ color: colors.muted, marginTop: 5 }}>{voice.language}{voice.quality ? ` · ${voice.quality}` : ''} · Built in</Text>
      <Text style={{ color: colors.accent, marginTop: 16, fontSize: 12 }}>{voice.available ? 'Saved as your narrator' : 'Apple’s built-in English voice will be used'}</Text>
      <Pressable accessibilityRole="button" accessibilityLabel={preview ? 'Stop voice preview' : 'Preview voice'} onPress={togglePreview} style={{ alignSelf: 'flex-start', marginTop: 20, paddingVertical: 12, paddingHorizontal: 16, backgroundColor: colors.accent, borderRadius: 4 }}>
        <Text style={{ color: colors.background, fontWeight: '700' }}>{preview ? 'Ⅱ  Stop preview' : '▶  Preview voice'}</Text>
      </Pressable>
    </View> : null}
    <Pressable accessibilityRole="button" onPress={() => router.back()} style={{ marginTop: 'auto', minHeight: 48, justifyContent: 'center' }}><Text style={{ color: colors.accent, fontWeight: '600' }}>←  Back to your book</Text></Pressable>
  </View>;
}
