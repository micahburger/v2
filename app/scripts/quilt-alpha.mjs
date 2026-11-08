// Turns logoquilt2024.png (dark logos on a cream ground, 8-bit RGB) into
// black logos on transparent: each pixel's alpha is how much darker it is
// than the ground, so antialiased edges keep their softness.
// Usage: node quilt-alpha.mjs <in.png> <out.png>
import { readFileSync, writeFileSync } from "node:fs";
import { inflateSync, deflateSync, crc32 } from "node:zlib";

const [, , inPath, outPath] = process.argv;
const buf = readFileSync(inPath);
let pos = 8;
let width, height, bitDepth, colorType;
const idat = [];
while (pos < buf.length) {
  const len = buf.readUInt32BE(pos);
  const type = buf.toString("ascii", pos + 4, pos + 8);
  const data = buf.subarray(pos + 8, pos + 8 + len);
  if (type === "IHDR") {
    width = data.readUInt32BE(0);
    height = data.readUInt32BE(4);
    bitDepth = data[8];
    colorType = data[9];
    if (data[12] !== 0) throw new Error("interlaced not supported");
  } else if (type === "IDAT") idat.push(data);
  pos += 12 + len;
}
if (bitDepth !== 8 || (colorType !== 2 && colorType !== 6)) throw new Error(`unsupported ${bitDepth}/${colorType}`);
const bpp = colorType === 2 ? 3 : 4;
const raw = inflateSync(Buffer.concat(idat));
const stride = width * bpp;
const px = Buffer.alloc(height * stride);
for (let y = 0; y < height; y++) {
  const f = raw[y * (stride + 1)];
  const line = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1));
  for (let x = 0; x < stride; x++) {
    const a = x >= bpp ? px[y * stride + x - bpp] : 0;
    const b = y > 0 ? px[(y - 1) * stride + x] : 0;
    const c = x >= bpp && y > 0 ? px[(y - 1) * stride + x - bpp] : 0;
    let v = line[x];
    if (f === 1) v += a;
    else if (f === 2) v += b;
    else if (f === 3) v += (a + b) >> 1;
    else if (f === 4) {
      const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
      v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
    }
    px[y * stride + x] = v & 255;
  }
}
const lum = (r, g, b) => 0.2126 * r + 0.7152 * g + 0.0722 * b;
const ground = lum(px[0], px[1], px[2]);
const out = Buffer.alloc(height * (width * 4 + 1));
for (let y = 0; y < height; y++) {
  out[y * (width * 4 + 1)] = 0;
  for (let x = 0; x < width; x++) {
    const i = y * stride + x * bpp;
    // Anything within 10% of the ground (the pale box behind Lincoln, JPEG
    // speckle) drops out entirely; the rest is stretched back to full range.
    const dark = (ground - lum(px[i], px[i + 1], px[i + 2])) / ground;
    const alpha = Math.max(0, Math.min(1, (dark - 0.1) / 0.9));
    const o = y * (width * 4 + 1) + 1 + x * 4;
    out[o] = out[o + 1] = out[o + 2] = 0;
    out[o + 3] = Math.round(alpha * 255);
  }
}
const chunk = (type, data) => {
  const head = Buffer.alloc(8);
  head.writeUInt32BE(data.length, 0);
  head.write(type, 4, "ascii");
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([head.subarray(4), data])) >>> 0, 0);
  return Buffer.concat([head, data, crc]);
};
const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(width, 0);
ihdr.writeUInt32BE(height, 4);
ihdr[8] = 8;
ihdr[9] = 6;
writeFileSync(
  outPath,
  Buffer.concat([buf.subarray(0, 8), chunk("IHDR", ihdr), chunk("IDAT", deflateSync(out, { level: 9 })), chunk("IEND", Buffer.alloc(0))]),
);
console.log(`ground lum ${ground.toFixed(1)}, ${width}x${height} -> ${outPath}`);
