import { hexToOklch, oklchToHex } from '@/styles/reka-nova/lib/oklch'

/** The 11 scale steps, in order. */
export const COLOR_SCALE_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const

export type ColorScaleStepName = (typeof COLOR_SCALE_STEPS)[number]

/** One shade of the scale: its step and its lowercase `#rrggbb` value. */
export interface ColorScaleStep {
  step: ColorScaleStepName
  value: string
}

/* Tailwind's blue scale in OKLCH: lightness (0-100) per step, and chroma
   relative to step 500. The base color becomes 500 and the lightness curve
   bends around it. Curves from reui's Brand scale example (MIT). */
const LIGHTNESS = [97, 93.2, 88.2, 80.9, 70.7, 62.3, 54.6, 48.8, 42.4, 37.9, 28.2]
const CHROMA = [0.07, 0.15, 0.28, 0.47, 0.77, 1, 1.14, 1.14, 0.93, 0.68, 0.43]
const BASE_LIGHTNESS = 62.3

const quantize = (value: number, digits: number) => Number(value.toFixed(digits))

const wrapHue = (hue: number) => ((hue % 360) + 360) % 360

/* The base in OKLCH with lightness 0-100, rounded the way reui's reference
   rounds it (it serializes to `oklch(L% C H)` and parses that back), so the
   scale matches its output exactly. */
function baseOklch(hex: string): [number, number, number] | null {
  const lch = hexToOklch(hex)
  if (!lch)
    return null
  const [l, c, h] = lch
  const lightness = Math.min(1, Math.max(0, quantize(l * 100, 2) / 100)) * 100
  const chroma = Math.max(0, quantize(Math.max(0, c), 5))
  const hue = wrapHue(quantize(wrapHue(quantize(h, 3)), 3))
  return [lightness, chroma, hue]
}

/**
 * Expands a base color into an 11-step OKLCH scale (50 to 950), as reui's
 * Brand scale does:
 * - the base is pinned to step 500;
 * - steps 50-400 interpolate Tailwind blue's lightness toward 100, steps
 *   600-950 scale it by `baseLightness / 62.3`;
 * - chroma follows Tailwind blue's curve relative to the base chroma;
 * - hue stays the base hue;
 * - every value is gamut-mapped into sRGB and returned as lowercase `#rrggbb`.
 *
 * `baseHex` must be `#rgb` or `#rrggbb` (see `hexToOklch`); anything else
 * returns `[]`.
 */
export function buildColorScale(baseHex: string): ColorScaleStep[] {
  const base = baseOklch(baseHex)
  if (!base)
    return []
  const [lightness, chroma, hue] = base
  return COLOR_SCALE_STEPS.map((step, index) => {
    const target = LIGHTNESS[index]!
    const l = index < 5
      ? 100 - ((100 - target) * (100 - lightness)) / (100 - BASE_LIGHTNESS)
      : (target * lightness) / BASE_LIGHTNESS
    return { step, value: oklchToHex([l / 100, chroma * CHROMA[index]!, hue]) }
  })
}

/**
 * The scale as CSS custom properties: one `--<prefix>-<step>: <hex>;` line
 * per step, joined by `"\n"`. An empty scale gives `""`. `prefix` is used
 * as is.
 */
export function buildColorScaleCss(scale: readonly ColorScaleStep[], prefix: string): string {
  return scale.map(({ step, value }) => `--${prefix}-${step}: ${value};`).join('\n')
}
