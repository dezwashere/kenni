# Kenni sample library: sources and rights

## Strategy

Keep a small, reviewed catalog of individual works rather than treating an entire hosting site or collection as licensed. Store attribution, the exact source record, direct media URL, rights statement and evidence URL with each work. Only bundle a file after checking the individual file/item, the underlying text or performance, and the intended distribution territory. Prefer U.S. public-domain works and LibriVox recordings, while showing the territorial limitation to users. Do not use Project Gutenberg branded files in a commercial bundle without following its trademark/license terms; if using the underlying U.S. public-domain text, remove Gutenberg names, marks and license material and independently record provenance.

The catalog implementation in `src/sampleLibrary.ts` is metadata only and appears in the Library as a separate “Sample shelf.” Each card says “Sample link / not bundled”; these records are not tappable media and are not part of the imported local library. `bundled: false` means its remote candidate must not be represented as locally included content. Its cover points to an original Kenni placeholder (`assets/sample-placeholder.svg`), not source artwork. The placeholder is not a cover reproduction or an assertion about a source image's license. Imported local PDFs and audio keep their existing PDF reader and player routes.

## Reviewed candidate: audio

- Work: *The Yellow Wallpaper*, Charlotte Perkins Gilman.
- Recording: Michelle Sullivan, section 10 of LibriVox's *Ghost Story Collection 005*, 32:07.
- Catalog record: <https://librivox.org/ghost-story-collection-005/>. The page calls out “LibriVox recordings are Public Domain in the USA,” links this specific section's Play entry to the Internet Archive MP3, and lists its reader, author, title and runtime.
- Direct file URL (source candidate only; not downloaded): <https://archive.org/download/ghost_stories_005_librivox/yellow_wallpaper_gilman_ms.mp3>.
- LibriVox rights policy: <https://wiki.librivox.org/index.php?title=Copyright_and_Public_Domain>. It says all LibriVox recordings are public domain and volunteers release their recordings to the public domain. LibriVox's catalog page states the territorial caveat: public domain in the USA; verify local status elsewhere.
- Underlying text cross-check: <https://www.gutenberg.org/ebooks/1952> identifies the author and says “Public domain in the USA.”
- Scope: reasonable candidate for a U.S.-only sample distribution, with attribution. No audio file or source cover has been bundled. Before packaging, check the specific Internet Archive item's current file metadata/availability and ensure the app's distribution is limited or appropriately cleared for other territories.

## Reviewed candidate: PDF/text

- Project Gutenberg eBook 1952, *The Yellow Wallpaper*: <https://www.gutenberg.org/ebooks/1952>.
- Evidence: the item page identifies the author, publication context and U.S. public-domain status. The general license at <https://www.gutenberg.org/policy/license> distinguishes the underlying public-domain work from Gutenberg's protected marks and license. It permits redistribution of U.S. public-domain works after removal of Gutenberg references; retaining Gutenberg branding requires its terms, including verbatim file handling and additional conditions. Project Gutenberg terms at <https://www.gutenberg.org/policy/terms_of_use> warn against automated access and deep-linking to ebook files.
- Blocker: the reviewed ebook page advertises EPUB and text downloads, not a specific PDF. No PDF has been fabricated, converted or bundled. Find a specific public-domain PDF with compatible provenance/license before listing a downloadable PDF sample.

## Assets and attribution

The only added cover asset is `assets/sample-placeholder.svg`, an original geometric Kenni-style placeholder. It was created for this app and does not use source cover art, portraits, scans or logos. `src/sampleLibrary.ts` records title, author, reader, source, rights evidence, attribution, candidate media URL, territorial/blocker notes, and placeholder-cover status. Preserve this attribution with any later sample UI or distributed metadata.

## Primary-source evidence consulted

- LibriVox copyright and public-domain policy: <https://wiki.librivox.org/index.php?title=Copyright_and_Public_Domain> — recordings released to the public domain; catalog/site scope is public domain in the USA.
- LibriVox *Ghost Story Collection 005*: <https://librivox.org/ghost-story-collection-005/> — identifies the particular reader, section, text source and linked Archive MP3.
- Project Gutenberg eBook 1952: <https://www.gutenberg.org/ebooks/1952> — work metadata and explicit U.S. public-domain label.
- Project Gutenberg license: <https://www.gutenberg.org/policy/license> — distinguishes underlying text rights from the Gutenberg mark/license and describes redistribution conditions.
- Project Gutenberg terms: <https://www.gutenberg.org/policy/terms_of_use> — automated access and deep-linking limitations.

This is a conservative source review, not a legal opinion. Public-domain status is territory-specific; review the relevant territories before distributing content internationally.
