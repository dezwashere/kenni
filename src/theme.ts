import { Platform } from 'react-native';
export const colors = { background: '#0B0C0E', surface: '#15171B', yellow: '#FFD500', text: '#F7F7F2', muted: '#A7A9AF', border: '#30333A' };
export const spacing = { page: 20 };
export const font = Platform.select({ ios: 'System', default: undefined });
