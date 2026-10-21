# Kenni bundled sample content

## Included works

The offline sample shelf contains the original Kenni story and audio edition, plus ten distinct short PDF opening excerpts generated from Project Gutenberg plain-text editions. Each PDF is a separate bundled file and has its own stable sample ID, title, author, and PDF-library entry. Selecting a card copies that exact PDF to the device cache and opens it in Kenni's existing reader. The excerpts contain multiple pages of readable book text; the app does not download content when a sample is opened.

| Work | Author | Gutenberg eBook | Exact plain-text source | Rights evidence |
| --- | --- | ---: | --- | --- |
| Alice's Adventures in Wonderland | Lewis Carroll | 11 | https://www.gutenberg.org/cache/epub/11/pg11.txt | https://www.gutenberg.org/ebooks/11 |
| Frankenstein | Mary Shelley | 84 | https://www.gutenberg.org/cache/epub/84/pg84.txt | https://www.gutenberg.org/ebooks/84 |
| A Tale of Two Cities | Charles Dickens | 98 | https://www.gutenberg.org/cache/epub/98/pg98.txt | https://www.gutenberg.org/ebooks/98 |
| Pride and Prejudice | Jane Austen | 1342 | https://www.gutenberg.org/cache/epub/1342/pg1342.txt | https://www.gutenberg.org/ebooks/1342 |
| The Adventures of Sherlock Holmes | Arthur Conan Doyle | 1661 | https://www.gutenberg.org/cache/epub/1661/pg1661.txt | https://www.gutenberg.org/ebooks/1661 |
| The Adventures of Tom Sawyer | Mark Twain | 74 | https://www.gutenberg.org/cache/epub/74/pg74.txt | https://www.gutenberg.org/ebooks/74 |
| The Secret Garden | Frances Hodgson Burnett | 145 | https://www.gutenberg.org/cache/epub/145/pg145.txt | https://www.gutenberg.org/ebooks/145 |
| The Time Machine | H. G. Wells | 35 | https://www.gutenberg.org/cache/epub/35/pg35.txt | https://www.gutenberg.org/ebooks/35 |
| Treasure Island | Robert Louis Stevenson | 120 | https://www.gutenberg.org/cache/epub/120/pg120.txt | https://www.gutenberg.org/ebooks/120 |
| The Wonderful Wizard of Oz | L. Frank Baum | 55 | https://www.gutenberg.org/cache/epub/55/pg55.txt | https://www.gutenberg.org/ebooks/55 |

Project Gutenberg's individual catalog pages identify these source editions as public domain in the USA. Its [license](https://www.gutenberg.org/policy/license) explains that the underlying texts not restricted by US copyright law may be copied and used to make derivative works in the United States, while its [permissions guidance](https://www.gutenberg.org/policy/permission) cautions that copyright status must be checked in other countries. Kenni therefore describes the rights as US public domain; distribution elsewhere should be checked against local law.

The packaged PDFs are reformatted opening excerpts, not full-book editions. They contain the title, author, a generic excerpt label, and the opening source text. The source headers, Project Gutenberg name, and license boilerplate are omitted from the generated excerpt PDFs. Source eBook identifiers and links are retained here for traceability. The short PDFs total approximately 175 KB.

To recreate the excerpt PDFs, place each source text at `assets/samples/public-domain/<slug>.source.txt` using the exact source URLs above, then run `node scripts/create-public-domain-samples.mjs`. The script wraps the opening text into compact paginated PDFs in the same folder.

The original Kenni work remains `assets/samples/the-lantern-at-low-tide.pdf`, `.wav`, and `.txt`; its story, PDF layout, cover, and local synthetic narration were created for Kenni. It is separate from the ten public-domain excerpts.

## Runtime and verification boundary

`src/sampleLibrary.ts` maps every public-domain card to its own statically bundled PDF and registers each under a distinct ID with `src/pdfLibrary.ts`. The established `/pdf` reader route provides page navigation, text extraction, and narration. PDFs are bundled offline, so opening a card does not need network access. TypeScript verification checks the app wiring; native PDFKit extraction and device rendering still require a compatible iOS build/device and are not claimed as runtime-tested here.
