/*
 * Hex <-> OKLCH conversion with CSS Color 4 gamut mapping into sRGB.
 *
 * The sRGB <-> linear <-> OKLab <-> OKLCH math and the gamut mapping are
 * ported from reui's color picker (https://reui.io,
 * `components/reui/color-picker.tsx`), MIT License. OKLab is by Björn
 * Ottosson, with the matrices CSS Color 4 uses.
 *
 * Units used throughout this file:
 * - `l` (lightness): 0 to 1, as in CSS `oklch(0.62 0.2 260)`.
 * - `c` (chroma): 0 and up, unbounded (about 0.4 covers sRGB and P3).
 * - `h` (hue): degrees, 0 to 360.
 */

/** An OKLCH color as `[l, c, h]`: lightness 0 to 1, chroma 0 and up, hue in degrees. */
export type Oklch = [l: number, c: number, h: number]

type Triple = [number, number, number]

const HEX_PATTERN = /^#([\da-f]{3}|[\da-f]{6})$/i

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

const wrapHue = (hue: number) => ((hue % 360) + 360) % 360

function toLinear(channel: number) {
  const c = channel / 255
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
}

function fromLinear(channel: number) {
  return 255
    * (channel <= 0.0031308
      ? 12.92 * channel
      : 1.055 * channel ** (1 / 2.4) - 0.055)
}

/* Linear sRGB in, unbounded, so a wide-gamut color converts without clipping. */
function linearToOklab([r, g, b]: Triple): Triple {
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b)
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b)
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b)
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ]
}

/* OKLab to OKLCH. Below a chroma of 1e-4 the hue is meaningless, so it falls back. */
function oklabToOklch([lightness, a, b]: Triple, fallbackHue = 0): Oklch {
  const chroma = Math.sqrt(a * a + b * b)
  const hue
    = chroma < 1e-4 ? fallbackHue : wrapHue((Math.atan2(b, a) * 180) / Math.PI)
  return [lightness, chroma, hue]
}

function oklchToLinear([lightness, chroma, hue]: Oklch): Triple {
  const angle = (hue * Math.PI) / 180
  const a = chroma * Math.cos(angle)
  const b = chroma * Math.sin(angle)
  const l = (lightness + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const m = (lightness - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const s = (lightness - 0.0894841775 * a - 1.291485548 * b) ** 3
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ]
}

function inSrgb(linear: Triple) {
  return linear.every(channel => channel >= -1e-4 && channel <= 1 + 1e-4)
}

function clipLinear(linear: Triple) {
  return linear.map(channel => clamp(channel, 0, 1)) as Triple
}

/* How far a clipped color lands from the OKLCH it stands for, in OKLab. */
function clipError(clipped: Triple, [lightness, chroma, hue]: Oklch) {
  const [l, a, b] = linearToOklab(clipped)
  const angle = (hue * Math.PI) / 180
  return Math.hypot(
    l - lightness,
    a - chroma * Math.cos(angle),
    b - chroma * Math.sin(angle),
  )
}

/* CSS Color 4 gamut mapping: lower chroma at the same lightness and hue
   until clipping the rest moves the color less than a just-noticeable
   difference (deltaEOK 0.02), then clip. Returns 0-255 sRGB channels,
   not yet rounded. */
function oklchToRgb([lightness, chroma, hue]: Oklch): Triple {
  const encode = (linear: Triple) =>
    linear.map(channel => fromLinear(channel)) as Triple
  if (lightness >= 1)
    return [255, 255, 255]
  if (lightness <= 0)
    return [0, 0, 0]
  const target: Oklch = [lightness, Math.max(0, chroma), hue]
  const origin = oklchToLinear(target)
  if (inSrgb(origin))
    return encode(clipLinear(origin))
  let clipped = clipLinear(origin)
  if (clipError(clipped, target) < 0.02)
    return encode(clipped)
  let low = 0
  let high = target[1]
  let lowInGamut = true
  while (high - low > 1e-4) {
    const mid = (low + high) / 2
    const current: Oklch = [lightness, mid, hue]
    const linear = oklchToLinear(current)
    if (lowInGamut && inSrgb(linear)) {
      low = mid
      continue
    }
    clipped = clipLinear(linear)
    const error = clipError(clipped, current)
    if (error < 0.02) {
      if (0.02 - error < 1e-4)
        break
      lowInGamut = false
      low = mid
    }
    else {
      high = mid
    }
  }
  return encode(clipped)
}

/**
 * Converts a hex color to OKLCH.
 *
 * Accepts `#rgb` and `#rrggbb`, case-insensitive, with the leading `#`
 * required and no surrounding whitespace. Returns `null` for anything else
 * (including `#rgba` / `#rrggbbaa`).
 *
 * The result is `[l, c, h]` with `l` from 0 to 1, `c` from 0 up and `h` in
 * degrees (0 to 360). An achromatic color (chroma below 1e-4) gets hue 0.
 */
export function hexToOklch(hex: string): Oklch | null {
  const match = typeof hex === 'string' ? HEX_PATTERN.exec(hex) : null
  if (!match)
    return null
  let digits = match[1] ?? ''
  if (digits.length === 3)
    digits = [...digits].map(digit => digit + digit).join('')
  const byte = (index: number) => Number.parseInt(digits.slice(index, index + 2), 16)
  const linear = [byte(0), byte(2), byte(4)].map(toLinear) as Triple
  return oklabToOklch(linearToOklab(linear))
}

/**
 * Converts an OKLCH color to a lowercase `#rrggbb` hex.
 *
 * `l` is 0 to 1 (at or above 1 gives `#ffffff`, at or below 0 gives
 * `#000000`), `c` is clamped to 0 and up, `h` is in degrees. A color outside
 * sRGB is brought inside it with CSS Color 4 gamut mapping (chroma reduced at
 * constant lightness and hue until the clipped color is within deltaEOK 0.02),
 * never by clamping each channel alone.
 */
export function oklchToHex(lch: Oklch): string {
  const rgb = oklchToRgb(lch).map(channel =>
    Math.round(clamp(channel, 0, 255)),
  )
  return `#${rgb.map(byte => byte.toString(16).padStart(2, '0')).join('')}`
}
