import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import * as Speech from 'expo-speech';
import { getPdfBooks, savePdfPage, type PdfBook } from '../src/pdfLibrary';
import { pdfPageCount, pdfReadPage } from '../src/pdf';

export default function PdfReader() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [book, setBook] = useState<PdfBook | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [text, setText] = useState('');
  const [method, setMethod] = useState('');
  const [busy, setBusy] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [rate, setRate] = useState(1);
  const run = useRef(0);
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const item = (await getPdfBooks()).find(b => b.id === id);
        if (!item) throw new Error('PDF not found');
        const count = await pdfPageCount(item.uri);
        if (active) { setBook(item); setTotal(count); setPage(Math.min(item.pageIndex, count - 1)); }
      } catch (e) { Alert.alert('PDF error', String(e)); }
    })();
    return () => { active = false; run.current++; Speech.stop(); };
  }, [id]);
  useEffect(() => {
    if (!book) return;
    const current = ++run.current;
    Speech.stop(); setSpeaking(false); setBusy(true); setText('');
    pdfReadPage(book.uri, page).then(result => {
      if (run.current === current) { setText(result.text); setMethod(result.method); savePdfPage(book.id, page); }
    }).catch(e => { if (run.current === current) Alert.alert('Reading error', String(e)); })
      .finally(() => { if (run.current === current) setBusy(false); });
  }, [book?.id, page]);
  const stop = () => { run.current++; Speech.stop(); setSpeaking(false); };
  const speak = () => {
    // Paid feature: do not enable until verified StoreKit entitlement is wired.
    Alert.alert('kenni Premium', 'PDF read-aloud will be available with the $2.99/month subscription once App Store purchases are connected.');
  };
  return <View style={{ flex: 1, backgroundColor: '#FFD500', padding: 18 }}>
    <Text style={{ fontSize: 26, fontWeight: '900', color: '#111' }}>{book?.title || 'PDF Reader'}</Text>
    <Text style={{ color: '#111', marginVertical: 10 }}>Page {page + 1} / {total || '…'} {method === 'ocr' ? '· OCR' : method ? '· Text' : ''}</Text>
    <ScrollView style={{ flex: 1, backgroundColor: '#FFF9E8', borderRadius: 12, padding: 18 }}>
      {busy ? <ActivityIndicator /> : <Text selectable style={{ color: '#111', fontSize: 18, lineHeight: 29 }}>{text || 'No readable text on this page.'}</Text>}
    </ScrollView>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 }}>
      <TouchableOpacity onPress={() => { stop(); setPage(p => Math.max(0, p - 1)); }}><Text style={{ fontWeight: '800' }}>← Previous</Text></TouchableOpacity>
      <TouchableOpacity onPress={speak}><Text style={{ fontWeight: '800' }}>▶ Read aloud · Premium</Text></TouchableOpacity>
      <TouchableOpacity onPress={() => { stop(); setPage(p => Math.min(total - 1, p + 1)); }}><Text style={{ fontWeight: '800' }}>Next →</Text></TouchableOpacity>
    </View>
  </View>;
}
