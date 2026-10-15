import fs from 'fs';
import zlib from 'zlib';

const pdfPath = 'public/uploads/accreditation/templates/Buku_Panduan_Penilaian_Instrumen_LAMEMBA_2026.pdf';
const buf = fs.readFileSync(pdfPath);

console.log('PDF total size:', buf.length);

// Let's find all FlateDecode streams and decompress them
let idx = 0;
let streamCount = 0;
let decompressedTexts = [];

while (idx < buf.length) {
  const streamMarker = buf.indexOf(Buffer.from('stream'), idx);
  if (streamMarker === -1) break;
  
  // Find start of stream data (after stream\r\n or stream\n)
  let dataStart = streamMarker + 6;
  if (buf[dataStart] === 0x0d && buf[dataStart + 1] === 0x0a) dataStart += 2;
  else if (buf[dataStart] === 0x0a) dataStart += 1;
  else if (buf[dataStart] === 0x0d) dataStart += 1;
  
  const endMarker = buf.indexOf(Buffer.from('endstream'), dataStart);
  if (endMarker === -1) break;
  
  const chunk = buf.subarray(dataStart, endMarker);
  try {
    const uncompressed = zlib.inflateSync(chunk);
    const text = uncompressed.toString('latin1');
    streamCount++;
    decompressedTexts.push(text);
  } catch (err) {
    // Might be raw Deflate without zlib wrapper (skip 0x78) or image data
    try {
      const rawDeflate = zlib.inflateRawSync(chunk);
      decompressedTexts.push(rawDeflate.toString('latin1'));
      streamCount++;
    } catch {}
  }
  
  idx = endMarker + 9;
}

console.log('Successfully decompressed streams:', streamCount);

// Let's search all decompressed streams for keywords
const fullText = decompressedTexts.join('\n');
console.log('Total decompressed text length:', fullText.length);

// Extract strings inside parentheses ( ... ) Tj or TJ
const tjMatches = fullText.match(/\(([^)]+)\)\s*Tj/g) || [];
console.log('Total text tokens:', tjMatches.length);

const cleanedTokens = tjMatches.map(m => m.replace(/^\(/, '').replace(/\)\s*Tj$/, ''));
const allWords = cleanedTokens.join(' ');
console.log('Preview first 2000 chars of extracted text:');
console.log(allWords.slice(0, 2000));

// Search for Kriteria, Dimensi, Indikator
const matchesKriteria = allWords.match(/Kriteria\s+[^\.\n]{1,80}/gi) || [];
console.log('\nMatches for Kriteria:', matchesKriteria.slice(0, 20));

const matchesDimensi = allWords.match(/Dimensi\s+[^\.\n]{1,80}/gi) || [];
console.log('\nMatches for Dimensi:', matchesDimensi.slice(0, 20));

const matchesIndikator = allWords.match(/Indikator\s+[^\.\n]{1,80}/gi) || [];
console.log('\nMatches for Indikator:', matchesIndikator.slice(0, 20));
