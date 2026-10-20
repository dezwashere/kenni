# kenni

iOS-only offline audiobook and PDF reading app. Bold yellow-and-black design.

## Features in source
- Import and play local audiobook audio files
- Download direct HTTPS audio files
- Import PDF documents from Files and save page position
- Native iOS PDFKit embedded text extraction, with Vision OCR fallback for image-only pages
- Extracted text reader for PDFs
- Premium PDF narration entry point intentionally disabled pending verified App Store subscription integration ($2.99/month)

## iOS native build required
The local Expo module at `modules/kenni-pdf` uses PDFKit and Vision. **Expo Go cannot run this module.** Use a custom iOS development build after installing dependencies and generating native projects. The PDF reader currently shows extracted text, not a rendered facsimile of the PDF page. Page OCR is performed only when no embedded text is found.

## Not yet complete
Not compiled or device tested. Continuous PDF narration, StoreKit purchases/entitlement verification, true page rendering, robust OCR reading order, chapter navigation, and background speech need implementation. No subscription charge is active. Torrent support is not implemented. Only import books you are permitted to use.
