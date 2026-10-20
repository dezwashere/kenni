import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors } from './theme';

export function KenniIcon({ size = 44 }: { size?: number }) {
  return <View style={[styles.icon, { width: size, height: size, borderRadius: size * 0.22 }]} accessibilityLabel="kenni open book icon">
    <View style={[styles.page, styles.leftPage, { width: size * 0.24, height: size * 0.56, left: size * 0.23, top: size * 0.2 }]} />
    <View style={[styles.page, styles.rightPage, { width: size * 0.24, height: size * 0.56, right: size * 0.23, top: size * 0.2 }]} />
    <View style={[styles.ray, { width: size * 0.07, height: size * 0.25, right: size * 0.21, top: size * 0.13, transform: [{ rotate: '38deg' }] }]} />
    <View style={[styles.ray, { width: size * 0.07, height: size * 0.22, right: size * 0.12, top: size * 0.19, transform: [{ rotate: '55deg' }] }]} />
    <View style={[styles.ray, { width: size * 0.07, height: size * 0.18, right: size * 0.07, top: size * 0.3, transform: [{ rotate: '72deg' }] }]} />
  </View>;
}

export function Brand({ compact = false, style }: { compact?: boolean; style?: ViewStyle }) {
  const iconSize = compact ? 32 : 44;
  return <View style={[styles.lockup, style]} accessibilityLabel="kenni"><Text style={[styles.wordmark, compact && styles.compactWordmark]}>kenni</Text><KenniIcon size={iconSize}/></View>;
}

const styles = StyleSheet.create({
  lockup: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  icon: { backgroundColor: colors.yellow, alignItems: 'center', justifyContent: 'center' },
  page: { position: 'absolute', backgroundColor: colors.background, borderRadius: 4 },
  leftPage: { transform: [{ rotate: '-14deg' }] },
  rightPage: { transform: [{ rotate: '14deg' }] },
  ray: { position: 'absolute', backgroundColor: colors.background, borderRadius: 4 },
  wordmark: { color: colors.text, fontSize: 38, fontWeight: '900', letterSpacing: -2.4 },
  compactWordmark: { fontSize: 25, letterSpacing: -1.6 },
});
