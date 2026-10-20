import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect, useLocalSearchParams, router } from 'expo-router';
import { savedNarrator } from '../src/voices';
import * as Speech from 'expo-speech';
import { getPdfBooks, savePdfPage, type PdfBook } from '../src/pdfLibrary';
import { pdfPageCount, pdfReadPage } from '../src/pdf';
import { purchaseSubscription, restoreSubscription, subscriptionOffers, subscriptionStatus } from '../src/store';

export default function PdfReader() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [book, setBook] = useState<PdfBook | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [text, setText] = useState('');
  const [method, setMethod] = useState('');
  const [busy, setBusy] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [premium, setPremium] = useState(false);
  const [price, setPrice] = useState('View subscription');
  const [rate, setRate] = useState(1);
  const generation = useRef(0);
  const speechSession = useRef(0);
  const pageRef = useRef(0);
  const bookRef = useRef<PdfBook | null>(null);
  const totalRef = useRef(0);
  const premiumRef = useRef(false);
  const rateRef = useRef(1);
  const [voiceId, setVoiceId] = useState<string | null>(null);

  useFocusEffect(useCallback(() => {
    let active = true;
    subscriptionStatus().then(s => { if (active) { setPremium(s.pdfReadAloud); premiumRef.current = s.pdfReadAloud; } })
      .catch(() => { if (active) { setPremium(false); premiumRef.current = false; } });
    subscriptionOffers().then(o => { if (active && o[0]) setPrice(o[0].price); }).catch(() => {});
    savedNarrator().then(v => { if (active) setVoiceId(v); }).catch(() => {});
    return () => { active = false; };
  }, []));

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const item = (await getPdfBooks()).find(b => b.id === id);
        if (!item) throw new Error('PDF not found');
        const count = await pdfPageCount(item.uri);
        if (!active) return;
        setBook(item); bookRef.current = item;
        setTotal(count); totalRef.current = count;
        const initial = Math.max(0, Math.min(item.pageIndex, count - 1));
        setPage(initial); pageRef.current = initial;
      } catch (e) { if (active) Alert.alert('PDF error', String(e)); }
    })();
    return () => { active = false; generation.current++; speechSession.current++; Speech.stop(); };
  }, [id]);

  useEffect(() => {
    if (!book) return;
    const current = ++generation.current;
    setBusy(true); setText(''); setMethod('');
    pdfReadPage(book.uri, page).then(result => {
      if (generation.current !== current) return;
      setText(result.text); setMethod(result.method);
      savePdfPage(book.id, page).catch(() => {});
    }).catch(e => { if (generation.current === current) Alert.alert('Reading error', String(e)); })
      .finally(() => { if (generation.current === current) setBusy(false); });
  }, [book?.id, page]);

  const stop = () => {
    speechSession.current++;
    Speech.stop();
    setSpeaking(false);
  };
  const move = (target: number) => {
    stop();
    const next = Math.max(0, Math.min(totalRef.current - 1, target));
    pageRef.current = next;
    setPage(next);
  };
  const readSequence = async (start: number, session: number) => {
    const item = bookRef.current;
    if (!item) return;
    for (let index = start; index < totalRef.current; index++) {
      if (speechSession.current !== session) return;
      // Revalidate the Apple-verified subscription at each page boundary.
      const status = await subscriptionStatus();
      if (!status.pdfReadAloud) { premiumRef.current = false; setPremium(false); setSpeaking(false); return; }
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
        await new Promise<void>((resolve, reject) => {
          Speech.speak(chunk, {
            rate: rateRef.current,
            ...(voiceId ? { voice: voiceId } : {}),
            onDone: resolve,
            onStopped: resolve,
            onError: reject,
          });
        });
      }
    }
    if (speechSession.current === session) setSpeaking(false);
  };
  const start = async () => {
    if (!book || busy) return;
    if (speaking) { stop(); return; }
    try {
      const status = await subscriptionStatus();
      setPremium(status.pdfReadAloud); premiumRef.current = status.pdfReadAloud;
      if (!status.pdfReadAloud) {
        Alert.alert('kenni Premium', 'Unlock PDF read-aloud with a subscription. Manual PDF reading stays free.', [
          { text: 'Not now', style: 'cancel' },
          { text: 'Subscribe', onPress: () => { subscribe(); } },
        ]);
        return;
      }
      const session = ++speechSession.current;
      setSpeaking(true);
      readSequence(pageRef.current, session).catch(e => {
        if (speechSession.current === session) { setSpeaking(false); Alert.alert('Narration error', String(e)); }
      });
    } catch (e) { Alert.alert('Subscription error', String(e)); }
  };
  const subscribe = async () => {
    try {
      const offers = await subscriptionOffers();
      if (!offers[0]) { Alert.alert('Subscriptions unavailable', 'Configure the PDF narration product in App Store Connect before purchasing.'); return; }
      const status = await purchaseSubscription(offers[0]?.id || '');
      setPremium(status.pdfReadAloud); premiumRef.current = status.pdfReadAloud;
      if (status.pdfReadAloud) Alert.alert('kenni', 'PDF narration is unlocked.');
    } catch (e) { Alert.alert('Subscription unavailable', String(e)); }
  };
  const restore = async () => {
    try {
      const status = await restoreSubscription();
      setPremium(status.pdfReadAloud); premiumRef.current = status.pdfReadAloud;
      Alert.alert('Restore purchases', status.pdfReadAloud ? 'Subscription restored.' : 'No active PDF narration subscription found.');
    } catch (e) { Alert.alert('Restore failed', String(e)); }
  };

  return <View style={{ flex: 1, backgroundColor: '#FFD500', padding: 18 }}>
    <Text style={{ fontSize: 26, fontWeight: '900', color: '#111' }} numberOfLines={2}>{book?.title || 'PDF Reader'}</Text>
    <Text style={{ color: '#111', marginVertical: 10 }}>Page {page + 1} / {total || '…'} {method === 'ocr' ? '· OCR' : method ? '· Text' : ''}</Text>
    <ScrollView style={{ flex: 1, backgroundColor: '#FFF9E8', borderRadius: 12, padding: 18 }}>
      {busy ? <ActivityIndicator /> : <Text selectable style={{ color: '#111', fontSize: 18, lineHeight: 29 }}>{text || 'No readable text on this page.'}</Text>}
    </ScrollView>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16, alignItems: 'center' }}>
      <TouchableOpacity disabled={page === 0} onPress={() => move(page - 1)}><Text style={{ fontWeight: '800', color: '#111' }}>← Previous</Text></TouchableOpacity>
      <TouchableOpacity onPress={start}><Text style={{ fontWeight: '900', color: '#111' }}>{speaking ? '■ Stop' : '▶ Read aloud'}</Text></TouchableOpacity>
      <TouchableOpacity disabled={page >= total - 1} onPress={() => move(page + 1)}><Text style={{ fontWeight: '800', color: '#111' }}>Next →</Text></TouchableOpacity>
    </View>
    <TouchableOpacity onPress={() => { stop(); router.push('/voices'); }} style={{ marginTop: 14 }}><Text style={{ color: '#111', fontWeight: '800' }}>Narrator: {voiceId ? 'Selected voice' : 'System default'} · Change voice →</Text></TouchableOpacity>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16, alignItems: 'center' }}>
      <TouchableOpacity onPress={() => { const next = rate >= 1.5 ? 0.8 : Math.round((rate + 0.1) * 10) / 10; setRate(next); rateRef.current = next; }}><Text style={{ color: '#111' }}>Voice speed {rate.toFixed(1)}×</Text></TouchableOpacity>
      {premium ? <Text style={{ fontWeight: '800', color: '#111' }}>Premium active</Text> : <TouchableOpacity onPress={subscribe}><Text style={{ fontWeight: '800', color: '#111' }}>Unlock · {price}</Text></TouchableOpacity>}
      <TouchableOpacity onPress={restore}><Text style={{ color: '#111' }}>Restore</Text></TouchableOpacity>
    </View>
  </View>;
}
