import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect, useLocalSearchParams, router } from 'expo-router';
import { narrationVoice, savedAvailableNarrator } from '../src/voices';
import * as Speech from 'expo-speech';
import { getPdfBooks, savePdfPage, type PdfBook } from '../src/pdfLibrary';
import { pdfPageCount, pdfReadPage } from '../src/pdf';
import { Brand } from '../src/Brand';
import { colors } from '../src/theme';

export default function PdfReader() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [book, setBook] = useState<PdfBook | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [text, setText] = useState('');
  const [method, setMethod] = useState('');
  const [busy, setBusy] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [paused, setPaused] = useState(false);
  const [rate, setRate] = useState(1);
  const generation = useRef(0);
  const speechSession = useRef(0);
  const pausedRef = useRef(false);
  const speechPending = useRef(false);
  const resumeWaiters = useRef<Array<() => void>>([]);
  const sequenceRun = useRef<Promise<void> | null>(null);
  const pageRef = useRef(0);
  const bookRef = useRef<PdfBook | null>(null);
  const totalRef = useRef(0);
  const rateRef = useRef(1);
  const [voiceId, setVoiceId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(useCallback(() => {
    let active = true;
    savedAvailableNarrator().then(v => { if (active) setVoiceId(v); }).catch(() => {});
    return () => { active = false; };
  }, []));

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true); setError(null);
        const item = (await getPdfBooks()).find(b => b.id === id);
        if (!item) throw new Error('PDF not found');
        const count = await pdfPageCount(item.uri);
        if (count < 1) throw new Error('PDF does not contain any pages');
        if (!active) return;
        setBook(item); bookRef.current = item;
        setTotal(count); totalRef.current = count;
        const initial = Math.max(0, Math.min(item.pageIndex, count - 1));
        setPage(initial); pageRef.current = initial;
      } catch (e) { if (active) setError(e instanceof Error ? e.message : String(e)); }
      finally { if (active) setLoading(false); }
    })();
    return () => { active = false; generation.current++; speechSession.current++; void Speech.stop(); };
  }, [id]);

  useEffect(() => {
    if (!book) return;
    const current = ++generation.current;
    setBusy(true); setError(null); setText(''); setMethod('');
    pdfReadPage(book.uri, page).then(result => {
      if (generation.current !== current) return;
      setText(result.text); setMethod(result.method);
      savePdfPage(book.id, page).catch(() => {});
    }).catch(e => { if (generation.current === current) setError(e instanceof Error ? e.message : String(e)); })
      .finally(() => { if (generation.current === current) setBusy(false); });
  }, [book?.id, page]);

  const stop = () => {
    speechSession.current++;
    pausedRef.current = false;
    speechPending.current = false;
    resumeWaiters.current.splice(0).forEach(resolve => resolve());
    sequenceRun.current = null;
    void Speech.stop();
    setSpeaking(false);
    setPaused(false);
  };
  const move = (target: number) => {
    stop();
    const next = Math.max(0, Math.min(totalRef.current - 1, target));
    pageRef.current = next;
    setPage(next);
  };
  const waitUntilResumed = () => pausedRef.current
    ? new Promise<void>(resolve => resumeWaiters.current.push(resolve))
    : Promise.resolve();
  const readSequence = async (start: number, session: number) => {
    const item = bookRef.current;
    if (!item) return;
    for (let index = start; index < totalRef.current; index++) {
      if (speechSession.current !== session) return;
      const result = await pdfReadPage(item.uri, index);
      if (speechSession.current !== session) return;
      pageRef.current = index;
      setPage(index);
      await savePdfPage(item.id, index);
      if (!result.text.trim()) continue;
      // Short chunks avoid iOS speech synthesis limits for long PDF pages.
      const chunks = result.text.match(/[\s\S]{1,1200}(?:\s|$)/g) || [result.text];
      for (const chunk of chunks) {
        if (speechSession.current !== session) return;
        await waitUntilResumed();
        if (speechSession.current !== session) return;
        speechPending.current = true;
        await new Promise<void>((resolve, reject) => {
          Speech.speak(chunk, {
            rate: rateRef.current,
            ...(narrationVoice(voiceId) ? { voice: narrationVoice(voiceId) } : {}),
            onDone: () => { speechPending.current = false; resolve(); },
            onStopped: () => { speechPending.current = false; resolve(); },
            onError: e => { speechPending.current = false; reject(e); },
          });
        });
      }
    }
    if (speechSession.current === session) { setSpeaking(false); setPaused(false); }
  };
  const start = async () => {
    if (!book || busy) return;
    try {
      const session = ++speechSession.current;
      setSpeaking(true);
      sequenceRun.current = readSequence(pageRef.current, session).catch(e => {
        if (speechSession.current === session) { setSpeaking(false); setPaused(false); Alert.alert('Narration error', String(e)); }
      });
    } catch (e) {
      setSpeaking(false);
      Alert.alert('Narration error', String(e));
    }
  };
  const pause = async () => {
    if (!speaking || pausedRef.current) return;
    pausedRef.current = true;
    setPaused(true);
    try {
      if (speechPending.current) await Speech.pause();
    } catch (e) {
      pausedRef.current = false;
      setPaused(false);
      Alert.alert('Could not pause narration', String(e));
    }
  };
  const resume = async () => {
    if (!pausedRef.current) return;
    try {
      if (speechPending.current) await Speech.resume();
      pausedRef.current = false;
      setPaused(false);
      resumeWaiters.current.splice(0).forEach(resolve => resolve());
    } catch (e) {
      Alert.alert('Could not resume narration', String(e));
    }
  };

  if (loading) return <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator color={colors.yellow} /><Text style={{ color: colors.text, marginTop: 12 }}>Opening PDF…</Text></View>;
  if (error) return <View style={{ flex: 1, backgroundColor: colors.background, padding: 18, justifyContent: 'center' }}><Text style={{ fontSize: 26, fontWeight: '900', color: colors.text }}>PDF unavailable</Text><Text style={{ color: colors.muted, marginTop: 10 }}>{error}</Text><TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}><Text style={{ color: colors.yellow, fontWeight: '900' }}>← Back to library</Text></TouchableOpacity></View>;
  return <View style={{ flex: 1, backgroundColor: colors.background, padding: 18 }}><Brand compact />
    <Text style={{ fontSize: 26, fontWeight: '900', color: colors.text }} numberOfLines={2}>{book?.title || 'PDF Reader'}</Text>
    <Text style={{ color: colors.muted, marginVertical: 10 }}>Page {page + 1} / {total || '…'} {method === 'ocr' ? '· OCR' : method ? '· Text' : ''}</Text>
    <ScrollView style={{ flex: 1, backgroundColor: colors.surface, borderRadius: 12, padding: 18 }}>
      {busy ? <View><ActivityIndicator color={colors.yellow} /><Text style={{ color: colors.muted, textAlign: 'center', marginTop: 10 }}>Extracting page…</Text></View> : <Text selectable style={{ color: colors.text, fontSize: 18, lineHeight: 29 }}>{text || 'No readable text on this page.'}</Text>}
    </ScrollView>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16, alignItems: 'center' }}>
      <TouchableOpacity disabled={page === 0} onPress={() => move(page - 1)}><Text style={{ fontWeight: '800', color: colors.text }}>← Previous</Text></TouchableOpacity>
      {!speaking ? <TouchableOpacity onPress={start}><Text style={{ fontWeight: '900', color: colors.background, backgroundColor: colors.yellow, padding: 10, borderRadius: 10 }}>▶ Read aloud</Text></TouchableOpacity> : <View style={{ flexDirection: 'row', gap: 8 }}>
        <TouchableOpacity onPress={paused ? resume : pause} accessibilityRole="button" accessibilityLabel={paused ? 'Resume narration' : 'Pause narration'}><Text style={{ fontWeight: '900', color: colors.background, backgroundColor: colors.yellow, padding: 10, borderRadius: 10 }}>{paused ? '▶ Resume' : 'Ⅱ Pause'}</Text></TouchableOpacity>
        <TouchableOpacity onPress={stop} accessibilityRole="button" accessibilityLabel="Stop narration"><Text style={{ fontWeight: '900', color: colors.text, backgroundColor: colors.surface, padding: 10, borderRadius: 10 }}>■ Stop</Text></TouchableOpacity>
      </View>}
      <TouchableOpacity disabled={page >= total - 1} onPress={() => move(page + 1)}><Text style={{ fontWeight: '800', color: colors.text }}>Next →</Text></TouchableOpacity>
    </View>
    <TouchableOpacity onPress={() => { stop(); router.push('/voices'); }} style={{ marginTop: 14 }}><Text style={{ color: colors.yellow, fontWeight: '800' }}>Narrator: {voiceId ? 'Selected voice' : 'System default'} · Change voice →</Text></TouchableOpacity>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16, alignItems: 'center' }}>
      <TouchableOpacity onPress={() => { const next = rate >= 1.5 ? 0.8 : Math.round((rate + 0.1) * 10) / 10; setRate(next); rateRef.current = next; }}><Text style={{ color: colors.text }}>Voice speed {rate.toFixed(1)}×</Text></TouchableOpacity>
      <Text style={{ fontWeight: '800', color: colors.yellow }}>Narration available</Text>
    </View>
  </View>;
}
