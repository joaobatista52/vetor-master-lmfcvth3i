import fs from 'node:fs'
import path from 'node:path'
import zlib from 'node:zlib'

function checkTransparency(filePath) {
  const buf = fs.readFileSync(filePath)
  // parse IDAT
  let offset = 8
  let width = 0
  let height = 0
  let bitDepth = 0
  let colorType = 0
  const idatChunks = []

  while (offset < buf.length) {
    const length = buf.readUInt32BE(offset)
    const type = buf.toString('ascii', offset + 4, offset + 8)
    const data = buf.subarray(offset + 8, offset + 8 + length)
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

  const decompressed = zlib.inflateSync(Buffer.concat(idatChunks))
  const bytesPerPixel = 4
  const stride = width * bytesPerPixel

  let inOffset = 0
  let prevScanline = Buffer.alloc(stride)

  let transparentPixels = 0
  let opaquePixels = 0
  let translucentPixels = 0

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
      const alpha = currentScanline[x * 4 + 3]
      if (alpha === 0) transparentPixels++
      else if (alpha === 255) opaquePixels++
      else translucentPixels++
    }

    prevScanline = currentScanline
  }

  return `${path.basename(filePath)}: total=${width * height}, transparent=${transparentPixels} (${((transparentPixels / (width * height)) * 100).toFixed(1)}%), opaque=${opaquePixels}, translucent=${translucentPixels}`
}

const res = [
  checkTransparency(path.join(process.cwd(), 'src/assets/logo-5a-clean.png')),
  checkTransparency(path.join(process.cwd(), 'src/assets/logo-5e-clean.png')),
]

fs.writeFileSync(path.join(process.cwd(), 'scripts/inspect-result.txt'), res.join('\n'))
