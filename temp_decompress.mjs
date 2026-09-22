import fs from 'node:fs'
import zlib from 'node:zlib'

try {
  const buf5a = fs.readFileSync('src/assets/vetor-fb7eb.svgz')
  const decompressed5a = zlib.gunzipSync(buf5a)
  fs.writeFileSync('src/assets/logo-5a.svg', decompressed5a)
  console.log('5a decompressed:', decompressed5a.length, 'bytes')

  const buf5e = fs.readFileSync('src/assets/vetor-7b581.svgz')
  const decompressed5e = zlib.gunzipSync(buf5e)
  fs.writeFileSync('src/assets/logo-5e.svg', decompressed5e)
  console.log('5e decompressed:', decompressed5e.length, 'bytes')
} catch (err) {
  console.error('Error decompressing:', err)
  process.exit(1)
}
