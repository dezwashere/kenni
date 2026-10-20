import { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, Text, TextInput, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import * as Speech from 'expo-speech';
import { availableNarrators, savedAvailableNarrator, saveNarrator, VOICE_PREVIEW, type NarratorVoice } from '../src/voices';

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
  return <View style={{ flex: 1, backgroundColor: '#FFD500', padding: 18 }}>
    <Text style={{ fontSize: 30, fontWeight: '900', color: '#111' }}>Choose your narrator.</Text>
    <Text style={{ marginVertical: 10, color: '#222' }}>Preview and use Apple voices for PDF narration.</Text>
    <TextInput accessibilityLabel="Search voices" placeholder="Search name or language" placeholderTextColor="#555" value={query} onChangeText={setQuery}
      style={{ backgroundColor: '#FFF4A0', padding: 14, borderRadius: 10, color: '#111', marginBottom: 12 }} />
    {loading ? <ActivityIndicator color="#111" /> :
      <FlatList data={filtered} keyExtractor={v => v.identifier}
        ListEmptyComponent={<Text style={{ color: '#111' }}>No voices found. Download additional system voices in iPhone Settings if available.</Text>}
        renderItem={({ item }) => <View style={{ backgroundColor: '#FFF9E8', padding: 14, borderRadius: 12, marginBottom: 10 }}>
          <Text style={{ color: '#111', fontSize: 17, fontWeight: '800' }}>{item.name} {selected === item.identifier ? '✓' : ''}</Text>
          <Text style={{ color: '#333', marginTop: 3 }}>{item.language}{item.quality ? ' · ' + item.quality : ''}</Text>
          <View style={{ flexDirection: 'row', gap: 18, marginTop: 12 }}>
            <Pressable accessibilityRole="button" onPress={() => play(item)}><Text style={{ color: '#111', fontWeight: '800' }}>{preview === item.identifier ? '■ Stop preview' : '▶ Preview'}</Text></Pressable>
            <Pressable accessibilityRole="button" onPress={() => choose(item)}><Text style={{ color: '#111', fontWeight: '800' }}>{selected === item.identifier ? 'Selected' : 'Use this voice'}</Text></Pressable>
          </View>
        </View>} />}
  </View>;
}
