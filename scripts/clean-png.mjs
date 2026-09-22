// Standalone script using only Node standard library (fs, zlib) to process PNGs.
// It parses the PNG IDAT streams, reconstructs scanlines, detects white/near-white pixels,
// sets transparency with alpha-feathering, crops empty borders, and re-encodes a compliant RGBA PNG.
import fs from 'node:fs'
import path from 'node:path'
import zlib from 'node:zlib'

function parsePNG(buffer) {
  if (buffer.toString('ascii', 1, 4) !== 'PNG') {
    throw new Error('Not a PNG')
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
    throw new Error(`Unsupported PNG format: bitDepth=${bitDepth}, colorType=${colorType}`)
  }

  const compressedData = Buffer.concat(idatChunks)
  const decompressed = zlib.inflateSync(compressedData)

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
      if (filterType === 0) {
        val = xVal
      } else if (filterType === 1) {
        val = (xVal + aVal) & 0xff
      } else if (filterType === 2) {
        val = (xVal + bVal) & 0xff
      } else if (filterType === 3) {
        val = (xVal + Math.floor((aVal + bVal) / 2)) & 0xff
      } else if (filterType === 4) {
        const p = aVal + bVal - cVal
        const pa = Math.abs(p - aVal)
        const pb = Math.abs(p - bVal)
        const pc = Math.abs(p - cVal)
        let pr
        if (pa <= pb && pa <= pc) pr = aVal
        else if (pb <= pc) pr = bVal
        else pr = cVal
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

/**
 * Remove pure white / off-white background with antialiasing feathering:
 * The background of the Vetor Master files is #ffffff / #fefefe.
 * In RGB, pure white is (255,255,255).
 * Any pixel where min(R,G,B) >= threshold (e.g. 250) and color saturation is near 0 is background.
 * For boundary pixels, we apply smooth alpha falloff and color de-multiplication so there's no white fringe.
 */
function removeWhiteBackground(width, height, rgba, threshold = 248, feather = 20) {
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

    // Neutral / near-white check: diff <= 12 and minC >= threshold
    if (minC >= threshold && diff <= 10) {
      rgba[idx + 3] = 0
    } else if (minC > threshold - feather && diff <= 16) {
      // Linear falloff from (threshold - feather) to threshold
      const factor = (threshold - minC) / feather // 0 to 1
      const newAlpha = Math.max(0, Math.min(255, Math.round(255 * factor)))
      rgba[idx + 3] = Math.min(a, newAlpha)

      // Defringe / un-premultiply white:
      // Since pixel was blended with white: C_observed = C_true * alpha + 255 * (1 - alpha)
      // C_true = (C_observed - 255 * (1 - alpha)) / alpha
      const alphaNorm = newAlpha / 255
      if (alphaNorm > 0.05) {
        const trueR = Math.max(
          0,
          Math.min(255, Math.round((r - 255 * (1 - alphaNorm)) / alphaNorm)),
        )
        const trueG = Math.max(
          0,
          Math.min(255, Math.round((g - 255 * (1 - alphaNorm)) / alphaNorm)),
        )
        const trueB = Math.max(
          0,
          Math.min(255, Math.round((b - 255 * (1 - alphaNorm)) / alphaNorm)),
        )
        rgba[idx] = trueR
        rgba[idx + 1] = trueG
        rgba[idx + 2] = trueB
      }
    }
  }
}

/**
 * Find bounding box of non-transparent pixels (alpha > threshold) and crop.
 */
function cropTransparent(width, height, rgba, padding = 12, alphaMin = 15) {
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

  return { width: croppedW, height: croppedH, rgba: croppedRGBA, bbox: { minX, minY, maxX, maxY } }
}

export function cleanAndCropPNG(inputBuffer, options = {}) {
  const { width, height, rgba } = parsePNG(inputBuffer)
  removeWhiteBackground(width, height, rgba, options.threshold ?? 246, options.feather ?? 22)
  const cropped = cropTransparent(width, height, rgba, options.padding ?? 8, options.alphaMin ?? 15)
  const pngBuffer = encodeRGBAtoPNG(cropped.width, cropped.height, cropped.rgba)
  return {
    buffer: pngBuffer,
    origWidth: width,
    origHeight: height,
    width: cropped.width,
    height: cropped.height,
    bbox: cropped.bbox,
  }
}
