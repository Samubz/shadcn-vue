import assert from 'node:assert/strict'
import { describe, it } from 'vitest'
import { createApp } from 'vue'
import { hexToOklch } from '@/registry/bases/reka/lib/oklch'
import * as rekaScale from '@/registry/bases/reka/ui/color-scale/scale'
import * as rekaScaleUtils from '@/registry/bases/reka/ui/color-scale/utils'
import * as newYorkScale from '@/registry/new-york-v4/ui/color-scale/scale'
import * as newYorkScaleUtils from '@/registry/new-york-v4/ui/color-scale/utils'
import fixtures from './__fixtures__/color-scale.fixtures.json'

// Fixtures were generated once from reui's reference buildScale (MIT); see the
// `$comment` in the JSON. They are never derived from the code under test.

const STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]
/* Tailwind blue's lightness per step (design D7). */
const LIGHTNESS = [97, 93.2, 88.2, 80.9, 70.7, 62.3, 54.6, 48.8, 42.4, 37.9, 28.2]
const HEX_RE = /^#[0-9a-f]{6}$/

const lightnessOf = (hex: string) => hexToOklch(hex)![0]
const hueDistance = (a: number, b: number) => Math.abs(((a - b + 540) % 360) - 180)
const channels = (hex: string) => [1, 3, 5].map(i => Number.parseInt(hex.slice(i, i + 2), 16))

/** The 216 web-safe colors: a broad, even sweep of the sRGB cube. */
function webSafe() {
  const levels = [0x00, 0x33, 0x66, 0x99, 0xCC, 0xFF]
  const out: string[] = []
  for (const r of levels) {
    for (const g of levels) {
      for (const b of levels)
        out.push(`#${[r, g, b].map(v => v.toString(16).padStart(2, '0')).join('')}`)
    }
  }
  return out
}

