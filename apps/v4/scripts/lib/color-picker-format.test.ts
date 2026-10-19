import type { Color, HSBColor, RGBColor } from 'reka-ui'
import type { ColorPickerFormat } from '@/registry/bases/reka/ui/color-picker/format'
import assert from 'node:assert/strict'
import { describe, it } from 'vitest'
import * as rekaOklch from '@/registry/bases/reka/lib/oklch'
import * as rekaFormat from '@/registry/bases/reka/ui/color-picker/format'
import * as rekaUtils from '@/registry/bases/reka/ui/color-picker/utils'
import * as newYorkOklch from '@/registry/new-york-v4/lib/oklch'
import * as newYorkFormat from '@/registry/new-york-v4/ui/color-picker/format'
import * as newYorkUtils from '@/registry/new-york-v4/ui/color-picker/utils'
import fixtures from './__fixtures__/color-picker-format.fixtures.json'

// Expected strings come from the spec tables (specs/color-picker/spec.md,
// "Format fields" and "Copy action") and from reui's reference formatColor
// (MIT), generated once into the fixture; see its `$comment`. They are never
// derived from the code under test.

type Triple = [number, number, number]
type CssByFormat = Record<ColorPickerFormat, string>

const HEX_RE = /^#[0-9a-f]{6}$/
const ALL_FORMATS = ['hex', 'rgb', 'hsl', 'hsb', 'oklch'] as const

/* Shapes the spec requires of each preview (design D4): integers for RGB; one
   decimal for HSL/HSB with ".0" dropped and no sign; OKLCH to 2/5/3 decimals
   with trailing zeros dropped. */
const INT = String.raw`(?:0|[1-9]\d{0,2})`
const ONE_DECIMAL = String.raw`(?:0|[1-9]\d*)(?:\.[1-9])?`
const PREVIEW_RE: Record<Exclude<ColorPickerFormat, 'hex'>, RegExp> = {
  rgb: new RegExp(`^${INT} ${INT} ${INT}$`),
  hsl: new RegExp(`^${ONE_DECIMAL} ${ONE_DECIMAL}% ${ONE_DECIMAL}%$`),
  hsb: new RegExp(`^${ONE_DECIMAL} ${ONE_DECIMAL}% ${ONE_DECIMAL}%$`),
  oklch: /^(?:0|[1-9]\d*)(?:\.\d?[1-9])?% (?:0|[1-9]\d*)(?:\.\d{0,4}[1-9])? (?:0|[1-9]\d*)(?:\.\d{0,2}[1-9])?$/,
}

/* The spec tables for #0ea5e9. */
const SPEC_PREVIEW: CssByFormat = {
  hex: '#0ea5e9',
  rgb: '14 165 233',
  hsl: '198.6 88.7% 48.4%',
  hsb: '198.6 94% 91.4%',
  oklch: '68.47% 0.14787 237.323',
}
const SPEC_CSS: CssByFormat = {
  hex: '#0ea5e9',
  rgb: 'rgb(14 165 233)',
  hsl: 'hsl(198.6 88.7% 48.4%)',
  hsb: 'hsb(198.6 94% 91.4%)',
  oklch: 'oklch(68.47% 0.14787 237.323)',
}

const hsb = (h: number, s: number, b: number, alpha = 1): HSBColor => ({ space: 'hsb', h, s, b, alpha })
const rgb = ([r, g, b]: Triple, alpha = 1): RGBColor => ({ space: 'rgb', r, g, b, alpha })

/* reui writes the CSS form; the preview is the same string without `name(...)`. */
const previewOf = (css: string) => css.startsWith('#') ? css : css.replace(/^[a-z]+\((.*)\)$/, '$1')

/** Every hex whose channels step by 0x10 (plus 0xff): 17^3 = 4913 colors. */
function hexGrid() {
  const levels = [...Array.from({ length: 16 }, (_, i) => i * 16), 255]
  const out: string[] = []
  for (const r of levels) {
    for (const g of levels) {
      for (const b of levels)
        out.push(`#${[r, g, b].map(v => v.toString(16).padStart(2, '0')).join('')}`)
    }
  }
  return out
}

/** All 256 sRGB grays. */
const GRAYS = Array.from({ length: 256 }, (_, i) => `#${i.toString(16).padStart(2, '0').repeat(3)}`)

function parseOklchCss(css: string): Triple {
  const match = /^oklch\((\S+)% (\S+) (\S+)\)$/.exec(css)
  assert.ok(match, `not an oklch() string: ${css}`)
  return [Number(match[1]), Number(match[2]), Number(match[3])]
}

function frozen<T extends object>(value: T): T {
  return Object.freeze(value)
}

