import { Stack } from 'expo-router';
import { colors } from '../src/theme';
export default function Layout() {
 return <Stack screenOptions={{ headerStyle: { backgroundColor: colors.background }, headerTintColor: colors.text, contentStyle: { backgroundColor: colors.background }, headerTitleStyle: { fontWeight: '800' }, headerShadowVisible: false }} />;
}
