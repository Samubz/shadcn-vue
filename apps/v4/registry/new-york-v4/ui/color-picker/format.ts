import type { Color } from "reka-ui"
import { convertToRgb } from "reka-ui"
import { hexToOklch } from "@/registry/new-york-v4/lib/oklch"
import { toHex, toHsb } from "./utils"

/** The formats `ColorPickerFields` can show and `ColorPickerCopy` can copy, in menu order. */
export const COLOR_PICKER_FORMATS = ["hex", "rgb", "hsl", "hsb", "oklch"] as const

/** One of `COLOR_PICKER_FORMATS`. It only changes what is shown and copied, never what `ColorPicker` emits. */
export type ColorPickerFormat = (typeof COLOR_PICKER_FORMATS)[number]

/** Whether `value` is one of `COLOR_PICKER_FORMATS`, e.g. for a menu's untyped `update:modelValue`. */
export function isColorPickerFormat(value: unknown): value is ColorPickerFormat {
  return (COLOR_PICKER_FORMATS as readonly unknown[]).includes(value)
}

export interface FormatColorOptions {
  /**
   * `true` returns the CSS-style string that is copied (`rgb(14 165 233)`);
   * `false` (the default) returns the menu preview, the same string without
   * the `name(...)` wrapper (`14 165 233`). Hex is `#rrggbb` either way.
   */
  css?: boolean
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

const wrapHue = (hue: number) => ((hue % 360) + 360) % 360

const quantize = (value: number, digits: number) => Number(value.toFixed(digits))

/* At most `digits` decimals, trailing zeros dropped, never "-0". */
const fixed = (value: number, digits: number) => String(quantize(value, digits) + 0)

type Triple = [number, number, number]

/* HSB to HSL, with reui's formula. The hue is carried over, so a gray keeps it. */
function hsbToHsl([hue, saturation, brightness]: Triple): Triple {
  const s = saturation / 100
  const v = brightness / 100
  const l = v * (1 - s / 2)
  const sl = l === 0 || l === 1 ? 0 : (v - l) / Math.min(l, 1 - l)
  return [hue, sl * 100, l * 100]
}

/* HSB channels (s and b clamped to 0..100) of any color, through `toHsb`
   (reui's formula), so the decimals round the way reui's do. */
function hsbChannels(color: Color): Triple {
  const { h, s, b } = toHsb(color)
  return [h, clamp(s, 0, 100), clamp(b, 0, 100)]
}

/* HSL channels of any color: an HSL color as is, others through HSB. */
function hslChannels(color: Color): Triple {
  if (color.space === "hsl")
    return [color.h, clamp(color.s, 0, 100), clamp(color.l, 0, 100)]
  return hsbToHsl(hsbChannels(color))
}

/**
 * The color in OKLCH, quantized the way `color-scale`'s `scale.ts` (and
 * reui) round it, so `oklch(L% C H)` round-trips through hex:
 * - `l`: lightness in percent, 0..100, to 2 decimals;
 * - `c`: chroma, >= 0, to 5 decimals;
 * - `h`: hue in degrees, [0, 360), to 3 decimals.
 *
 * It is read from the color's lowercase `#rrggbb` (`toHex`), so it matches
 * what the picker emits. An achromatic color (chroma below 1e-4) gets hue 0;
 * a caller that must keep the hue (the OKLCH fields) remembers it itself.
 */
export function oklchChannels(color: Color): [l: number, c: number, h: number] {
  /* `toHex` always returns a valid `#rrggbb`, so `hexToOklch` never returns null. */
  const [l, c, h] = hexToOklch(toHex(color)) ?? [0, 0, 0]
  return [
    clamp(quantize(l * 100, 2), 0, 100),
    Math.max(0, quantize(Math.max(0, c), 5)),
    /* Wrapped, then re-quantized so the modulo leaves no float noise. */
    quantize(wrapHue(quantize(h, 3)), 3) % 360,
  ]
}

/**
 * Writes a reka `Color` (any space) in `format`, ignoring alpha. For `#0ea5e9`:
 *
 * | format | preview                  | `{ css: true }`                 |
 * | ------ | ------------------------ | ------------------------------- |
 * | hex    | `#0ea5e9`                | `#0ea5e9`                       |
 * | rgb    | `14 165 233`             | `rgb(14 165 233)`               |
 * | hsl    | `198.6 88.7% 48.4%`      | `hsl(198.6 88.7% 48.4%)`        |
 * | hsb    | `198.6 94% 91.4%`        | `hsb(198.6 94% 91.4%)`          |
 * | oklch  | `68.47% 0.14787 237.323` | `oklch(68.47% 0.14787 237.323)` |
 *
 * - hex: lowercase `#rrggbb` (`toHex`).
 * - rgb: integers 0..255.
 * - hsl / hsb: computed from the exact channels (not rounded RGB), one
 *   decimal with trailing zeros dropped. The hue is not wrapped, so the
 *   picker's hue 360 writes `360`. An HSB color keeps its hue in HSL.
 * - oklch: `oklchChannels`.
 *
 * Pure and never throws for a `Color` with finite channels.
 */
export function formatColor(color: Color, format: ColorPickerFormat, options: FormatColorOptions = {}): string {
  if (format === "hex")
    return toHex(color)

  let channels: string
  if (format === "rgb") {
    const { r, g, b } = convertToRgb(color)
    channels = [r, g, b].map(channel => Math.round(clamp(channel, 0, 255))).join(" ")
  }
  else if (format === "oklch") {
    const [l, c, h] = oklchChannels(color)
    channels = `${fixed(l, 2)}% ${fixed(c, 5)} ${fixed(h, 3)}`
  }
  else {
    const [h, s, third] = format === "hsl" ? hslChannels(color) : hsbChannels(color)
    channels = `${fixed(h, 1)} ${fixed(s, 1)}% ${fixed(third, 1)}%`
  }
  return options.css ? `${format}(${channels})` : channels
}

/**
 * Parses what a user typed in the HEX field: 3 or 6 hex digits, with or
 * without a leading `#`, in any case, ignoring surrounding whitespace.
 * Returns lowercase `#rrggbb` (3 digits are expanded), or `null` for
 * anything else (including 4 or 8 digits).
 */
export function parseHexInput(text: string): string | null {
  const match = /^#?([\da-f]{3}|[\da-f]{6})$/i.exec(text.trim())
  if (!match)
    return null
  const digits = match[1]!.toLowerCase()
  return `#${digits.length === 3 ? [...digits].map(digit => digit + digit).join("") : digits}`
}