const SOURCES = [
  ['reka base', rekaFormat, rekaUtils, rekaOklch],
  ['new-york-v4', newYorkFormat, newYorkUtils, newYorkOklch],
] as const

for (const [source, format, utils, oklch] of SOURCES) {
  const { COLOR_PICKER_FORMATS, formatColor, isColorPickerFormat, oklchChannels, parseHexInput } = format
  const { DEFAULT_COLOR, toSafeColor } = utils
  const { hexToOklch, oklchToHex } = oklch

  /* The color as the picker holds it: HSB parsed from a hex. */
  const pickerColor = (hex: string) => toSafeColor(hex, DEFAULT_COLOR)

  describe(`color-picker format (${source})`, () => {
    describe('the OKLCH hue at zero chroma (task 1.4, design risk)', () => {
      // Documents the risk the OKLCH fields must cover with a local hue memory:
      // the lib and the channels it feeds the fields both drop a gray's hue.
      it('hexToOklch gives every sRGB gray hue 0', () => {
        for (const hex of GRAYS) {
          const lch = hexToOklch(hex)
          assert.ok(lch, `${hex} parses`)
          assert.equal(lch[2], 0, `${hex} hue`)
          assert.ok(lch[1] < 1e-4, `${hex} chroma ${lch[1]}`)
        }
      })

      it('oklchChannels gives a gray hue 0 and chroma 0, even when the HSB color keeps a hue', () => {
        // #0ea5e9's hue, with saturation 0: the picker keeps hue 198.6 in HSB.
        const gray = hsb(198.6, 0, 50.2)
        const [l, c, h] = oklchChannels(gray)
        assert.equal(c, 0)
        assert.equal(h, 0, 'the OKLCH hue is lost at chroma 0')
        assert.equal(l, 59.99)
        assert.equal(formatColor(gray, 'oklch'), '59.99% 0 0')
        for (const hex of GRAYS) {
          const [, gc, gh] = oklchChannels(pickerColor(hex))
          assert.equal(gc, 0, `${hex} chroma`)
          assert.equal(gh, 0, `${hex} hue`)
        }
      })

      it('a chromatic color keeps its hue, so chroma 0 is what loses it', () => {
        const [, c, h] = oklchChannels(pickerColor('#0ea5e9'))
        assert.ok(c > 0)
        assert.equal(h, 237.323)
      })
    })

    describe('the format list (COLOR_PICKER_FORMATS) and isColorPickerFormat', () => {
      it('lists the five formats in menu order', () => {
        assert.deepEqual([...COLOR_PICKER_FORMATS], ['hex', 'rgb', 'hsl', 'hsb', 'oklch'])
      })

      it('accepts exactly the five formats', () => {
        for (const value of COLOR_PICKER_FORMATS)
          assert.equal(isColorPickerFormat(value), true, value)
        const others: unknown[] = ['HEX', 'Rgb', 'hsv', 'hsla', 'rgba', 'lab', 'css', ' hex', 'oklch ', '', null, undefined, 0, 1, true, {}, ['hex'], { format: 'hex' }]
        for (const value of others)
          assert.equal(isColorPickerFormat(value), false, JSON.stringify(value))
      })
    })

    describe('formatColor: the spec tables for #0ea5e9', () => {
      const inputs: Array<[string, Color]> = [
        ['the picker\'s HSB color', pickerColor('#0ea5e9')],
        ['an RGB color', rgb([14, 165, 233])],
      ]
      for (const [name, color] of inputs) {
        it(`previews (${name})`, () => {
          for (const f of ALL_FORMATS)
            assert.equal(formatColor(color, f), SPEC_PREVIEW[f], f)
          for (const f of ALL_FORMATS)
            assert.equal(formatColor(color, f, { css: false }), SPEC_PREVIEW[f], `${f}, css: false`)
        })

        it(`copied CSS strings (${name})`, () => {
          for (const f of ALL_FORMATS)
            assert.equal(formatColor(color, f, { css: true }), SPEC_CSS[f], f)
        })
      }

      it('oklchChannels feeds the OKLCH fields 68.47, 0.14787 and 237.323', () => {
        assert.deepEqual(oklchChannels(pickerColor('#0ea5e9')), [68.47, 0.14787, 237.323])
      })
    })

    describe('formatColor: output rules', () => {
      const sample = fixtures.fromHex.map(entry => entry.hex)

      it('hex is lowercase #rrggbb with or without css', () => {
        for (const hex of sample) {
          const color = pickerColor(hex.toUpperCase())
          assert.equal(formatColor(color, 'hex'), hex)
          assert.equal(formatColor(color, 'hex', { css: true }), hex)
          assert.match(formatColor(rgb([255.4, 0.2, 127.5]), 'hex'), HEX_RE)
        }
      })

      it('every preview has the required shape, and the css form wraps it in name(...)', () => {
        for (const hex of sample) {
          const color = pickerColor(hex)
          for (const f of ['rgb', 'hsl', 'hsb', 'oklch'] as const) {
            const preview = formatColor(color, f)
            assert.match(preview, PREVIEW_RE[f], `${hex} ${f}`)
            assert.equal(formatColor(color, f, { css: true }), `${f}(${preview})`, `${hex} ${f} css`)
          }
          for (const channel of formatColor(color, 'rgb').split(' ').map(Number))
            assert.ok(Number.isInteger(channel) && channel >= 0 && channel <= 255, `${hex} rgb ${channel}`)
        }
      })

      it('drops a trailing ".0" (pure red is 0 100% 50%)', () => {
        assert.equal(formatColor(pickerColor('#ff0000'), 'hsl'), '0 100% 50%')
        assert.equal(formatColor(pickerColor('#ff0000'), 'hsb'), '0 100% 100%')
        assert.equal(formatColor(hsb(120, 40, 60), 'hsb', { css: true }), 'hsb(120 40% 60%)')
        assert.equal(formatColor(pickerColor('#ffffff'), 'oklch'), '100% 0 0')
        assert.equal(formatColor(pickerColor('#000000'), 'oklch'), '0% 0 0')
      })

      it('never writes "-0"', () => {
        for (const h of [-0, -0.01, -0.04]) {
          for (const f of ['hsl', 'hsb'] as const) {
            const out = formatColor(hsb(h, 0, 0), f)
            assert.equal(out, '0 0% 0%', `${f} of hue ${Object.is(h, -0) ? '-0' : h}`)
            assert.doesNotMatch(formatColor(hsb(h, 0, 0), f, { css: true }), /-0/)
          }
        }
        for (const hex of GRAYS) {
          for (const f of ALL_FORMATS)
            assert.doesNotMatch(formatColor(pickerColor(hex), f, { css: true }), /-/, `${hex} ${f}`)
        }
      })

      it('an HSB color keeps its hue in HSL: a gray at hue 198.6', () => {
        const gray = hsb(198.6, 0, 50.2)
        assert.equal(formatColor(gray, 'hsl'), '198.6 0% 50.2%')
        assert.equal(formatColor(gray, 'hsl', { css: true }), 'hsl(198.6 0% 50.2%)')
        assert.equal(formatColor(gray, 'hsb', { css: true }), 'hsb(198.6 0% 50.2%)')
        assert.equal(formatColor(gray, 'rgb'), '128 128 128')
        assert.equal(formatColor(gray, 'hex'), '#808080')
      })

      it('ignores alpha', () => {
        for (const hex of ['#0ea5e9', '#7c3aed', '#808080', '#000000']) {
          const opaque = pickerColor(hex)
          for (const alpha of [0, 0.5, 0.996]) {
            const translucent = { ...opaque, alpha }
            for (const f of ALL_FORMATS) {
              assert.equal(formatColor(translucent, f), formatColor(opaque, f), `${hex} ${f} alpha ${alpha}`)
              assert.equal(formatColor(translucent, f, { css: true }), formatColor(opaque, f, { css: true }), `${hex} ${f} css alpha ${alpha}`)
            }
          }
        }
        assert.equal(formatColor(rgb([14, 165, 233], 0.25), 'rgb', { css: true }), 'rgb(14 165 233)')
      })

      it('is pure: it does not mutate its input and repeats its output', () => {
        const color = frozen(hsb(198.6, 0, 50.2))
        const options = frozen({ css: true })
        for (const f of ALL_FORMATS) {
          const first = formatColor(color, f, options)
          assert.equal(formatColor(color, f, options), first)
        }
        assert.deepEqual(color, hsb(198.6, 0, 50.2))
        assert.deepEqual(options, { css: true })
      })

      it('never throws for a color with finite channels in any space', () => {
        const colors: Color[] = [
          rgb([300, -5, 127.6]),
          hsb(400, 150, -5),
          hsb(-30, 50, 130),
          { space: 'hsl', h: 720, s: 120, l: -10, alpha: 1 },
          { space: 'hsl', h: 198.6, s: 88.7, l: 48.4, alpha: 1 },
        ]
        for (const color of colors) {
          for (const f of ALL_FORMATS) {
            for (const css of [false, true]) {
              let out: unknown
              assert.doesNotThrow(() => {
                out = formatColor(color, f, { css })
              }, `${JSON.stringify(color)} ${f}`)
              assert.equal(typeof out, 'string')
            }
          }
          assert.match(formatColor(color, 'hex'), HEX_RE)
          assert.match(formatColor(color, 'rgb'), PREVIEW_RE.rgb)
        }
      })
    })

    describe('formatColor matches reui\'s formatColor (fixture)', () => {
      it('for RGB colors parsed from a hex', () => {
        const mismatches: string[] = []
        for (const entry of fixtures.fromHex) {
          const color = rgb(entry.rgb as Triple)
          for (const f of ALL_FORMATS) {
            const expected = (entry.css as CssByFormat)[f]
            const css = formatColor(color, f, { css: true })
            const preview = formatColor(color, f)
            if (css !== expected || preview !== previewOf(expected))
              mismatches.push(`${entry.hex} ${f}: ${css} / ${preview}, reui ${expected}`)
          }
        }
        assert.deepEqual(mismatches, [])
      })

      it('for the same colors as HSB, with reui\'s HSB channels', () => {
        const mismatches: string[] = []
        for (const entry of fixtures.fromHex) {
          const [h, s, b] = entry.hsb as Triple
          const color = hsb(h, s, b)
          for (const f of ALL_FORMATS) {
            const expected = (entry.css as CssByFormat)[f]
            const css = formatColor(color, f, { css: true })
            const preview = formatColor(color, f)
            if (css !== expected || preview !== previewOf(expected))
              mismatches.push(`${entry.hex} ${f}: ${css} / ${preview}, reui ${expected}`)
          }
        }
        assert.deepEqual(mismatches, [])
      })

      it('for the picker\'s own HSB color (toSafeColor) of each hex', () => {
        const mismatches: string[] = []
        for (const entry of fixtures.fromHex) {
          const color = pickerColor(entry.hex)
          for (const f of ALL_FORMATS) {
            const expected = (entry.css as CssByFormat)[f]
            if (formatColor(color, f, { css: true }) !== expected)
              mismatches.push(`${entry.hex} ${f}: ${formatColor(color, f, { css: true })}, reui ${expected}`)
          }
        }
        assert.deepEqual(mismatches, [])
      })

      it('for fractional HSB colors (grays keep their hue; OKLCH is read from the hex)', () => {
        const mismatches: string[] = []
        for (const entry of fixtures.fromHsb) {
          const [h, s, b] = entry.hsb as Triple
          const color = hsb(h, s, b)
          for (const f of ALL_FORMATS) {
            const expected = (entry.css as CssByFormat)[f]
            const css = formatColor(color, f, { css: true })
            const preview = formatColor(color, f)
            if (css !== expected || preview !== previewOf(expected))
              mismatches.push(`hsb(${entry.hsb.join(' ')}) ${f}: ${css} / ${preview}, reui ${expected}`)
          }
        }
        assert.deepEqual(mismatches, [])
      })
    })

    describe('oklchChannels and the OKLCH quantization round trip', () => {
      it('matches the numbers of the OKLCH preview, quantized to 2/5/3 decimals', () => {
        for (const entry of fixtures.fromHex) {
          const color = pickerColor(entry.hex)
          const channels = oklchChannels(color)
          assert.deepEqual(channels, parseOklchCss(formatColor(color, 'oklch', { css: true })), entry.hex)
          const [l, c, h] = channels
          assert.equal(l, Number(l.toFixed(2)), `${entry.hex} L`)
          assert.equal(c, Number(c.toFixed(5)), `${entry.hex} C`)
          assert.equal(h, Number(h.toFixed(3)), `${entry.hex} H`)
          assert.ok(l >= 0 && l <= 100, `${entry.hex} L ${l}`)
          assert.ok(c >= 0, `${entry.hex} C ${c}`)
          assert.ok(h >= 0 && h < 360, `${entry.hex} H ${h}`)
        }
      })

      it('reads the hex, so the HSB and RGB forms of a color agree', () => {
        for (const entry of fixtures.fromHex)
          assert.deepEqual(oklchChannels(rgb(entry.rgb as Triple)), oklchChannels(pickerColor(entry.hex)), entry.hex)
      })

      it('hex -> OKLCH string -> oklchToHex gives the same hex for a 4913-color grid and the fixture sample', () => {
        const drift: string[] = []
        for (const hex of [...hexGrid(), ...fixtures.fromHex.map(entry => entry.hex)]) {
          const [l, c, h] = parseOklchCss(formatColor(pickerColor(hex), 'oklch', { css: true }))
          const back = oklchToHex([l / 100, c, h])
          if (back !== hex)
            drift.push(`${hex} -> ${back}`)
        }
        assert.deepEqual(drift, [])
      })

      it('hex -> oklchChannels -> oklchToHex is the identity on the same sample', () => {
        const drift: string[] = []
        for (const hex of [...hexGrid(), ...GRAYS]) {
          const [l, c, h] = oklchChannels(pickerColor(hex))
          const back = oklchToHex([l / 100, c, h])
          if (back !== hex)
            drift.push(`${hex} -> ${back}`)
        }
        assert.deepEqual(drift, [])
      })
    })

    describe('parseHexInput', () => {
      it('accepts 6 digits with or without #, in any case, trimming whitespace', () => {
        const valid: Array<[string, string]> = [
          ['7c3aed', '#7c3aed'],
          ['#7c3aed', '#7c3aed'],
          ['7C3AED', '#7c3aed'],
          ['#7C3aEd', '#7c3aed'],
          ['  #0ea5e9  ', '#0ea5e9'],
          ['\t0EA5E9\n', '#0ea5e9'],
          ['000000', '#000000'],
          ['#FFFFFF', '#ffffff'],
        ]
        for (const [input, expected] of valid)
          assert.equal(parseHexInput(input), expected, JSON.stringify(input))
      })

      it('expands 3 digits', () => {
        const valid: Array<[string, string]> = [
          ['fff', '#ffffff'],
          ['#000', '#000000'],
          ['F0a', '#ff00aa'],
          ['#7C3', '#77cc33'],
          [' abc ', '#aabbcc'],
        ]
        for (const [input, expected] of valid)
          assert.equal(parseHexInput(input), expected, JSON.stringify(input))
      })

      it('returns null for 4 or 8 digits and anything else', () => {
        const invalid = [
          '',
          ' ',
          '#',
          'f',
          'ff',
          '#ff',
          'ffff', // 4 digits (#rgba)
          '#f008',
          '7c3ae', // 5
          '7c3aedd', // 7
          '7c3aed80', // 8 digits (#rrggbbaa)
          '#7c3aed80',
          '##7c3aed',
          '#7c3aeg',
          'ggg',
          '# 7c3aed',
          '7c 3aed',
          '0x7c3aed',
          '#-7c3ae',
          'rgb(124, 58, 237)',
          'oklch(0.6 0.2 260)',
          'red',
        ]
        for (const input of invalid)
          assert.equal(parseHexInput(input), null, JSON.stringify(input))
      })

      it('always returns lowercase #rrggbb or null', () => {
        for (const entry of fixtures.fromHex) {
          for (const input of [entry.hex, entry.hex.slice(1), entry.hex.toUpperCase(), entry.hex.slice(1).toUpperCase()])
            assert.equal(parseHexInput(input), entry.hex, input)
        }
      })
    })
  })
}

