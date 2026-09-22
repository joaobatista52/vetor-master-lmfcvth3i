import fs from 'node:fs'
import path from 'node:path'
import { cleanAndCropPNG } from './clean-png.mjs'

const rootDir = process.cwd()
const assetsDir = path.join(rootDir, 'src/assets')

const file5a = path.join(assetsDir, 'logo-5a-vetor-master-14jul26-25ac8.png')
const file5e = path.join(assetsDir, 'logo-5e-vetor-master-14jul26-04e42.png')

const out5a = path.join(assetsDir, 'logo-5a-clean.png')
const out5e = path.join(assetsDir, 'logo-5e-clean.png')

console.log('[logo-processor] Starting clean & crop process...')

if (!fs.existsSync(file5a) || !fs.existsSync(file5e)) {
  console.error('[logo-processor] Source PNGs not found!')
  process.exit(1)
}

try {
  // Process 5a (square / vertical / icon)
  console.log('[logo-processor] Processing logo-5a...')
  const buf5a = fs.readFileSync(file5a)
  const res5a = cleanAndCropPNG(buf5a, {
    threshold: 248,
    feather: 22,
    padding: 10,
    alphaMin: 15,
  })
  fs.writeFileSync(out5a, res5a.buffer)
  console.log(
    `[logo-processor] logo-5a-clean.png saved: ${res5a.width}x${res5a.height} (from ${res5a.origWidth}x${res5a.origHeight}) [${res5a.buffer.length} bytes]`,
  )

  // Process 5e (horizontal)
  console.log('[logo-processor] Processing logo-5e...')
  const buf5e = fs.readFileSync(file5e)
  const res5e = cleanAndCropPNG(buf5e, {
    threshold: 248,
    feather: 22,
    padding: 10,
    alphaMin: 15,
  })
  fs.writeFileSync(out5e, res5e.buffer)
  console.log(
    `[logo-processor] logo-5e-clean.png saved: ${res5e.width}x${res5e.height} (from ${res5e.origWidth}x${res5e.origHeight}) [${res5e.buffer.length} bytes]`,
  )

  console.log('[logo-processor] Finished successfully!')
} catch (err) {
  console.error('[logo-processor] Error:', err)
  process.exit(1)
}
