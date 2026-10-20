import { Image, ImageStyle, StyleSheet, Text, View } from 'react-native';
import { colors } from './theme';

const approvedLockup = require('../assets/kenni-approved-lockup.png');

export function KenniIcon({ size = 44 }: { size?: number }) {
  return <View style={[styles.icon, { width: size, height: size, borderRadius: size * 0.22 }]} accessibilityLabel="kenni open book icon">
    <View style={[styles.page, styles.leftPage, { width: size * 0.24, height: size * 0.56, left: size * 0.23, top: size * 0.2 }]} />
    <View style={[styles.page, styles.rightPage, { width: size * 0.24, height: size * 0.56, right: size * 0.23, top: size * 0.2 }]} />
    <View style={[styles.ray, { width: size * 0.07, height: size * 0.25, right: size * 0.21, top: size * 0.13, transform: [{ rotate: '38deg' }] }]} />
    <View style={[styles.ray, { width: size * 0.07, height: size * 0.22, right: size * 0.12, top: size * 0.19, transform: [{ rotate: '55deg' }] }]} />
    <View style={[styles.ray, { width: size * 0.07, height: size * 0.18, right: size * 0.07, top: size * 0.3, transform: [{ rotate: '72deg' }] }]} />
  </View>;
}

export function Brand({ compact = false, style }: { compact?: boolean; style?: ImageStyle }) {
  return <Image source={approvedLockup} resizeMode="contain" accessibilityLabel="kenni approved wordmark and icon" style={[styles.approvedLogo, compact ? styles.compactLogo : styles.fullLogo, style]} />;
}

const styles = StyleSheet.create({
  lockup: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  approvedLogo: { marginLeft: -10 },
  fullLogo: { width: 290, height: 150 },
  compactLogo: { width: 210, height: 112 },
  icon: { backgroundColor: colors.yellow, alignItems: 'center', justifyContent: 'center' },
  page: { position: 'absolute', backgroundColor: colors.background, borderRadius: 4 },
  leftPage: { transform: [{ rotate: '-14deg' }] },
  rightPage: { transform: [{ rotate: '14deg' }] },
  ray: { position: 'absolute', backgroundColor: colors.background, borderRadius: 4 },
  wordmark: { color: colors.text, fontSize: 38, fontWeight: '900', letterSpacing: -2.4 },
  compactWordmark: { fontSize: 25, letterSpacing: -1.6 },
});
