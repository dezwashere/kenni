import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const books = [
  ['alice', 'Alice Adventures in Wonderland', 'Lewis Carroll'],
  ['frankenstein', 'Frankenstein', 'Mary Shelley'],
  ['tale-two-cities', 'A Tale of Two Cities', 'Charles Dickens'],
  ['pride-prejudice', 'Pride and Prejudice', 'Jane Austen'],
  ['sherlock-holmes', 'The Adventures of Sherlock Holmes', 'Arthur Conan Doyle'],
  ['tom-sawyer', 'The Adventures of Tom Sawyer', 'Mark Twain'],
  ['secret-garden', 'The Secret Garden', 'Frances Hodgson Burnett'],
  ['time-machine', 'The Time Machine', 'H. G. Wells'],
  ['treasure-island', 'Treasure Island', 'Robert Louis Stevenson'],
  ['wonderful-wizard', 'The Wonderful Wizard of Oz', 'L. Frank Baum'],
];

const ascii = (value) => value.normalize('NFKD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[’‘]/g, "'").replace(/[“”]/g, '"')
  .replace(/[—–]/g, '-').replace(/…/g, '...')
  .replace(/[^\x20-\x7E]/g, '');
const escapePdf = (value) => ascii(value)
  .replaceAll('\\', '\\\\').replaceAll('(', '\\(').replaceAll(')', '\\)');

for (const [slug, title, author] of books) {
  const source = await readFile(path.join(root, 'assets/samples/public-domain', `${slug}.source.txt`), 'utf8');
  const start = source.search(/\*\*\* START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*\*\*\*/i);
  let body = start >= 0 ? source.slice(source.indexOf('\n', start) + 1) : source;
  const end = body.search(/\*\*\* END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK/i);
  if (end >= 0) body = body.slice(0, end);
  body = body.replace(/^\s+/, '').slice(0, 13000);

  const lines = [`${title}`, `by ${author}`, '', 'Public-domain opening excerpt', '']
    .concat(body.split(/\r?\n/).flatMap((line) => {
      const clean = ascii(line).trim();
      if (!clean) return [''];
      const wrapped = [];
      let current = '';
      for (const word of clean.split(/\s+/)) {
        if (current && `${current} ${word}`.length > 84) {
          wrapped.push(current);
          current = word;
        } else current = current ? `${current} ${word}` : word;
      }
      wrapped.push(current);
      return wrapped;
    }));
  const pages = [];
  for (let i = 0; i < lines.length; i += 48) pages.push(lines.slice(i, i + 48));

  const objects = [];
  objects[1] = '<< /Type /Catalog /Pages 2 0 R >>';
  objects[2] = `<< /Type /Pages /Kids [${pages.map((_, i) => `${4 + i * 2} 0 R`).join(' ')}] /Count ${pages.length} >>`;
  objects[3] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>';
  pages.forEach((pageLines, index) => {
    const pageId = 4 + index * 2;
    const contentId = pageId + 1;
    objects[pageId] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 3 0 R >> >> /Contents ${contentId} 0 R >>`;
    const commands = ['BT', '/F1 10 Tf', '50 750 Td', '13 TL',
      ...pageLines.flatMap((line) => [`(${escapePdf(line)}) Tj`, 'T*']), 'ET'].join('\n');
    objects[contentId] = `<< /Length ${Buffer.byteLength(commands, 'ascii')} >>\nstream\n${commands}\nendstream`;
  });

  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  for (let i = 1; i < objects.length; i++) {
    offsets[i] = Buffer.byteLength(pdf, 'ascii');
    pdf += `${i} 0 obj\n${objects[i]}\nendobj\n`;
  }
  const xref = Buffer.byteLength(pdf, 'ascii');
  pdf += `xref\n0 ${objects.length}\n0000000000 65535 f \n`;
  for (let i = 1; i < objects.length; i++) pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  pdf += `trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;

  await writeFile(path.join(root, 'assets/samples/public-domain', `${slug}.pdf`), pdf, 'ascii');
  console.log(`${slug}\t${pages.length} pages\t${Buffer.byteLength(pdf)} bytes`);
}
