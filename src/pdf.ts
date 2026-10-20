import { requireNativeModule } from 'expo-modules-core';

type PageResult = { text: string; method: 'embedded' | 'ocr'; pageIndex: number };
type PdfModule = {
  pageCount(uri: string): Promise<number>;
  readPage(uri: string, pageIndex: number): Promise<PageResult>;
};
const native: PdfModule = requireNativeModule<PdfModule>('KenniPdf');

export const pdfPageCount = (uri: string) => native.pageCount(uri);
export const pdfReadPage = (uri: string, pageIndex: number) => native.readPage(uri, pageIndex);
