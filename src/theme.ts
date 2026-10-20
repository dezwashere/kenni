import { Platform } from 'react-native';
export const colors = { background: '#0D0B10', surface: '#17131C', accent: '#C79BEA', yellow: '#C79BEA', text: '#F5F0F7', muted: '#AAA2AF', border: '#342C3B' };
export const spacing = { page: 20 };
export const font = Platform.select({ ios: 'System', default: undefined });
