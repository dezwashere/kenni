import { Stack } from 'expo-router';
export default function Layout() {
 return <Stack screenOptions={{ headerStyle: { backgroundColor: '#FFD500' }, headerTintColor: '#111', contentStyle: { backgroundColor: '#FFD500' }, headerTitleStyle: { fontWeight: '800' } }} />;
}