import { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, Text, TextInput, View } from 'react-native';
import { setAudioModeAsync } from 'expo-audio';
import { useFocusEffect } from 'expo-router';
import * as Speech from 'expo-speech';
import { availableNarrators, savedAvailableNarrator, saveNarrator, VOICE_PREVIEW, type NarratorVoice } from '../src/voices';
import { Brand } from '../src/Brand';
import { colors } from '../src/theme';

export default function VoicePicker() {
  const [voices, setVoices] = useState<NarratorVoice[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState<string | null>(null);
  const previewRun = useRef(0);

  useFocusEffect(useCallback(() => {
    let active = true;
    setLoading(true);
    Promise.all([availableNarrators(), savedAvailableNarrator()])
      .then(([list, id]) => { if (active) { setVoices(list); setSelected(id); } })
      .catch(e => { if (active) Alert.alert('Voices unavailable', String(e)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; previewRun.current++; void Speech.stop(); setPreview(null); };
  }, []));

  const play = async (voice: NarratorVoice) => {
    const run = ++previewRun.current;
    try {
      await Speech.stop();
      if (preview === voice.identifier) { setPreview(null); return; }
      await setAudioModeAsync({ playsInSilentMode: true, interruptionMode: 'doNotMix' });
      setPreview(voice.identifier);
      Speech.speak(VOICE_PREVIEW, {
        voice: voice.identifier,
        language: voice.language,
        rate: 0.95,
        onDone: () => { if (previewRun.current === run) setPreview(null); },
        onStopped: () => { if (previewRun.current === run) setPreview(null); },
        onError: () => { if (previewRun.current === run) setPreview(null); },
      });
    } catch (e) { if (previewRun.current === run) setPreview(null); Alert.alert('Preview failed', String(e)); }
  };
  const choose = async (voice: NarratorVoice) => {
    try { await saveNarrator(voice.identifier); setSelected(voice.identifier); }
    catch (e) { Alert.alert('Could not save voice', String(e)); }
  };
  const filtered = voices.filter(v => (v.name + ' ' + v.language).toLowerCase().includes(query.toLowerCase()));
  return <View style={{ flex: 1, backgroundColor: colors.background, padding: 18 }}><Brand compact />
    <Text style={{ fontSize: 30, fontWeight: '900', color: colors.text }}>Choose your narrator.</Text>
    <Text style={{ marginVertical: 10, color: colors.muted }}>Preview and use Apple voices for PDF narration.</Text>
    <TextInput accessibilityLabel="Search voices" placeholder="Search name or language" placeholderTextColor="#555" value={query} onChangeText={setQuery}
      style={{ backgroundColor: colors.surface, padding: 14, borderRadius: 10, color: colors.text, marginBottom: 12, borderWidth: 1, borderColor: colors.border }} />
    {loading ? <ActivityIndicator color={colors.yellow} /> :
      <FlatList data={filtered} keyExtractor={v => v.identifier}
        ListEmptyComponent={<Text style={{ color: colors.muted }}>No voices found. Download additional system voices in iPhone Settings if available.</Text>}
        renderItem={({ item }) => <View style={{ backgroundColor: colors.surface, padding: 14, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: colors.border }}>
          <Text style={{ color: colors.text, fontSize: 17, fontWeight: '800' }}>{item.name} {selected === item.identifier ? '✓' : ''}</Text>
          <Text style={{ color: '#333', marginTop: 3 }}>{item.language}{item.quality ? ' · ' + item.quality : ''}</Text>
          <View style={{ flexDirection: 'row', gap: 18, marginTop: 12 }}>
            <Pressable accessibilityRole="button" onPress={() => play(item)}><Text style={{ color: colors.yellow, fontWeight: '800' }}>{preview === item.identifier ? '■ Stop preview' : '▶ Preview'}</Text></Pressable>
            <Pressable accessibilityRole="button" onPress={() => choose(item)}><Text style={{ color: colors.yellow, fontWeight: '800' }}>{selected === item.identifier ? 'Selected' : 'Use this voice'}</Text></Pressable>
          </View>
        </View>} />}
  </View>;
}
