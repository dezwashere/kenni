/** Curated source records for the Kenni sample shelf. No media is bundled yet. */
export type SampleWork = {
  id: string;
  title: string;
  author: string;
  reader: string;
  language: string;
  kind: 'audio' | 'pdf';
  duration?: string;
  sourceName: string;
  sourceUrl: string;
  mediaUrl: string;
  rights: string;
  rightsUrl: string;
  attribution: string;
  bundled: false;
  coverAsset: string;
  coverRights: 'Kenni original placeholder; no third-party artwork copied';
  blocker?: string;
};

export const SAMPLE_COVER_PLACEHOLDER = require('../assets/sample-placeholder.svg');

export const SAMPLE_LIBRARY: SampleWork[] = [
  {
    id: 'yellow-wallpaper-librivox-michelle-sullivan',
    title: 'The Yellow Wallpaper',
    author: 'Charlotte Perkins Gilman',
    reader: 'Michelle Sullivan',
    language: 'English',
    kind: 'audio',
    duration: '32:07',
    sourceName: 'LibriVox, Ghost Story Collection 005 (section 10)',
    sourceUrl: 'https://librivox.org/ghost-story-collection-005/',
    mediaUrl: 'https://archive.org/download/ghost_stories_005_librivox/yellow_wallpaper_gilman_ms.mp3',
    rights: 'LibriVox states its recordings are public domain in the USA. Its catalog identifies this specific recording, reader, work and duration. The source work is separately marked public domain in the USA by Project Gutenberg.',
    rightsUrl: 'https://wiki.librivox.org/index.php?title=Copyright_and_Public_Domain',
    attribution: 'The Yellow Wallpaper by Charlotte Perkins Gilman; read by Michelle Sullivan; LibriVox recording, Ghost Story Collection 005, section 10. Public domain in the USA. Recording source: Internet Archive.',
    bundled: false,
    coverAsset: 'assets/sample-placeholder.svg',
    coverRights: 'Kenni original placeholder; no third-party artwork copied',
    blocker: 'Remote audio is listed as a source candidate but is not bundled or downloaded. Validate the specific Internet Archive file metadata and availability before packaging; country-specific rights may differ.'
  },
  {
    id: 'yellow-wallpaper-project-gutenberg-1952',
    title: 'The Yellow Wallpaper',
    author: 'Charlotte Perkins Gilman',
    reader: 'Text edition: Project Gutenberg volunteers',
    language: 'English',
    kind: 'pdf',
    sourceName: 'Project Gutenberg eBook 1952',
    sourceUrl: 'https://www.gutenberg.org/ebooks/1952',
    mediaUrl: 'https://www.gutenberg.org/ebooks/1952',
    rights: 'The Project Gutenberg catalog page labels this work “Public domain in the USA.” Project Gutenberg says the underlying unrestricted US public-domain text can be redistributed in the USA after removing its protected name, trademark and license material; its site terms discourage automated access and deep links to ebook files.',
    rightsUrl: 'https://www.gutenberg.org/policy/license',
    attribution: 'The Yellow Wallpaper by Charlotte Perkins Gilman, Project Gutenberg eBook 1952 (work public domain in the USA). This is a source record only; no Project Gutenberg branded file is bundled.',
    bundled: false,
    coverAsset: 'assets/sample-placeholder.svg',
    coverRights: 'Kenni original placeholder; no third-party artwork copied',
    blocker: 'No PDF is listed as verified or bundled. The catalog currently offers EPUB and text formats; identify an individual PDF with explicit rights before adding a PDF sample.'
  }
];
