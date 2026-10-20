import { Image, ImageStyle, StyleSheet } from 'react-native';

const approvedLockup = require('../assets/kenni-approved-lockup.png');

export function Brand({ compact = false, style }: { compact?: boolean; style?: ImageStyle }) {
  return <Image source={approvedLockup} resizeMode="contain" accessibilityLabel="kenni approved wordmark and icon" style={[styles.approvedLogo, compact ? styles.compactLogo : styles.fullLogo, style]} />;
}

const styles = StyleSheet.create({
  lockup: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  approvedLogo: { marginLeft: -10 },
  fullLogo: { width: 290, height: 92 },
  compactLogo: { width: 210, height: 68 },
});
