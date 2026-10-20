import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';

export type PdfBook = { id: string; title: string; uri: string; addedAt: number; pageIndex: number };
const KEY = 'kenni:pdf-library:v1';
export async function getPdfBooks(): Promise<PdfBook[]> {
  try { return JSON.parse((await AsyncStorage.getItem(KEY)) || '[]'); } catch { return []; }
}
export async function importPdf(): Promise<PdfBook | null> {
  const picked = await DocumentPicker.getDocumentAsync({ type: 'application/pdf', copyToCacheDirectory: true });
  if (picked.canceled || !picked.assets?.[0]) return null;
  const asset = picked.assets[0];
  if (!asset.name.toLowerCase().endsWith('.pdf')) throw new Error('Select a PDF file');
  const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  const dir = FileSystem.documentDirectory + 'pdfs/';
  await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
  const uri = dir + id + '.pdf';
  await FileSystem.copyAsync({ from: asset.uri, to: uri });
  const book = { id, title: asset.name.replace(/\.pdf$/i, ''), uri, addedAt: Date.now(), pageIndex: 0 };
  await AsyncStorage.setItem(KEY, JSON.stringify([book, ...await getPdfBooks()]));
  return book;
}
export async function savePdfPage(id: string, pageIndex: number) {
  const books = await getPdfBooks();
  await AsyncStorage.setItem(KEY, JSON.stringify(books.map(b => b.id === id ? { ...b, pageIndex } : b)));
}
