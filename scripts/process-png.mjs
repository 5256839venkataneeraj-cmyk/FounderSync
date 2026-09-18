import fs from 'fs';
import zlib from 'zlib';

function paeth(a, b, c) {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  if (pa <= pb && pa <= pc) return a;
  if (pb <= pc) return b;
  return c;
}

function parsePng(buf) {
  let offset = 8;
  let ihdr = null;
  const idatChunks = [];

  while (offset < buf.length) {
    const length = buf.readUInt32BE(offset);
    const type = buf.toString('ascii', offset + 4, offset + 8);
    const data = buf.subarray(offset + 8, offset + 8 + length);
    offset += 12 + length;

    if (type === 'IHDR') {
      ihdr = {
        width: data.readUInt32BE(0),
        height: data.readUInt32BE(4),
        bitDepth: data[8],
        colorType: data[9],
      };
    } else if (type === 'IDAT') {
      idatChunks.push(data);
    }
  }

  const decompressed = zlib.inflateSync(Buffer.concat(idatChunks));
  const { width, height } = ihdr;
  const bpp = 4;
  const raw = Buffer.alloc(width * height * 4);

  let srcPos = 0;
  for (let y = 0; y < height; y++) {
    const filter = decompressed[srcPos++];
    for (let x = 0; x < width; x++) {
      for (let c = 0; c < bpp; c++) {
        const rawByte = decompressed[srcPos++];
        const destIdx = (y * width + x) * bpp + c;
        const left = x > 0 ? raw[destIdx - bpp] : 0;
        const above = y > 0 ? raw[((y - 1) * width + x) * bpp + c] : 0;
        const upLeft = (x > 0 && y > 0) ? raw[((y - 1) * width + (x - 1)) * bpp + c] : 0;

        let val = rawByte;
        if (filter === 1) val = (rawByte + left) & 0xff;
        else if (filter === 2) val = (rawByte + above) & 0xff;
        else if (filter === 3) val = (rawByte + Math.floor((left + above) / 2)) & 0xff;
        else if (filter === 4) val = (rawByte + paeth(left, above, upLeft)) & 0xff;

        raw[destIdx] = val;
      }
    }
  }

  return { width, height, raw };
}

const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[n] = c;
}

function encodePng(width, height, rawRgba) {
  const scanlineLen = 1 + width * 4;
  const filtered = Buffer.alloc(scanlineLen * height);

  for (let y = 0; y < height; y++) {
    filtered[y * scanlineLen] = 0; // Filter 0 (None)
    rawRgba.copy(filtered, y * scanlineLen + 1, y * width * 4, (y + 1) * width * 4);
  }

  const compressed = zlib.deflateSync(filtered);
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  function makeChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const typeBuf = Buffer.from(type, 'ascii');
    const crcBuf = Buffer.alloc(4);
    
    let crc = -1;
    for (const b of typeBuf) crc = crcTable[(crc ^ b) & 0xff] ^ (crc >>> 8);
    for (const b of data) crc = crcTable[(crc ^ b) & 0xff] ^ (crc >>> 8);
    crc = (crc ^ -1) >>> 0;
    crcBuf.writeUInt32BE(crc);

    return Buffer.concat([len, typeBuf, data, crcBuf]);
  }

  const ihdrBuf = Buffer.alloc(13);
  ihdrBuf.writeUInt32BE(width, 0);
  ihdrBuf.writeUInt32BE(height, 4);
  ihdrBuf[8] = 8;
  ihdrBuf[9] = 6;
  ihdrBuf[10] = 0;
  ihdrBuf[11] = 0;
  ihdrBuf[12] = 0;

  const ihdrChunk = makeChunk('IHDR', ihdrBuf);
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

const { width, height, raw } = parsePng(fs.readFileSync('public/logo.png'));
const bgR = 252, bgG = 250, bgB = 237;