describe('color-picker format: reka base and new-york-v4 agree', () => {
  it('export the same names', () => {
    assert.deepEqual(Object.keys(rekaFormat).sort(), Object.keys(newYorkFormat).sort())
    assert.deepEqual([...rekaFormat.COLOR_PICKER_FORMATS], [...newYorkFormat.COLOR_PICKER_FORMATS])
  })

  it('format every fixture color identically, in every format and mode', () => {
    const colors: Color[] = [
      ...fixtures.fromHex.flatMap(entry => [rgb(entry.rgb as Triple), rekaUtils.toSafeColor(entry.hex, rekaUtils.DEFAULT_COLOR)]),
      ...fixtures.fromHsb.map(({ hsb: [h, s, b] }) => hsb(h!, s!, b!)),
    ]
    for (const color of colors) {
      for (const f of ALL_FORMATS) {
        assert.equal(rekaFormat.formatColor(color, f), newYorkFormat.formatColor(color, f), `${JSON.stringify(color)} ${f}`)
        assert.equal(rekaFormat.formatColor(color, f, { css: true }), newYorkFormat.formatColor(color, f, { css: true }), `${JSON.stringify(color)} ${f} css`)
      }
      assert.deepEqual(rekaFormat.oklchChannels(color), newYorkFormat.oklchChannels(color))
    }
  })

  it('parse hex input and check formats identically', () => {
    for (const input of ['7c3aed', '#FFF', ' abc ', 'ffff', '#7c3aed80', '', 'red', '##000'])
      assert.equal(rekaFormat.parseHexInput(input), newYorkFormat.parseHexInput(input), JSON.stringify(input))
    for (const value of ['hex', 'rgb', 'hsl', 'hsb', 'oklch', 'hsv', 'HEX', null])
      assert.equal(rekaFormat.isColorPickerFormat(value), newYorkFormat.isColorPickerFormat(value), String(value))
  })
})
