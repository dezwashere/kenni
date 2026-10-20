# Kenni bundled sample content

## Included works

The sample shelf bundles two tap-to-open editions of the same short original story, *The Lantern at Low Tide*:

- `assets/samples/the-lantern-at-low-tide.pdf` — one-page PDF; added to the PDF library and opened with the existing PDF reader.
- `assets/samples/the-lantern-at-low-tide.wav` — short spoken edition; added to the audio library and opened with the existing audiobook player.
- `assets/samples/the-lantern-at-low-tide.txt` — canonical story text and in-file attribution.
- `assets/sample-cover.png` and `assets/sample-cover.svg` — original cover artwork created for this work (PNG is the native app image; SVG is its editable source).

The story, PDF layout, cover, and narration were created locally for Kenni. The WAV uses the Windows on-device SAPI synthetic voice; it contains no LibriVox performance or third-party recording. The sample is available without subscription or network access. The files are original sample content; their author retains copyright, while Kenni includes them in the app as a complimentary demonstration.

`src/sampleLibrary.ts` defines the shelf records and copies the packaged media into app cache on first selection. It registers the item in the same local library used by imported works, so existing progress/resume and reader/player routes apply. `scripts/create-sample-pdf.mjs` recreates the PDF from the canonical text. The WAV was synthesized locally and is not produced by that script.

## Rights and source evidence

No third-party text, artwork, audiobook recording, or public-domain source is included. Source and rights evidence for the bundled files is the repository itself: the story source above identifies its creation and author; the cover is original vector artwork; the PDF is generated from that text; and the narration is a local synthetic-voice rendering of the same text. There is consequently no external license or public-domain claim for these assets. The author retains copyright.

## Limitation

The audiobook file is WAV rather than a compressed format, so it uses more bundle storage. Device playback, native PDFKit extraction, and voice rendering have not been runtime-tested here; the requested typecheck only verifies the TypeScript source. The iOS PDF route still depends on the project's native PDF module and cannot run in Expo Go.
