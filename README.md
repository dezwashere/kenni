# kenni

iOS audiobook and PDF reader, using a bold yellow-and-black design.

## Implemented in source
- Import audio and PDF files from iPhone Files
- Download direct HTTPS audiobook files and play audio offline
- Store PDFs locally and resume from last reading page
- Native PDFKit text extraction, with Apple Vision OCR for image-only pages
- Read extracted PDF text with a simple accessible reader
- Continuous PDF text-to-speech across pages with playback speed and stop controls
- Device voice catalog, searchable narrator selection, free voice previews and saved preference

## Required setup
1. Run `npm install` and `npx expo install --check`, then resolve dependency mismatches.
2. Run `npm run typecheck`.
3. Set up Apple Developer signing and EAS credentials.
4. Run `npx eas build --platform ios --profile development` and test on a physical iPhone. The local PDFKit/Vision module **cannot run in Expo Go**.
5. Follow `docs/IOS_TEST_PLAN.md`.

## Known limitations
**Not yet compiled or tested on a device.** The app cannot be called release-ready. The PDF reader displays extracted text rather than the original PDF page layout. OCR is only invoked for pages without any embedded text, so mixed pages and multi-column layouts need additional work. Speech may be interrupted when the app backgrounds; background narration needs native testing and refinement.

No torrent/magnet downloader or searchable book catalog has been implemented. Import only material you are permitted to access.
