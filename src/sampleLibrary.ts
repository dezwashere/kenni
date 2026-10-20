import * as FileSystem from 'expo-file-system/legacy';
import { Asset } from 'expo-asset';
import { addBundledBook, type Book } from './library';
import { addBundledPdf, type PdfBook } from './pdfLibrary';

export type SampleWork = {
  id: string;
  title: string;
  author: string;
  kind: 'audio' | 'pdf';
  duration?: string;
  sourceName: string;
  rights: string;
  attribution: string;
  coverAsset: number;
};

const cover = require('../assets/sample-cover.png');
const pdfAsset = require('../assets/samples/the-lantern-at-low-tide.pdf');
const audioAsset = require('../assets/samples/the-lantern-at-low-tide.wav');

export const SAMPLE_LIBRARY: SampleWork[] = [
  { id: 'sample-lantern-pdf', title: 'The Lantern at Low Tide', author: 'Kenni original', kind: 'pdf', sourceName: 'Original short story', rights: 'Written for Kenni; all text and artwork original.', attribution: 'Story and PDF edition by Kenni.', coverAsset: cover },
  { id: 'sample-lantern-audio', title: 'The Lantern at Low Tide', author: 'Kenni original', kind: 'audio', duration: 'about 1 min', sourceName: 'Original audiobook sample', rights: 'Written and narrated for Kenni; all text, narration and artwork original.', attribution: 'Story by Kenni; narrated with an on-device synthetic voice.', coverAsset: cover },
];

export async function openSample(item: SampleWork): Promise<PdfBook | Book> {
  const asset = item.kind === 'pdf' ? pdfAsset : audioAsset;
  const destinationDirectory = FileSystem.cacheDirectory + 'kenni-samples/';
  await FileSystem.makeDirectoryAsync(destinationDirectory, { intermediates: true });
  const extension = item.kind === 'pdf' ? 'pdf' : 'wav';
  const uri = destinationDirectory + item.id + '.' + extension;
  const info = await FileSystem.getInfoAsync(uri);
  if (!info.exists) {
    const bundled = Asset.fromModule(asset);
    await bundled.downloadAsync();
    if (!bundled.localUri) throw new Error('The sample could not be opened on this device.');
    await FileSystem.copyAsync({ from: bundled.localUri, to: uri });
  }
  const addedAt = Date.now();
  if (item.kind === 'pdf') {
    const book: PdfBook = { id: item.id, title: item.title, uri, addedAt, pageIndex: 0 };
    await addBundledPdf(book);
    return book;
  }
  const book: Book = { id: item.id, title: item.title, uri, addedAt, position: 0 };
  await addBundledBook(book);
  return book;
}
