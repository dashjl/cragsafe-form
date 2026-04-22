// One-time script: generates public/topo-bg.svg
// Run with: node scripts/generate-topo.mjs

import { writeFileSync } from 'fs'

const W = 1200
const H = 900
const RES = 3           // pixels per grid cell — lower = smoother curves
const COLS = Math.ceil(W / RES) + 2
const ROWS = Math.ceil(H / RES) + 2

// Layered sine/cosine waves produce organic terrain-like hills
function height(col, row) {
  const x = col / COLS
  const y = row / ROWS
  let v = 0
  v += Math.sin(x * 4.2  + y * 2.8)  * 0.500
  v += Math.sin(x * 9.1  - y * 6.3)  * 0.250
  v += Math.cos(x * 6.7  + y * 8.4)  * 0.250
  v += Math.sin(x * 15.3 + y * 11.7) * 0.125
  v += Math.cos(x * 21.1 - y * 17.3) * 0.063
  v += Math.sin(x * 3.3  - y * 4.1)  * 0.375
  // normalize to [0, 1]
  const range = 0.500 + 0.250 + 0.250 + 0.125 + 0.063 + 0.375
  return (v + range) / (2 * range)
}

// Build grid
const grid = Array.from({ length: ROWS }, (_, r) =>
  Array.from({ length: COLS }, (_, c) => height(c, r))
)

// Marching squares — returns disconnected line segments for one threshold level
function contourSegments(threshold) {
  const segs = []
  for (let r = 0; r < ROWS - 1; r++) {
    for (let c = 0; c < COLS - 1; c++) {
      const a = grid[r][c]
      const b = grid[r][c + 1]
      const cc = grid[r + 1][c + 1]
      const d = grid[r + 1][c]

      const bits = (a > threshold ? 8 : 0) |
                   (b > threshold ? 4 : 0) |
                   (cc > threshold ? 2 : 0) |
                   (d > threshold ? 1 : 0)

      if (bits === 0 || bits === 15) continue

      const x0 = c * RES, y0 = r * RES
      const x1 = x0 + RES, y1 = y0 + RES

      const t = (va, vb) => (threshold - va) / (vb - va)

      const top    = { x: x0 + t(a, b)  * RES, y: y0 }
      const right  = { x: x1,               y: y0 + t(b, cc) * RES }
      const bottom = { x: x0 + t(d, cc) * RES, y: y1 }
      const left   = { x: x0,               y: y0 + t(a, d)  * RES }

      const pairs = {
         1: [[bottom, left]],
         2: [[right, bottom]],
         3: [[right, left]],
         4: [[top, right]],
         5: [[top, left], [right, bottom]],
         6: [[top, bottom]],
         7: [[top, left]],
         8: [[left, top]],
         9: [[bottom, top]],
        10: [[left, bottom], [top, right]],
        11: [[right, top]],
        12: [[left, right]],
        13: [[bottom, right]],
        14: [[left, bottom]],
      }

      for (const [s, e] of (pairs[bits] || [])) {
        segs.push(`M${s.x.toFixed(1)} ${s.y.toFixed(1)}L${e.x.toFixed(1)} ${e.y.toFixed(1)}`)
      }
    }
  }
  return segs
}

// Elevation levels — more levels = denser contours
const levels = [0.10, 0.18, 0.26, 0.34, 0.42, 0.50, 0.58, 0.66, 0.74, 0.82, 0.90]

// Thin lines for most, slightly thicker every 5th (index divisible by 4) — classic topo convention
const paths = levels.map((level, i) => {
  const segs = contourSegments(level)
  const isMajor = i % 4 === 0
  const opacity = isMajor ? 0.18 : 0.10
  const width   = isMajor ? 1.2  : 0.7
  return `  <path d="${segs.join('')}" stroke="rgba(100,80,50,${opacity})" stroke-width="${width}" fill="none" stroke-linecap="round"/>`
})

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice">
${paths.join('\n')}
</svg>`

writeFileSync('public/topo-bg.svg', svg)
console.log(`Generated public/topo-bg.svg (${(svg.length / 1024).toFixed(0)} KB, ${levels.length} contour levels)`)
