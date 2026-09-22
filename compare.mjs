import fs from 'fs'
import zlib from 'zlib'

const svgz5e = fs.readFileSync('src/assets/vetor-7b581.svgz')
const rawSvg5e = zlib.gunzipSync(svgz5e).toString('utf-8')
const vetor5e = fs.readFileSync('src/assets/vetor-5e.svg', 'utf-8')

fs.writeFileSync(
  'compare_result.txt',
  `5e: raw=${rawSvg5e.length}, vetor=${vetor5e.length}, eq=${rawSvg5e === vetor5e}\nraw_slice=${rawSvg5e.slice(0, 100)}\nvetor_slice=${vetor5e.slice(0, 100)}`,
)
