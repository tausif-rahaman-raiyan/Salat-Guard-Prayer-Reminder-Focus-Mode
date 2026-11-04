import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function createZip(sourceDir, outZipPath) {
  const files = [];

  function collect(dir, base) {
    const list = fs.readdirSync(dir);
    for (const item of list) {
      const fullPath = path.join(dir, item);
      const relPath = path.join(base, item).replace(/\\/g, '/');
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        collect(fullPath, relPath);
      } else {
        files.push({ fullPath, relPath, mtime: stat.mtime });
      }
    }
  }

  collect(sourceDir, '');

  const centralEntries = [];
  const localEntries = [];
  let currentOffset = 0;

  for (const f of files) {
    const data = fs.readFileSync(f.fullPath);
    const uncompressedSize = data.length;
    const crc = computeCrc32(data);
    const compressedData = zlib.deflateRawSync(data);
    const compressedSize = compressedData.length;

    const pathBuf = Buffer.from(f.relPath, 'utf8');

    // Local file header (30 bytes + name)
    const localHeader = Buffer.alloc(30 + pathBuf.length);
    localHeader.writeUInt32LE(0x04034b50, 0); // signature
    localHeader.writeUInt16LE(20, 4);         // version needed (2.0)
    localHeader.writeUInt16LE(0, 6);          // flags
    localHeader.writeUInt16LE(8, 8);          // compression method (deflate)
    localHeader.writeUInt16LE(0, 10);         // mod time
    localHeader.writeUInt16LE(0, 12);         // mod date
    localHeader.writeUInt32LE(crc, 14);       // crc32
    localHeader.writeUInt32LE(compressedSize, 18); // compressed size
    localHeader.writeUInt32LE(uncompressedSize, 22); // uncompressed size
    localHeader.writeUInt16LE(pathBuf.length, 26); // file name length
    localHeader.writeUInt16LE(0, 28);         // extra field length
    pathBuf.copy(localHeader, 30);

    localEntries.push(localHeader, compressedData);

    // Central directory header (46 bytes + name)
    const centralHeader = Buffer.alloc(46 + pathBuf.length);
    centralHeader.writeUInt32LE(0x02014b50, 0); // signature
    centralHeader.writeUInt16LE(20, 4);          // version made by
    centralHeader.writeUInt16LE(20, 6);          // version needed
    centralHeader.writeUInt16LE(0, 8);           // flags
    centralHeader.writeUInt16LE(8, 10);          // compression method
    centralHeader.writeUInt16LE(0, 12);          // mod time
    centralHeader.writeUInt16LE(0, 14);          // mod date
    centralHeader.writeUInt32LE(crc, 16);        // crc32
    centralHeader.writeUInt32LE(compressedSize, 20); // compressed size
    centralHeader.writeUInt32LE(uncompressedSize, 24); // uncompressed size
    centralHeader.writeUInt16LE(pathBuf.length, 28); // file name length
    centralHeader.writeUInt16LE(0, 30);          // extra field length
    centralHeader.writeUInt16LE(0, 32);          // comment length
    centralHeader.writeUInt16LE(0, 34);          // disk number start
    centralHeader.writeUInt16LE(0, 36);          // internal attributes
    centralHeader.writeUInt32LE(0, 38);          // external attributes
    centralHeader.writeUInt32LE(currentOffset, 42); // relative offset of local header
    pathBuf.copy(centralHeader, 46);

    centralEntries.push(centralHeader);

    currentOffset += localHeader.length + compressedData.length;
  }

  const centralDirOffset = currentOffset;
  const centralDirBuffer = Buffer.concat(centralEntries);
  const centralDirSize = centralDirBuffer.length;

  // End of central directory record (22 bytes)
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0); // signature
  eocd.writeUInt16LE(0, 4);          // disk number
  eocd.writeUInt16LE(0, 6);          // disk with CD
  eocd.writeUInt16LE(files.length, 8); // entries on disk
  eocd.writeUInt16LE(files.length, 10); // total entries
  eocd.writeUInt32LE(centralDirSize, 12); // size of CD
  eocd.writeUInt32LE(centralDirOffset, 16); // offset of CD
  eocd.writeUInt16LE(0, 20);         // comment length

  const fullZip = Buffer.concat([...localEntries, centralDirBuffer, eocd]);
  fs.writeFileSync(outZipPath, fullZip);
  console.log(`✓ Zip created successfully at ${outZipPath} (${fullZip.length} bytes, ${files.length} files)`);
}

function computeCrc32(buf) {
  let table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }

  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xFF];
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

const src = path.resolve('prayer-focus-v2');
createZip(src, path.resolve('prayer-focus-v2.1.0.zip'));
createZip(src, path.resolve('prayer-focus-v2.0.0.zip'));
if (!fs.existsSync(path.resolve('public'))) {
  fs.mkdirSync(path.resolve('public'), { recursive: true });
}
createZip(src, path.resolve('public/prayer-focus-v2.1.0.zip'));
createZip(src, path.resolve('public/prayer-focus-v2.0.0.zip'));
