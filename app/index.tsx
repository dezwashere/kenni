import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Animated, Easing, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Book, downloadBook, getBooks, importBook } from '../src/library';
import { getPdfBooks, importPdf, PdfBook } from '../src/pdfLibrary';
import { colors, spacing } from '../src/theme';
import { Brand } from '../src/Brand';
import { openSample, SAMPLE_LIBRARY } from '../src/sampleLibrary';

const palettes = ['#6F3D94', '#3C596F', '#934F67', '#66704A', '#544B83', '#A06B42'];
function Cover({ title, kind, index, onPress, progress }: { title: string; kind: 'PDF' | 'AUDIO'; index: number; onPress: () => void; progress?: string }) {
  const drift = useRef(new Animated.Value(index % 2 ? 1 : 0)).current;
  useEffect(() => {
    const animation = Animated.loop(Animated.sequence([
      Animated.timing(drift, { toValue: 1, duration: 4300 + (index % 3) * 500, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      Animated.timing(drift, { toValue: 0, duration: 4300 + (index % 3) * 500, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
    ]));
    animation.start();
    return () => animation.stop();
  }, [drift, index]);
  const sway = drift.interpolate({ inputRange: [0, 1], outputRange: [index % 2 ? 1.5 : -1.5, index % 2 ? -1.5 : 1.5] });
  return <Pressable accessibilityRole="button" accessibilityLabel={`${kind === 'PDF' ? 'Read' : 'Play'} ${title}`} onPress={onPress} style={styles.coverPress}>
    <Animated.View style={[styles.cover, { backgroundColor: palettes[index % palettes.length], transform: [{ translateY: sway }, { rotate: `${index % 2 ? 2 : -2}deg` }] }]}>
      <View style={styles.coverRule} />
      <Text style={styles.coverKind}>{kind === 'PDF' ? 'ON THE PAGE' : 'AUDIO EDITION'}</Text>
      <Text numberOfLines={4} style={styles.coverTitle}>{title}</Text>
      <View style={styles.coverBottom}><Text style={styles.coverInitial}>{title.trim().charAt(0).toUpperCase() || 'K'}</Text><Text style={styles.coverAction}>{kind === 'PDF' ? 'OPEN  ↗' : 'PLAY  ↗'}</Text></View>
    </Animated.View>
    <Text numberOfLines={1} style={styles.itemTitle}>{title}</Text>
    <Text style={styles.itemMeta}>{progress || (kind === 'PDF' ? 'PDF · KEEP READING' : 'AUDIOBOOK · READY')}</Text>
  </Pressable>;
}

function Empty({ children }: { children: string }) { return <Text style={styles.empty}>{children}</Text>; }
export default function Library() {
  const [books, setBooks] = useState<Book[]>([]), [pdfs, setPdfs] = useState<PdfBook[]>([]), [url, setUrl] = useState(''), [busy, setBusy] = useState(false), [loading, setLoading] = useState(true), [error, setError] = useState<string | null>(null);
  const refresh = async () => { setError(null); try { const [audio, pdf] = await Promise.all([getBooks(), getPdfBooks()]); setBooks(audio); setPdfs(pdf); } catch { setError('Your library could not be loaded. Try again.'); throw Error('Library unavailable'); } finally { setLoading(false); } };
  useFocusEffect(useCallback(() => { refresh().catch(() => {}); }, []));
  async function run(action: () => Promise<unknown>) { setBusy(true); try { await action(); await refresh(); } catch (e) { Alert.alert('kenni', String(e)); } finally { setBusy(false); } }
  return <ScrollView style={styles.page} contentContainerStyle={styles.content}>
    <View style={styles.masthead}><Brand compact /><Pressable accessibilityRole="button" accessibilityLabel="Open profile" onPress={() => router.push('/profile')} style={styles.profile}><Text style={styles.profileText}>PROFILE  ↗</Text></Pressable></View>
    <View style={styles.intro}><Text style={styles.eyebrow}>A LITTLE SPACE TO GET LOST</Text><Text style={styles.heading}>The library<Text style={styles.headingDot}>.</Text></Text><Text style={styles.subtitle}>Stories to sit with. Ideas to carry.</Text></View>
    <View style={styles.actions}><Pressable accessibilityRole="button" disabled={busy} onPress={() => run(importPdf)} style={[styles.primary, busy && styles.disabled]}><Text style={styles.primaryText}>＋  Add a book</Text></Pressable><Pressable accessibilityRole="button" disabled={busy} onPress={() => run(importBook)} style={[styles.secondary, busy && styles.disabled]}><Text style={styles.secondaryText}>＋  Audiobook</Text></Pressable></View>
    {loading ? <Text style={styles.state}>Opening your shelves…</Text> : error ? <Pressable accessibilityRole="button" onPress={() => refresh().catch(() => {})}><Text style={styles.state}>{error}  RETRY ↗</Text></Pressable> : null}
    <View style={styles.sectionHead}><View><Text style={styles.sectionKicker}>YOUR NEXT CHAPTER</Text><Text style={styles.sectionTitle}>On the shelf</Text></View><Text style={styles.count}>{pdfs.length + books.length} ITEMS</Text></View>
    {pdfs.length + books.length === 0 ? <View style={styles.emptyBox}><Text style={styles.emptyTitle}>A shelf of your own.</Text><Empty>Bring in a PDF or audiobook to get started.</Empty></View> : <View style={styles.grid}>{pdfs.map((item, i) => <Cover key={`pdf-${item.id}`} title={item.title} kind="PDF" index={i} progress={`PAGE ${item.pageIndex + 1} · CONTINUE`} onPress={() => router.push({ pathname: '/pdf', params: { id: item.id } })}/>)}{books.map((item, i) => <Cover key={`audio-${item.id}`} title={item.title} kind="AUDIO" index={i + pdfs.length} progress={item.position ? `${Math.floor(item.position / 60)} MIN IN · RESUME` : undefined} onPress={() => router.push({ pathname: '/player', params: { id: item.id } })}/>)}</View>}
    <View style={styles.sectionHead}><View><Text style={styles.sectionKicker}>A FEW THINGS TO DISCOVER</Text><Text style={styles.sectionTitle}>Sample shelf</Text></View><Text style={styles.count}>{SAMPLE_LIBRARY.length} INCLUDED</Text></View>
    <View style={styles.sampleGrid}>{SAMPLE_LIBRARY.map((item, i) => <Pressable accessibilityRole="button" accessibilityLabel={`${item.kind === 'audio' ? 'Play' : 'Read'} sample: ${item.title}`} onPress={() => run(async () => { const opened = await openSample(item); router.push({ pathname: item.kind === 'audio' ? '/player' : '/pdf', params: { id: opened.id } }); })} key={item.id} style={styles.sampleCard}>
      <Image source={item.coverAsset} style={styles.sampleCover} resizeMode="cover" />
      <Text style={styles.sampleKind}>{item.kind === 'audio' ? 'AUDIO SAMPLE' : 'READING SAMPLE'} · INCLUDED</Text>
      <Text style={styles.sampleTitle}>{item.title}</Text><Text style={styles.sampleAuthor}>{item.author}</Text>
      <Text style={styles.sampleStatus}>{item.kind === 'audio' ? 'TAP TO PLAY  ↗' : 'TAP TO READ  ↗'}</Text>
      <Text style={styles.sampleAttribution}>{item.attribution}</Text>
      <Text style={styles.sampleBlocker}>{item.rights}</Text>
      <Text style={styles.sampleSource}>{item.sourceName}</Text>
    </Pressable>)}</View>
    <View style={styles.importNote}><Text style={styles.noteKicker}>MAKE YOURSELF AT HOME</Text><Text style={styles.noteTitle}>Your next good thing is one import away.</Text><Text style={styles.noteBody}>Choose a PDF from Files, or bring an audiobook along for the ride.</Text></View>
    <View style={styles.urlRow}><Text style={styles.urlTitle}>AUDIO FROM A LINK</Text><View style={styles.urlInputRow}><TextInput accessibilityLabel="Direct HTTPS audiobook URL" style={styles.urlInput} autoCapitalize="none" keyboardType="url" placeholder="Paste an HTTPS audio URL" placeholderTextColor={colors.muted} value={url} onChangeText={setUrl}/><Pressable accessibilityRole="button" disabled={busy || !url.trim()} onPress={() => run(async () => { await downloadBook(url.trim()); setUrl(''); })} style={styles.linkButton}><Text style={styles.linkText}>{busy ? 'ADDING…' : 'SAVE  ↗'}</Text></Pressable></View></View>
    <View style={styles.footer}><Pressable accessibilityRole="button" onPress={() => router.push('/voices')}><Text style={styles.footerLink}>NARRATORS  ↗</Text></Pressable><Pressable accessibilityRole="button" onPress={() => router.push('/settings')}><Text style={styles.footerLink}>SETTINGS  ↗</Text></Pressable><Text style={styles.footerMark}>KENNI  ·  READ AT YOUR OWN PACE</Text></View>
  </ScrollView>;
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background }, content: { padding: spacing.page, paddingTop: 20, paddingBottom: 54 },
  masthead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: 10 }, profile: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 8 }, profileText: { color: colors.accent, fontSize: 10, fontWeight: '800', letterSpacing: 1.2 },
  intro: { paddingTop: 43, paddingBottom: 29 }, eyebrow: { color: colors.accent, fontSize: 10, fontWeight: '800', letterSpacing: 2.3 }, heading: { color: colors.text, fontSize: 48, fontWeight: '300', letterSpacing: -2.6, marginTop: 12 }, headingDot: { color: colors.accent, fontWeight: '500' }, subtitle: { color: colors.muted, fontSize: 15, marginTop: 7, letterSpacing: 0.3 },
  actions: { flexDirection: 'row', gap: 10, marginBottom: 24 }, primary: { flex: 1.15, minHeight: 52, borderRadius: 5, backgroundColor: colors.accent, justifyContent: 'center', alignItems: 'center' }, primaryText: { color: '#130D18', fontSize: 14, fontWeight: '800' }, secondary: { flex: 1, minHeight: 52, borderRadius: 5, borderWidth: 1, borderColor: colors.border, justifyContent: 'center', alignItems: 'center' }, secondaryText: { color: colors.text, fontSize: 13, fontWeight: '700' }, disabled: { opacity: 0.5 },
  state: { color: colors.muted, paddingTop: 18, fontSize: 13 },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 39, marginBottom: 20 }, sectionKicker: { color: colors.accent, fontWeight: '800', letterSpacing: 1.6, fontSize: 9 }, sectionTitle: { color: colors.text, fontSize: 27, fontWeight: '400', letterSpacing: -0.8, marginTop: 5 }, count: { color: colors.muted, fontSize: 9, letterSpacing: 1.1, paddingBottom: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 23 }, coverPress: { width: '47%', marginBottom: 2 }, cover: { height: 214, borderRadius: 3, padding: 14, justifyContent: 'space-between', overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.38, shadowRadius: 11, shadowOffset: { width: 0, height: 8 }, elevation: 5 }, coverRule: { position: 'absolute', left: 22, top: 0, height: '100%', width: 1, backgroundColor: 'rgba(255,255,255,0.15)' }, coverKind: { color: 'rgba(255,255,255,0.76)', fontSize: 8, letterSpacing: 1.5, fontWeight: '800', marginLeft: 10 }, coverTitle: { color: '#FFF9F1', fontSize: 23, lineHeight: 27, fontWeight: '500', letterSpacing: -0.7, marginLeft: 10 }, coverBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginLeft: 10 }, coverInitial: { color: 'rgba(255,255,255,0.72)', fontSize: 25, fontWeight: '300' }, coverAction: { color: '#FFF9F1', fontSize: 8, fontWeight: '800', letterSpacing: 1 }, itemTitle: { color: colors.text, fontSize: 14, fontWeight: '600', marginTop: 10 }, itemMeta: { color: colors.muted, fontSize: 8, letterSpacing: 1, marginTop: 4 },
  emptyBox: { paddingVertical: 26, paddingHorizontal: 20, borderWidth: 1, borderColor: colors.border, borderRadius: 4 }, emptyTitle: { color: colors.text, fontSize: 21, fontWeight: '400', marginBottom: 7 }, empty: { color: colors.muted, fontSize: 13, lineHeight: 20 }, sampleGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 14 }, sampleCard: { width: '48%', padding: 12, borderWidth: 1, borderColor: colors.border, borderRadius: 4, backgroundColor: colors.surface }, sampleCover: { width: '100%', height: 104, marginBottom: 11, borderRadius: 2 }, sampleKind: { color: colors.accent, fontSize: 8, fontWeight: '800', letterSpacing: 1 }, sampleTitle: { color: colors.text, fontSize: 17, fontWeight: '700', marginTop: 7 }, sampleAuthor: { color: colors.muted, fontSize: 11, marginTop: 3 }, sampleStatus: { color: colors.accent, fontSize: 9, fontWeight: '800', marginTop: 10 }, sampleAttribution: { color: colors.text, fontSize: 10, lineHeight: 15, marginTop: 8 }, sampleBlocker: { color: colors.muted, fontSize: 9, lineHeight: 14, marginTop: 7 }, sampleSource: { color: colors.muted, fontSize: 8, lineHeight: 12, marginTop: 9 }, importNote: { marginTop: 42, padding: 21, backgroundColor: colors.surface, borderLeftWidth: 2, borderLeftColor: colors.accent }, noteKicker: { color: colors.accent, fontSize: 9, fontWeight: '800', letterSpacing: 1.5 }, noteTitle: { color: colors.text, fontSize: 19, fontWeight: '500', lineHeight: 25, marginTop: 12 }, noteBody: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 7 },
  urlRow: { paddingTop: 22 }, urlTitle: { color: colors.muted, fontSize: 9, fontWeight: '800', letterSpacing: 1.2 }, urlInputRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6, borderBottomWidth: 1, borderBottomColor: colors.border }, urlInput: { flex: 1, color: colors.text, fontSize: 13, paddingVertical: 10 }, linkButton: { minHeight: 38, justifyContent: 'center', paddingHorizontal: 9 }, linkText: { color: colors.accent, fontSize: 10, fontWeight: '800', letterSpacing: 1 }, footer: { borderTopWidth: 1, borderTopColor: colors.border, marginTop: 31, paddingTop: 20, flexDirection: 'row', flexWrap: 'wrap', gap: 24 }, footerLink: { color: colors.accent, fontSize: 9, fontWeight: '800', letterSpacing: 1.1, paddingVertical: 8 }, footerMark: { width: '100%', color: colors.muted, fontSize: 8, letterSpacing: 1, marginTop: 9 },
});