/* Both sources ship the scale (design D9), so both are held to the same contract. */
for (const [source, { COLOR_SCALE_STEPS, buildColorScale, buildColorScaleCss }] of [
  ['reka base', rekaScale],
  ['new-york-v4', newYorkScale],
] as const) {
  describe(`color scale (${source})`, () => {
    it('exports the 11 steps 50..950 in order', () => {
      assert.deepEqual([...COLOR_SCALE_STEPS], STEPS)
    })

    it('returns 11 steps in order, each a lowercase #rrggbb', () => {
      for (const hex of [...fixtures.bases.map(b => b.hex), ...webSafe()]) {
        const scale = buildColorScale(hex)
        assert.deepEqual(scale.map(s => s.step), STEPS, `steps of ${hex}`)
        for (const { step, value } of scale)
          assert.match(value, HEX_RE, `${hex} step ${step}`)
      }
    })

    it('matches the reference fixtures for every fixture base', () => {
      for (const base of fixtures.bases)
        assert.deepEqual(buildColorScale(base.hex), base.scale, `scale of ${base.hex}`)
    })

    it('reference base #7c3aed: matches the fixture and step 500 is #7c3aed', () => {
      const scale = buildColorScale('#7c3aed')
      const fixture = fixtures.bases.find(b => b.hex === '#7c3aed')!
      assert.deepEqual(scale, fixture.scale)
      assert.equal(scale.find(s => s.step === 500)?.value, '#7c3aed')
    })

    it('pins step 500 to the base exactly for the fixture bases', () => {
      for (const base of fixtures.bases)
        assert.equal(buildColorScale(base.hex)[5]!.value, base.hex, `500 of ${base.hex}`)
    })

    it('pins step 500 to the base within gamut-mapping rounding (one unit per channel) across the sRGB cube', () => {
      for (const hex of webSafe()) {
        const got = channels(buildColorScale(hex)[5]!.value)
        const want = channels(hex)
        assert.ok(got.every((v, i) => Math.abs(v - want[i]!) <= 1), `500 of ${hex} is ${buildColorScale(hex)[5]!.value}`)
      }
    })

    it('lightness never increases from 50 to 950', () => {
      for (const hex of [...fixtures.bases.map(b => b.hex), ...webSafe()]) {
        const ls = buildColorScale(hex).map(s => lightnessOf(s.value))
        for (let i = 1; i < ls.length; i++)
          assert.ok(ls[i]! <= ls[i - 1]! + 1e-12, `${hex}: L(${STEPS[i]}) > L(${STEPS[i - 1]})`)
      }
    })

    it('lightness strictly decreases for bases other than #ffffff and #000000', () => {
      const bases = [...fixtures.bases.map(b => b.hex), ...webSafe()]
        .filter(hex => hex !== '#ffffff' && hex !== '#000000')
      for (const hex of bases) {
        const ls = buildColorScale(hex).map(s => lightnessOf(s.value))
        for (let i = 1; i < ls.length; i++)
          assert.ok(ls[i]! < ls[i - 1]!, `${hex}: L(${STEPS[i]}) is not below L(${STEPS[i - 1]})`)
      }
    })

    it('saturates at pure white and black, with equal neighbors as in the reference', () => {
      const white = buildColorScale('#ffffff').map(s => s.value)
      assert.deepEqual(white.slice(0, 6), Array.from({ length: 6 }, () => '#ffffff'))
      const black = buildColorScale('#000000').map(s => s.value)
      assert.deepEqual(black.slice(5), Array.from({ length: 6 }, () => '#000000'))
    })

    it('lightness follows Tailwind blue bent around the base (design D7), within the gamut-mapping JND', () => {
      for (const hex of [...fixtures.bases.map(b => b.hex), ...webSafe()]) {
        const base = lightnessOf(hex) * 100
        buildColorScale(hex).forEach(({ step, value }, i) => {
          const target = i < 5
            ? 100 - ((100 - LIGHTNESS[i]!) * (100 - base)) / (100 - 62.3)
            : (LIGHTNESS[i]! * base) / 62.3
          const l = lightnessOf(value)
          assert.ok(Math.abs(l - target / 100) <= 0.02, `${hex} step ${step}: L ${l} vs target ${target / 100}`)
        })
      }
    })

    it('keeps the base hue on every chromatic step', () => {
      for (const base of fixtures.bases) {
        const [, baseChroma, baseHue] = hexToOklch(base.hex)!
        if (baseChroma < 1e-4)
          continue
        for (const { step, value } of buildColorScale(base.hex)) {
          const [, c, h] = hexToOklch(value)!
          if (c < 0.01)
            continue // 8-bit rounding makes the hue of near-grays meaningless
          assert.ok(hueDistance(h, baseHue) <= 8, `${base.hex} step ${step}: hue ${h} vs ${baseHue}`)
        }
      }
    })

    it('gray bases give gray scales', () => {
      for (const hex of ['#000000', '#ffffff', '#808080']) {
        for (const { value } of buildColorScale(hex)) {
          const [r, g, b] = channels(value)
          assert.ok(r === g && g === b, `${hex} produced ${value}`)
        }
      }
    })

    it('#ff0000: every value is a valid hex and 600/700 are gamut-mapped, not naively clipped', () => {
      const red = fixtures.bases.find(b => b.hex === '#ff0000')!
      const scale = buildColorScale('#ff0000')
      for (const { value } of scale)
        assert.match(value, HEX_RE)
      for (const step of [600, 700]) {
        const i = STEPS.indexOf(step)
        assert.equal(red.targetInSrgb[i], false, `fixture: ${step} target must be out of sRGB`)
        assert.notEqual(red.scale[i]!.value, red.naiveClip[i], `fixture: ${step} must differ from naive clipping`)
        assert.equal(scale[i]!.value, red.scale[i]!.value, `step ${step}`)
        assert.notEqual(scale[i]!.value, red.naiveClip[i], `step ${step} is naively clipped`)
      }
    })

    it('accepts #rgb shorthand and uppercase like #rrggbb', () => {
      assert.deepEqual(buildColorScale('#f00'), buildColorScale('#ff0000'))
      assert.deepEqual(buildColorScale('#7C3AED'), buildColorScale('#7c3aed'))
    })

    it('returns [] for an unparseable base', () => {
      const invalid: unknown[] = [
        'oklch(nope)',
        'oklch(0.6 0.2 260)',
        '7c3aed',
        '#7c3aed80',
        ' #7c3aed',
        '',
        'rgb(124, 58, 237)',
        'notacolor',
        null,
        undefined,
        42,
      ]
      for (const value of invalid)
        assert.deepEqual(buildColorScale(value as string), [], `buildColorScale(${JSON.stringify(value)})`)
    })

    describe('buildColorScaleCss', () => {
      it('writes one --<prefix>-<step>: <hex>; line per step with a custom prefix', () => {
        const scale = buildColorScale('#7c3aed')
        const css = buildColorScaleCss(scale, 'accent')
        const lines = css.split('\n')
        assert.equal(lines.length, 11)
        assert.ok(lines[0]!.startsWith('--accent-50:'))
        assert.ok(lines[10]!.startsWith('--accent-950:'))
        lines.forEach((line, i) => {
          assert.equal(line, `--accent-${STEPS[i]}: ${scale[i]!.value};`)
        })
        assert.ok(!css.endsWith('\n'))
      })

      it('uses the prefix as given', () => {
        const scale = buildColorScale('#3b82f6')
        assert.ok(buildColorScaleCss(scale, 'brand').startsWith('--brand-50: '))
        assert.ok(buildColorScaleCss(scale, 'my-color').startsWith('--my-color-50: '))
      })

      it('gives "" for an empty scale', () => {
        assert.equal(buildColorScaleCss([], 'brand'), '')
        assert.equal(buildColorScaleCss(buildColorScale('oklch(nope)'), 'brand'), '')
      })

      it('end to end: hex in -> buildColorScale -> buildColorScaleCss matches the reference', () => {
        for (const base of fixtures.bases) {
          const expected = base.scale.map(({ step, value }) => `--brand-${step}: ${value};`).join('\n')
          assert.equal(buildColorScaleCss(buildColorScale(base.hex), 'brand'), expected, base.hex)
        }
        assert.equal(
          buildColorScaleCss(buildColorScale('#7c3aed'), 'brand').split('\n')[5],
          '--brand-500: #7c3aed;',
        )
      })
    })
  })
}

for (const [source, { injectColorScaleContext }] of [
  ['reka base', rekaScaleUtils],
  ['new-york-v4', newYorkScaleUtils],
] as const) {
  it(`injectColorScaleContext names the part when used outside <ColorScale> (${source})`, () => {
    // An app context with no ColorScale provider: inject() resolves to the fallback.
    const app = createApp({ render: () => null })
    assert.throws(
      () => app.runWithContext(() => injectColorScaleContext('ColorScaleCopy')),
      { message: '<ColorScaleCopy> must be used within <ColorScale>' },
    )
    assert.throws(
      () => app.runWithContext(() => injectColorScaleContext('ColorScaleSwatches')),
      { message: '<ColorScaleSwatches> must be used within <ColorScale>' },
    )
  })
}
