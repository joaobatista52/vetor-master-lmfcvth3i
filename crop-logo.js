import fs from 'node:fs'
import zlib from 'node:zlib'

function decodePng(filePath) {
  const buf = fs.readFileSync(filePath)
  let off = 8
  let w = 0,
    h = 0,
    bitDepth = 0,
    colorType = 0
  const idatChunks = []
  while (off < buf.length) {
    const len = buf.readUInt32BE(off)
    const type = buf.toString('ascii', off + 4, off + 8)
    if (type === 'IHDR') {
      w = buf.readUInt32BE(off + 8)
      h = buf.readUInt32BE(off + 12)
      bitDepth = buf[off + 16]
      colorType = buf[off + 17]
    } else if (type === 'IDAT') {
      idatChunks.push(buf.subarray(off + 8, off + 8 + len))
    }
    off += 12 + len
  }
  const decompressed = zlib.inflateSync(Buffer.concat(idatChunks))

  // Reconstruct unfilter scanlines (colorType 6 = RGBA, 8 bits/channel)
  // Each line starts with 1 byte filter type + w * 4 bytes
  const bytesPerPixel = 4
  const stride = w * bytesPerPixel
  const pixels = Buffer.alloc(w * h * bytesPerPixel)

  let srcPos = 0
  let prevLine = Buffer.alloc(stride)

  for (let y = 0; y < h; y++) {
    const filter = decompressed[srcPos++]
    const line = Buffer.alloc(stride)

    for (let x = 0; x < stride; x++) {
      const raw = decompressed[srcPos++]
      let val = 0
      const bpp = bytesPerPixel
      const a = x >= bpp ? line[x - bpp] : 0
      const b = prevLine[x]
      const c = x >= bpp ? prevLine[x - bpp] : 0

      switch (filter) {
        case 0: // None
          val = raw
          break
        case 1: // Sub
          val = (raw + a) & 0xff
          break
        case 2: // Up
          val = (raw + b) & 0xff
          break
        case 3: // Average
          val = (raw + Math.floor((a + b) / 2)) & 0xff
          break
        case 4: {
          // Paeth
          const p = a + b - c
          const pa = Math.abs(p - a)
          const pb = Math.abs(p - b)
          const pc = Math.abs(p - c)
          let pr
          if (pa <= pb && pa <= pc) pr = a
          else if (pb <= pc) pr = b
          else pr = c
          val = (raw + pr) & 0xff
          break
        }
        default:
          throw new Error('Unknown filter: ' + filter)
      }
      line[x] = val
    }

    line.copy(pixels, y * stride)
    prevLine = line
  }

  return { w, h, pixels }
}

const orig = decodePng('src/assets/logo-5e-vetor-master-14jul26-04e42.png')
console.log('Original dimensions:', orig.w, orig.h)

// Bounding box finding: non-transparent pixels (alpha > 0)
// Also check if any pixels are almost white or if background is truly transparent
let minX = orig.w,
  maxX = 0,
  minY = orig.h,
  maxY = 0
let transparentCount = 0
let visibleCount = 0

for (let y = 0; y < orig.h; y++) {
  for (let x = 0; x < orig.w; x++) {
    const idx = (y * orig.w + x) * 4
    const a = orig.pixels[idx + 3]
    if (a > 10) {
      // visible pixel
      visibleCount++
      if (x < minX) minX = x
      if (x > maxX) maxX = x
      if (y < minY) minY = y
      if (y > maxY) maxY = y
    } else {
      transparentCount++
    }
  }
}

throw new Error(`DEBUG: minX=${minX}, maxX=${maxX}, minY=${minY}, maxY=${maxY}, w=${orig.w}, h=${orig.h}`)