const transparentRaw = Buffer.from(raw);
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const i = (y * width + x) * 4;
    // Top border artifact
    if (y < 4) {
      transparentRaw[i + 3] = 0;
      continue;
    }
    const r = transparentRaw[i];
    const g = transparentRaw[i + 1];
    const b = transparentRaw[i + 2];
    
    const dr = r - bgR;
    const dg = g - bgG;
    const db = b - bgB;
    const dist = Math.sqrt(dr * dr + dg * dg + db * db);

    if (dist < 24) {
      transparentRaw[i + 3] = 0;
    } else if (dist < 46) {
      const alpha = (dist - 24) / 22;
      transparentRaw[i + 3] = Math.round(alpha * 255);
    }
  }
}

// 1. Save full transparent logo
const fullTrans = encodePng(width, height, transparentRaw);
fs.writeFileSync('public/logo-transparent.png', fullTrans);
console.log('Saved public/logo-transparent.png');

// 2. Find mark bounding box (top emblem only: y < 340)
let markMinX = width, markMaxX = 0, markMinY = height, markMaxY = 0;
for (let y = 5; y < 340; y++) {
  for (let x = 0; x < width; x++) {
    const idx = (y * width + x) * 4;
    if (transparentRaw[idx + 3] > 40) {
      if (x < markMinX) markMinX = x;
      if (x > markMaxX) markMaxX = x;
      if (y < markMinY) markMinY = y;
      if (y > markMaxY) markMaxY = y;
    }
  }
}

console.log(`Mark bounds: X: ${markMinX}-${markMaxX}, Y: ${markMinY}-${markMaxY}`);
function crop(minX, maxX, minY, maxY, pad = 8) {
  const cMinX = Math.max(0, minX - pad);
  const cMaxX = Math.min(width - 1, maxX + pad);
  const cMinY = Math.max(0, minY - pad);
  const cMaxY = Math.min(height - 1, maxY + pad);
  const w = cMaxX - cMinX + 1;
  const h = cMaxY - cMinY + 1;

  const cropped = Buffer.alloc(w * h * 4);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const srcIdx = ((cMinY + y) * width + (cMinX + x)) * 4;
      const dstIdx = (y * w + x) * 4;
      cropped[dstIdx] = transparentRaw[srcIdx];
      cropped[dstIdx + 1] = transparentRaw[srcIdx + 1];
      cropped[dstIdx + 2] = transparentRaw[srcIdx + 2];
      cropped[dstIdx + 3] = transparentRaw[srcIdx + 3];
    }
  }
  return { w, h, cropped };
}

const markCrop = crop(markMinX, markMaxX, markMinY, markMaxY, 10);
const markPng = encodePng(markCrop.w, markCrop.h, markCrop.cropped);
fs.writeFileSync('public/logo-mark.png', markPng);
console.log(`Saved public/logo-mark.png (${markCrop.w}x${markCrop.h})`);

// 3. Find full logo bounding box (mark + wordmark)
let fullMinX = width, fullMaxX = 0, fullMinY = height, fullMaxY = 0;
for (let y = 5; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const idx = (y * width + x) * 4;
    if (transparentRaw[idx + 3] > 40) {
      if (x < fullMinX) fullMinX = x;
      if (x > fullMaxX) fullMaxX = x;
      if (y < fullMinY) fullMinY = y;
      if (y > fullMaxY) fullMaxY = y;
    }
  }
}

console.log(`Full bounds: X: ${fullMinX}-${fullMaxX}, Y: ${fullMinY}-${fullMaxY}`);
const fullCrop = crop(fullMinX, fullMaxX, fullMinY, fullMaxY, 14);
const fullPng = encodePng(fullCrop.w, fullCrop.h, fullCrop.cropped);
fs.writeFileSync('public/logo-full.png', fullPng);
console.log(`Saved public/logo-full.png (${fullCrop.w}x${fullCrop.h})`);

// 4. Save favicon / icon
fs.writeFileSync('public/favicon.png', markPng);
console.log('Saved public/favicon.png');
