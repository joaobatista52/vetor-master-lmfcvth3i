// scripts/_tmp-clean-logo.mjs
// Standalone script using Node.js built-in fs and zlib.
// Loads official logo PNGs (logo-5a and logo-5e), removes white/near-white background
// (pixels near #fefefe / #ffffff with tolerance ~10-15 per channel), applies defringing/feathering,
// crops bounding box of non-transparent content with slight padding, and saves as
// src/assets/logo-5a-clean.png and src/assets/logo-5e-clean.png.
// Also validates corner pixel alpha is 0.

import fs from 'node:fs'
import path from 'node:path'
import zlib from 'node:zlib'

function parsePNG(buffer) {
  if (buffer.toString('ascii', 1, 4) !== 'PNG') {
    throw new Error('Not a PNG file')
  }

  let offset = 8
  let width = 0
  let height = 0
  let bitDepth = 0
  let colorType = 0
  const idatChunks = []

  while (offset < buffer.length) {
    const length = buffer.readUInt32BE(offset)
    const type = buffer.toString('ascii', offset + 4, offset + 8)
    const data = buffer.subarray(offset + 8, offset + 8 + length)
    offset += 12 + length

    if (type === 'IHDR') {
      width = data.readUInt32BE(0)
      height = data.readUInt32BE(4)
      bitDepth = data[8]
      colorType = data[9]
    } else if (type === 'IDAT') {
      idatChunks.push(data)
    } else if (type === 'IEND') {
      break
    }
  }

  if (bitDepth !== 8 || (colorType !== 2 && colorType !== 6)) {
    throw new Error(`Unsupported PNG: bitDepth=${bitDepth}, colorType=${colorType}`)
  }

  const decompressed = zlib.inflateSync(Buffer.concat(idatChunks))
  const bytesPerPixel = colorType === 6 ? 4 : 3
  const stride = width * bytesPerPixel
  const rgba = Buffer.alloc(width * height * 4)

  let inOffset = 0
  let prevScanline = Buffer.alloc(stride)

  for (let y = 0; y < height; y++) {
    const filterType = decompressed[inOffset++]
    const currentScanline = Buffer.alloc(stride)

    for (let i = 0; i < stride; i++) {
      const xVal = decompressed[inOffset++]
      const aVal = i >= bytesPerPixel ? currentScanline[i - bytesPerPixel] : 0
      const bVal = prevScanline[i]
      const cVal = i >= bytesPerPixel ? prevScanline[i - bytesPerPixel] : 0

      let val = 0
      if (filterType === 0) val = xVal
      else if (filterType === 1) val = (xVal + aVal) & 0xff
      else if (filterType === 2) val = (xVal + bVal) & 0xff
      else if (filterType === 3) val = (xVal + Math.floor((aVal + bVal) / 2)) & 0xff
      else if (filterType === 4) {
        const p = aVal + bVal - cVal
        const pa = Math.abs(p - aVal)
        const pb = Math.abs(p - bVal)
        const pc = Math.abs(p - cVal)
        let pr = pa <= pb && pa <= pc ? aVal : pb <= pc ? bVal : cVal
        val = (xVal + pr) & 0xff
      }
      currentScanline[i] = val
    }

    for (let x = 0; x < width; x++) {
      const outIdx = (y * width + x) * 4
      if (colorType === 6) {
        rgba[outIdx] = currentScanline[x * 4]
        rgba[outIdx + 1] = currentScanline[x * 4 + 1]
        rgba[outIdx + 2] = currentScanline[x * 4 + 2]
        rgba[outIdx + 3] = currentScanline[x * 4 + 3]
      } else {
        rgba[outIdx] = currentScanline[x * 3]
        rgba[outIdx + 1] = currentScanline[x * 3 + 1]
        rgba[outIdx + 2] = currentScanline[x * 3 + 2]
        rgba[outIdx + 3] = 255
      }
    }

    prevScanline = currentScanline
  }

  return { width, height, rgba }
}

const crcTable = new Uint32Array(256)
for (let n = 0; n < 256; n++) {
  let c = n
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  }
  crcTable[n] = c >>> 0
}

function crc32(buf) {
  let c = 0xffffffff
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8)
  }
  return (c ^ 0xffffffff) >>> 0
}

function makeChunk(type, data) {
  const len = data.length
  const chunk = Buffer.alloc(12 + len)
  chunk.writeUInt32BE(len, 0)
  chunk.write(type, 4, 4, 'ascii')
  data.copy(chunk, 8)
  const crc = crc32(chunk.subarray(4, 8 + len))
  chunk.writeUInt32BE(crc, 8 + len)
  return chunk
}

function encodeRGBAtoPNG(width, height, rgba) {
  const header = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])

  const ihdrData = Buffer.alloc(13)
  ihdrData.writeUInt32BE(width, 0)
  ihdrData.writeUInt32BE(height, 4)
  ihdrData[8] = 8
  ihdrData[9] = 6
  ihdrData[10] = 0
  ihdrData[11] = 0
  ihdrData[12] = 0

  const ihdrChunk = makeChunk('IHDR', ihdrData)

  const rawScanlines = Buffer.alloc(height * (1 + width * 4))
  let inOffset = 0
  let outOffset = 0
  for (let y = 0; y < height; y++) {
    rawScanlines[outOffset++] = 0
    rgba.copy(rawScanlines, outOffset, inOffset, inOffset + width * 4)
    outOffset += width * 4
    inOffset += width * 4
  }

  const compressed = zlib.deflateSync(rawScanlines, { level: 9 })
  const idatChunk = makeChunk('IDAT', compressed)
  const iendChunk = makeChunk('IEND', Buffer.alloc(0))

  return Buffer.concat([header, ihdrChunk, idatChunk, iendChunk])
}

