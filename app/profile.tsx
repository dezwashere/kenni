import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { colors } from '../src/theme';
import { Brand } from '../src/Brand';

export default function Profile() {
  return (
    <View style={s.page}>
      <View style={s.header}>
        <Brand compact />
        <Text style={s.eyebrow}>YOUR SPACE</Text>
      </View>
      <View style={s.hero}>
        <View style={s.mark}><Text style={s.markText}>k</Text></View>
        <Text style={s.title}>Your kenni</Text>
        <Text style={s.sub}>A private, offline-first reading space.</Text>
      </View>
      <View style={s.card}>
        <Text style={s.cardTitle}>Made for your stories</Text>
        <Text style={s.cardText}>Your imported books and reading progress stay on this device.</Text>
      </View>
      <Pressable accessibilityRole="button" style={s.link} onPress={() => router.push('/settings')}>
        <View><Text style={s.linkTitle}>Settings and app info</Text><Text style={s.linkSub}>Narrator voice and preferences</Text></View>
        <Text style={s.arrow}>›</Text>
      </Pressable>
      <Pressable accessibilityRole="button" style={s.back} onPress={() => router.replace('/')}>
        <Text style={s.backText}>Back to your library</Text>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background, padding: 22 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  eyebrow: { color: colors.yellow, fontSize: 11, fontWeight: '900', letterSpacing: 1.5 },
  hero: { alignItems: 'center', paddingVertical: 38 },
  mark: { width: 76, height: 76, borderRadius: 24, backgroundColor: colors.yellow, alignItems: 'center', justifyContent: 'center' },
  markText: { color: colors.background, fontSize: 42, fontWeight: '900' },
  title: { color: colors.text, fontSize: 30, fontWeight: '900', marginTop: 20 },
  sub: { color: colors.muted, marginTop: 8, textAlign: 'center', lineHeight: 21 },
  card: { backgroundColor: colors.surface, borderRadius: 18, padding: 19, borderWidth: 1, borderColor: colors.border },
  cardTitle: { color: colors.text, fontWeight: '800', fontSize: 16 },
  cardText: { color: colors.muted, marginTop: 8, lineHeight: 21 },
  link: { marginTop: 14, padding: 18, minHeight: 76, borderRadius: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  linkTitle: { color: colors.text, fontWeight: '800', fontSize: 15 },
  linkSub: { color: colors.muted, fontSize: 12, marginTop: 5 },
  arrow: { color: colors.yellow, fontSize: 28 },
  back: { marginTop: 'auto', minHeight: 52, alignItems: 'center', justifyContent: 'center', borderRadius: 15, borderWidth: 1, borderColor: colors.yellow },
  backText: { color: colors.yellow, fontWeight: '800' },
});
