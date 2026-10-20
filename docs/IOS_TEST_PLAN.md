# kenni iPhone verification checklist

## Build
1. Install dependencies with `npm install`.
2. Run `npx expo install --check` and resolve version mismatches.
3. Run `npm run typecheck`.
4. Build a custom development client: `npx eas build --platform ios --profile development`. Requires Expo and Apple signing setup. Do not use Expo Go for the local PDFKit module.
5. Install on an iPhone and verify the native `KenniPdf` module loads.

## PDF validation
- Import the user's 543-page *The Stained Man* PDF through Files.
- Open a text-based page; confirm method 'Text' and text is legible.
- Open cover or an image-only page; confirm method 'OCR' and no crash.
- Test pages 11, 21, 101, 301 and 501.
- Confirm no network requests are needed for reading or OCR.
- Close and reopen the app; confirm reading position is preserved.
- Import a second PDF with scanned text and check reading order.
- Try encrypted and malformed PDFs; verify helpful errors.
- Try large documents and confirm memory use is acceptable.

## Free narration
- Confirm the read-aloud button starts and stops speech without an access gate.
- Confirm continuous read-aloud advances through PDF pages and preserves reading progress.
- Confirm voice selection, speech progress, playback speed, and background behavior on a physical iPhone.

## Known gaps
- Current reader shows extracted text, not original page layout.
- Vision OCR fallback runs only when PDFKit finds no text; partial image-text pages need a later hybrid strategy.
- Multi-column PDFs may require smarter reading order.
- Not yet compiled or device-tested.
