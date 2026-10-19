import type { HSBColor } from 'reka-ui'
import assert from 'node:assert/strict'
import { describe, it } from 'vitest'
import { createApp } from 'vue'
import * as rekaUtils from '@/registry/bases/reka/ui/color-picker/utils'
import * as newYorkUtils from '@/registry/new-york-v4/ui/color-picker/utils'

const HEX_RE = /^#[0-9a-f]{6}$/

const hsb = (h: number, s: number, b: number, alpha = 1): HSBColor => ({ space: 'hsb', h, s, b, alpha })

/* Both sources ship the same helpers (design D9). */
for (const [source, { DEFAULT_COLOR, injectColorPickerContext, toHex, toSafeColor }] of [
  ['reka base', rekaUtils],
  ['new-york-v4', newYorkUtils],
] as const) {
  describe(`color-picker utils (${source})`, () => {
    describe('the default color (DEFAULT_COLOR)', () => {
      it('is #000000 in hsb with alpha 1, and frozen', () => {
        assert.equal(DEFAULT_COLOR.space, 'hsb')
        assert.equal(DEFAULT_COLOR.alpha, 1)
        assert.equal(toHex(DEFAULT_COLOR), '#000000')
        assert.ok(Object.isFrozen(DEFAULT_COLOR))
      })
    })

    describe('toSafeColor: valid input (design D3)', () => {
      const fallback = hsb(200, 50, 50)

      it('converts a valid hex to hsb and keeps its value', () => {
        for (const hex of ['#7c3aed', '#0ea5e9', '#ff0000', '#3b82f6']) {
          const color = toSafeColor(hex, fallback)
          assert.equal(color.space, 'hsb')
          assert.equal(color.alpha, 1)
          assert.equal(toHex(color), hex)
        }
      })

      it('accepts #rgb and uppercase hex', () => {
        assert.equal(toHex(toSafeColor('#f00', fallback)), '#ff0000')
        assert.equal(toHex(toSafeColor('#7C3AED', fallback)), '#7c3aed')
      })

      it('drops the alpha of #rrggbbaa (alpha forced to 1)', () => {
        const color = toSafeColor('#7c3aed80', fallback)
        assert.equal(color.alpha, 1)
        assert.equal(toHex(color), '#7c3aed')
      })

      it('accepts comma rgb(), hsl() and hsb() strings', () => {
        assert.equal(toHex(toSafeColor('rgb(124, 58, 237)', fallback)), '#7c3aed')
        assert.equal(toHex(toSafeColor('hsl(0, 100%, 50%)', fallback)), '#ff0000')
        assert.equal(toHex(toSafeColor('hsb(0, 100%, 100%)', fallback)), '#ff0000')
      })

      it('accepts reka Color objects in rgb, hsl and hsb', () => {
        assert.equal(toHex(toSafeColor({ space: 'rgb', r: 124, g: 58, b: 237, alpha: 1 }, fallback)), '#7c3aed')
        assert.equal(toHex(toSafeColor({ space: 'hsl', h: 0, s: 100, l: 50, alpha: 1 }, fallback)), '#ff0000')
        const fromHsb = toSafeColor(hsb(120, 40, 60), fallback)
        assert.deepEqual(fromHsb, hsb(120, 40, 60))
      })

      it('forces alpha to 1 for translucent Color objects', () => {
        assert.equal(toSafeColor({ space: 'rgb', r: 124, g: 58, b: 237, alpha: 0.2 }, fallback).alpha, 1)
        assert.equal(toSafeColor(hsb(120, 40, 60, 0), fallback).alpha, 1)
      })

      it('clamps saturation and brightness to 0..100', () => {
        const color = toSafeColor(hsb(120, 150, 130), fallback)
        assert.equal(color.s, 100)
        assert.equal(color.b, 100)
        assert.equal(color.h, 120)
      })

      it('wraps the hue into 0..360', () => {
        assert.equal(toSafeColor(hsb(400, 50, 50), fallback).h, 40)
        assert.equal(toSafeColor(hsb(-30, 50, 50), fallback).h, 330)
        for (const h of [0, 180, 359.5]) {
          const out = toSafeColor(hsb(h, 50, 50), fallback).h
          assert.ok(out >= 0 && out <= 360, `h ${h} -> ${out}`)
        }
      })

      it('does not mutate its inputs', () => {
        const input = hsb(400, 150, 50, 0.5)
        const fb = hsb(10, 20, 30)
        toSafeColor(input, fb)
        assert.deepEqual(input, hsb(400, 150, 50, 0.5))
        assert.deepEqual(fb, hsb(10, 20, 30))
      })
    })

    describe('toSafeColor: invalid input never throws (design D4)', () => {
      const fallback = hsb(260, 70, 80)
      const invalid: Array<[string, unknown]> = [
        ['oklch() string', 'oklch(0.6 0.2 260)'],
        ['unprefixed hex', '7c3aed'],
        ['space-separated rgb()', 'rgb(1 2 3)'],
        ['named color', 'red'],
        ['garbage text', 'notacolor'],
        ['empty string', ''],
        ['malformed hex', '#7c3a'],
        ['null', null],
        ['undefined', undefined],
        ['a number', 0x7C3AED],
        ['NaN', Number.NaN],
        ['a boolean', true],
        ['an array', [124, 58, 237]],
        ['an empty object', {}],
        ['a lab-like object', { space: 'lab', l: 50, a: 20, b: -30, alpha: 1 }],
        ['an oklch-like object', { space: 'oklch', l: 0.6, c: 0.2, h: 260, alpha: 1 }],
        ['an rgb object with NaN', { space: 'rgb', r: Number.NaN, g: 0, b: 0, alpha: 1 }],
        ['an hsb object with Infinity', { space: 'hsb', h: Number.POSITIVE_INFINITY, s: 50, b: 50, alpha: 1 }],
        ['an rgb object missing channels', { space: 'rgb', alpha: 1 }],
      ]

      for (const [name, value] of invalid) {
        it(`returns the fallback for ${name}`, () => {
          let result: HSBColor | undefined
          assert.doesNotThrow(() => {
            result = toSafeColor(value, fallback)
          })
          assert.deepEqual(result, fallback)
        })
      }

      it('keeps the last valid color across a sequence that includes invalid values', () => {
        let state: HSBColor = DEFAULT_COLOR
        for (const next of ['#7c3aed', 'oklch(0.6 0.2 260)', '7c3aed', 'rgb(1 2 3)', null])
          state = toSafeColor(next, state)
        assert.equal(toHex(state), '#7c3aed')
      })

      it('falls back to #000000 when the first value is invalid and the fallback is DEFAULT_COLOR', () => {
        assert.equal(toHex(toSafeColor('oklch(0.6 0.2 260)', DEFAULT_COLOR)), '#000000')
      })
    })

    describe('toSafeColor: hue preserved on achromatic colors', () => {
      const fallback = hsb(200, 80, 90)

      it('keeps the fallback hue for grays, black and white', () => {
        for (const value of ['#808080', '#000000', '#ffffff', '#777', 'rgb(10, 10, 10)', 'hsl(120, 0%, 50%)']) {
          const color = toSafeColor(value, fallback)
          assert.equal(color.h, 200, `hue of ${value}`)
          assert.equal(toHex(color), toHex(toSafeColor(value, DEFAULT_COLOR)), `value of ${value} is unchanged`)
        }
      })

      it('keeps the fallback hue for an hsb color with saturation 0 or brightness 0', () => {
        assert.equal(toSafeColor(hsb(10, 0, 50), fallback).h, 200)
        assert.equal(toSafeColor(hsb(10, 50, 0), fallback).h, 200)
        assert.equal(toSafeColor(hsb(10, 50, -5), fallback).h, 200) // clamped to b = 0
      })

      it('scenario: hue 200, drag to gray, parent echoes the hex back, drag back out', () => {
        // State at hue 200 (as the hue slider would set it).
        let state = toSafeColor(hsb(200, 80, 90), DEFAULT_COLOR)
        assert.equal(state.h, 200)
        // The area thumb reaches saturation 0: reka emits a gray Color.
        state = toSafeColor({ ...state, s: 0 }, state)
        assert.equal(state.h, 200)
        // The parent echoes the emitted hex (a gray) back through v-model.
        const echoed = toHex(state)
        state = toSafeColor(echoed, state)
        assert.equal(state.h, 200, 'echoed gray hex reset the hue')
        // Dragging back to a saturated point keeps the slider's hue.
        state = toSafeColor({ ...state, s: 80 }, state)
        assert.equal(state.h, 200)
        const out = toSafeColor(toHex(state), DEFAULT_COLOR)
        assert.ok(Math.abs(out.h - 200) < 1, `resulting color hue ${out.h}`)
      })

      it('uses the new hue for chromatic colors', () => {
        assert.ok(Math.abs(toSafeColor('#ff0000', fallback).h) < 1e-9 || Math.abs(toSafeColor('#ff0000', fallback).h - 360) < 1e-9)
        assert.ok(Math.abs(toSafeColor('#00ff00', fallback).h - 120) < 1e-9)
      })
    })

    describe('toHex', () => {
      it('returns lowercase #rrggbb for every space', () => {
        assert.equal(toHex({ space: 'rgb', r: 124, g: 58, b: 237, alpha: 1 }), '#7c3aed')
        assert.equal(toHex({ space: 'hsl', h: 0, s: 100, l: 50, alpha: 1 }), '#ff0000')
        assert.equal(toHex(hsb(0, 0, 100)), '#ffffff')
        assert.equal(toHex(hsb(0, 0, 0)), '#000000')
        for (const h of [0, 45, 90, 200, 300, 359])
          assert.match(toHex(hsb(h, 73, 61)), HEX_RE)
      })

      it('ignores alpha', () => {
        assert.equal(toHex({ space: 'rgb', r: 124, g: 58, b: 237, alpha: 0.5 }), '#7c3aed')
        assert.equal(toHex({ space: 'rgb', r: 124, g: 58, b: 237, alpha: 0 }), '#7c3aed')
      })

      it('rounds and clamps rgb channels', () => {
        assert.equal(toHex({ space: 'rgb', r: 300, g: -5, b: 127.6, alpha: 1 }), '#ff0080')
        assert.equal(toHex({ space: 'rgb', r: 0.4, g: 254.5, b: 15.49, alpha: 1 }), '#00ff0f')
      })

      it('round-trips through toSafeColor for valid hex', () => {
        for (const hex of ['#7c3aed', '#3b82f6', '#0ea5e9', '#000000', '#ffffff', '#ff0000', '#123456', '#abcdef'])
          assert.equal(toHex(toSafeColor(hex, DEFAULT_COLOR)), hex)
      })
    })

    describe('injectColorPickerContext', () => {
      it('throws an error naming the part outside <ColorPicker>', () => {
        // An app context with no ColorPicker provider: inject() resolves to the fallback.
        const app = createApp({ render: () => null })
        for (const part of ['ColorPickerArea', 'ColorPickerSlider', 'ColorPickerInput', 'ColorPickerTrigger', 'ColorPickerContent', 'ColorPickerSwatch']) {
          assert.throws(
            () => app.runWithContext(() => injectColorPickerContext(part)),
            { message: `<${part}> must be used within <ColorPicker>` },
          )
        }
      })
    })
  })
}
