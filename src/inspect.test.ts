import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import zlib from 'node:zlib'

describe('inspect png', () => {
  it('reads png', () => {
    const buf = fs.readFileSync('src/assets/logo-5e-vetor-master-14jul26-04e42.png')
    expect(buf.length).toBeGreaterThan(0)
  })
})