function removeWhiteBackground(width, height, rgba, threshold = 246, feather = 20) {
  for (let i = 0; i < width * height; i++) {
    const idx = i * 4
    const r = rgba[idx]
    const g = rgba[idx + 1]
    const b = rgba[idx + 2]
    const a = rgba[idx + 3]

    if (a === 0) continue

    const minC = Math.min(r, g, b)
    const maxC = Math.max(r, g, b)
    const diff = maxC - minC

    // Neutral near-white background check:
    if (minC >= threshold && diff <= 12) {
      rgba[idx + 3] = 0
    } else if (minC > threshold - feather && diff <= 18) {
      const factor = (threshold - minC) / feather
      const newAlpha = Math.max(0, Math.min(255, Math.round(255 * factor)))
      rgba[idx + 3] = Math.min(a, newAlpha)

      // De-fringe white blending
      const alphaNorm = newAlpha / 255
      if (alphaNorm > 0.05) {
        rgba[idx] = Math.max(0, Math.min(255, Math.round((r - 255 * (1 - alphaNorm)) / alphaNorm)))
        rgba[idx + 1] = Math.max(
          0,
          Math.min(255, Math.round((g - 255 * (1 - alphaNorm)) / alphaNorm)),
        )
        rgba[idx + 2] = Math.max(
          0,
          Math.min(255, Math.round((b - 255 * (1 - alphaNorm)) / alphaNorm)),
        )
      }
    }
  }
}

function cropTransparent(width, height, rgba, padding = 8, alphaMin = 15) {
  let minX = width
  let minY = height
  let maxX = -1
  let maxY = -1

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const a = rgba[(y * width + x) * 4 + 3]
      if (a > alphaMin) {
        if (x < minX) minX = x
        if (x > maxX) maxX = x
        if (y < minY) minY = y
        if (y > maxY) maxY = y
      }
    }
  }

  if (maxX < minX || maxY < minY) {
    throw new Error('Image is completely transparent or no content found!')
  }

  minX = Math.max(0, minX - padding)
  minY = Math.max(0, minY - padding)
  maxX = Math.min(width - 1, maxX + padding)
  maxY = Math.min(height - 1, maxY + padding)

  const croppedW = maxX - minX + 1
  const croppedH = maxY - minY + 1
  const croppedRGBA = Buffer.alloc(croppedW * croppedH * 4)

  for (let y = 0; y < croppedH; y++) {
    const srcY = minY + y
    const srcStart = (srcY * width + minX) * 4
    const srcEnd = srcStart + croppedW * 4
    const dstStart = y * croppedW * 4
    rgba.copy(croppedRGBA, dstStart, srcStart, srcEnd)
  }

  return { width: croppedW, height: croppedH, rgba: croppedRGBA }
}

function cleanLogoFile(inputPath, outputPath) {
  const buf = fs.readFileSync(inputPath)
  const { width, height, rgba } = parsePNG(buf)
  removeWhiteBackground(width, height, rgba, 246, 20)
  const cropped = cropTransparent(width, height, rgba, 6, 15)
  const outPng = encodeRGBAtoPNG(cropped.width, cropped.height, cropped.rgba)
  fs.writeFileSync(outputPath, outPng)

  // Verify corner pixels have alpha 0
  const corner00Alpha = cropped.rgba[3]
  const cornerTopRightAlpha = cropped.rgba[(cropped.width - 1) * 4 + 3]
  const cornerBottomLeftAlpha = cropped.rgba[(cropped.height - 1) * cropped.width * 4 + 3]
  const cornerBottomRightAlpha =
    cropped.rgba[((cropped.height - 1) * cropped.width + (cropped.width - 1)) * 4 + 3]

  console.log(`[clean-logo] ${path.basename(outputPath)} saved:`)
  console.log(
    `  Size: ${cropped.width}x${cropped.height} (from ${width}x${height}), bytes: ${outPng.length}`,
  )
  console.log(
    `  Corner alphas: TL=${corner00Alpha}, TR=${cornerTopRightAlpha}, BL=${cornerBottomLeftAlpha}, BR=${cornerBottomRightAlpha}`,
  )

  if (corner00Alpha !== 0) {
    console.warn(`  Warning: TL corner alpha is ${corner00Alpha}`)
  }
}

const rootDir = process.cwd()
const assetsDir = path.join(rootDir, 'src/assets')
const file5a = path.join(assetsDir, 'logo-5a-vetor-master-14jul26-25ac8.png')
const file5e = path.join(assetsDir, 'logo-5e-vetor-master-14jul26-04e42.png')
const out5a = path.join(assetsDir, 'logo-5a-clean.png')
const out5e = path.join(assetsDir, 'logo-5e-clean.png')

console.log('Processing logo-5a...')
cleanLogoFile(file5a, out5a)

console.log('Processing logo-5e...')
cleanLogoFile(file5e, out5e)

console.log('All done successfully!')
