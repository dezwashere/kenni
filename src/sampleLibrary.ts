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
  contentAsset?: number;
};

const cover = require('../assets/sample-cover.png');
const audioAsset = require('../assets/samples/the-lantern-at-low-tide.wav');
const publicDomainSamples = [
  { id: 'sample-alice', title: "Alice's Adventures in Wonderland", author: 'Lewis Carroll', sourceName: 'Opening excerpt · eBook 11', contentAsset: require('../assets/samples/public-domain/alice.pdf') },
  { id: 'sample-frankenstein', title: 'Frankenstein', author: 'Mary Shelley', sourceName: 'Opening excerpt · eBook 84', contentAsset: require('../assets/samples/public-domain/frankenstein.pdf') },
  { id: 'sample-tale-two-cities', title: 'A Tale of Two Cities', author: 'Charles Dickens', sourceName: 'Opening excerpt · eBook 98', contentAsset: require('../assets/samples/public-domain/tale-two-cities.pdf') },
  { id: 'sample-pride-prejudice', title: 'Pride and Prejudice', author: 'Jane Austen', sourceName: 'Opening excerpt · eBook 1342', contentAsset: require('../assets/samples/public-domain/pride-prejudice.pdf') },
  { id: 'sample-sherlock-holmes', title: 'The Adventures of Sherlock Holmes', author: 'Arthur Conan Doyle', sourceName: 'Opening excerpt · eBook 1661', contentAsset: require('../assets/samples/public-domain/sherlock-holmes.pdf') },
  { id: 'sample-tom-sawyer', title: 'The Adventures of Tom Sawyer', author: 'Mark Twain', sourceName: 'Opening excerpt · eBook 74', contentAsset: require('../assets/samples/public-domain/tom-sawyer.pdf') },
  { id: 'sample-secret-garden', title: 'The Secret Garden', author: 'Frances Hodgson Burnett', sourceName: 'Opening excerpt · eBook 145', contentAsset: require('../assets/samples/public-domain/secret-garden.pdf') },
  { id: 'sample-time-machine', title: 'The Time Machine', author: 'H. G. Wells', sourceName: 'Opening excerpt · eBook 35', contentAsset: require('../assets/samples/public-domain/time-machine.pdf') },
  { id: 'sample-treasure-island', title: 'Treasure Island', author: 'Robert Louis Stevenson', sourceName: 'Opening excerpt · eBook 120', contentAsset: require('../assets/samples/public-domain/treasure-island.pdf') },
  { id: 'sample-wonderful-wizard', title: 'The Wonderful Wizard of Oz', author: 'L. Frank Baum', sourceName: 'Opening excerpt · eBook 55', contentAsset: require('../assets/samples/public-domain/wonderful-wizard.pdf') },
].map((work) => ({
  ...work,
  kind: 'pdf' as const,
  rights: 'Public domain in the United States; source text reformatted as a short PDF excerpt.',
  attribution: `Text: ${work.author}; US public-domain source ${work.sourceName.match(/\d+$/)?.[0]}.`,
  coverAsset: cover,
}));

export const SAMPLE_LIBRARY: SampleWork[] = [
  { id: 'sample-lantern-pdf', title: 'The Lantern at Low Tide', author: 'Kenni original', kind: 'pdf', sourceName: 'Original short story', rights: 'Written for Kenni; all text and artwork original.', attribution: 'Story and PDF edition by Kenni.', coverAsset: cover },
  { id: 'sample-lantern-audio', title: 'The Lantern at Low Tide', author: 'Kenni original', kind: 'audio', duration: 'about 1 min', sourceName: 'Original audiobook sample', rights: 'Written and narrated for Kenni; all text, narration and artwork original.', attribution: 'Story by Kenni; narrated with an on-device synthetic voice.', coverAsset: cover },
  ...publicDomainSamples,
];

export async function openSample(item: SampleWork): Promise<PdfBook | Book> {
  const asset = item.kind === 'pdf' ? item.contentAsset ?? require('../assets/samples/the-lantern-at-low-tide.pdf') : audioAsset;
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
