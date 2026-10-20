import { readFile, writeFile } from 'node:fs/promises';

const source = await readFile(new URL('../assets/samples/the-lantern-at-low-tide.txt', import.meta.url), 'utf8');
const lines = source.replace(/[^\x20-\x7E\n]/g, '').split(/\r?\n/).flatMap((line) => {
  if (!line) return [''];
  const words = line.split(/\s+/);
  const wrapped = [];
  let current = '';
  for (const word of words) {
    if (current && `${current} ${word}`.length > 76) {
      wrapped.push(current);
      current = word;
    } else current = current ? `${current} ${word}` : word;
  }
  wrapped.push(current);
  return wrapped;
});
const escape = (value) => value.replaceAll('\\', '\\\\').replaceAll('(', '\\(').replaceAll(')', '\\)');
const commands = ['BT', '/F1 11 Tf', '52 748 Td', '15 TL'];
for (const line of lines) commands.push(`(${escape(line)}) Tj`, 'T*');
commands.push('ET');
const stream = commands.join('\n');
const objects = [
  '<< /Type /Catalog /Pages 2 0 R >>',
  '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
  '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
  '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  `<< /Length ${Buffer.byteLength(stream, 'ascii')} >>\nstream\n${stream}\nendstream`,
];
let pdf = '%PDF-1.4\n';
const offsets = [0];
for (let i = 0; i < objects.length; i++) {
  offsets.push(Buffer.byteLength(pdf, 'ascii'));
  pdf += `${i + 1} 0 obj\n${objects[i]}\nendobj\n`;
}
const xref = Buffer.byteLength(pdf, 'ascii');
pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
for (const offset of offsets.slice(1)) pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
await writeFile(new URL('../assets/samples/the-lantern-at-low-tide.pdf', import.meta.url), pdf, 'ascii');
