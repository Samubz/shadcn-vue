import type { Oklch } from '@/registry/bases/reka/lib/oklch'
import assert from 'node:assert/strict'
import { describe, it } from 'vitest'
import * as rekaOklch from '@/registry/bases/reka/lib/oklch'
import * as newYorkOklch from '@/registry/new-york-v4/lib/oklch'
import fixtures from './__fixtures__/color-scale.fixtures.json'

// Fixtures were generated once from reui's reference color math (MIT); see the
// `$comment` in the JSON. They are never derived from the code under test.

const HEX_RE = /^#[0-9a-f]{6}$/

function assertClose(actual: number, expected: number, tolerance: number, message?: string) {
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `${message ?? ''} expected ${actual} to be within ${tolerance} of ${expected}`,
  )
}

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

/* Both sources ship the lib (design D6, D9), so both are held to the same contract. */
for (const [source, { hexToOklch, oklchToHex }] of [
  ['reka base', rekaOklch],
  ['new-york-v4', newYorkOklch],
] as const) {
  describe(`oklch lib (${source})`, () => {
    describe('hexToOklch', () => {
      it('matches the reference OKLCH for the fixture bases, unrounded', () => {
        for (const base of fixtures.bases) {
          const lch = hexToOklch(base.hex)
          assert.ok(lch, `${base.hex} parses`)
          const [l, c, h] = lch
          assert.equal(base.oklch.length, 3)
          const [el, ec, eh] = base.oklch as Oklch
          assertClose(l, el, 1e-9, `${base.hex} L`)
          assertClose(c, ec, 1e-9, `${base.hex} C`)
          // Grays have no meaningful hue; the contract pins it to 0.
          if (ec >= 1e-4)
            assertClose(h, eh, 1e-6, `${base.hex} H`)
        }
      })

      it('uses L 0..1, C >= 0 and H in 0..360', () => {
        for (const hex of hexGrid()) {
          const [l, c, h] = hexToOklch(hex)!
          assert.ok(l >= -1e-9 && l <= 1 + 1e-9, `${hex} L=${l}`)
          assert.ok(c >= 0, `${hex} C=${c}`)
          assert.ok(h >= 0 && h < 360, `${hex} H=${h}`)
        }
      })

      it('gives grays hue 0 and near-zero chroma', () => {
        for (const hex of ['#000000', '#ffffff', '#808080', '#777']) {
          const [, c, h] = hexToOklch(hex)!
          assert.ok(c < 1e-4, `${hex} C=${c}`)
          assert.equal(h, 0, `${hex} H`)
        }
        assertClose(hexToOklch('#000000')![0], 0, 1e-9)
        assertClose(hexToOklch('#ffffff')![0], 1, 1e-6)
      })

      it('accepts #rgb shorthand and is case-insensitive', () => {
        assert.deepEqual(hexToOklch('#f00'), hexToOklch('#ff0000'))
        assert.deepEqual(hexToOklch('#F00'), hexToOklch('#ff0000'))
        assert.deepEqual(hexToOklch('#7C3AED'), hexToOklch('#7c3aed'))
      })

      it('returns null for anything but #rgb / #rrggbb', () => {
        const invalid: unknown[] = [
          '7c3aed', // no #
          'fff',
          '#7c3aed80', // #rrggbbaa
          '#f008', // #rgba
          '#7c3a',
          '#7c3aedd',
          '#',
          '',
          ' #7c3aed', // surrounding whitespace
          '#7c3aed ',
          '#ggg',
          'oklch(0.6 0.2 260)',
          'rgb(124, 58, 237)',
          'red',
          null,
          undefined,
          0x7C3AED,
          {},
        ]
        for (const value of invalid)
          assert.equal(hexToOklch(value as string), null, `hexToOklch(${JSON.stringify(value)})`)
      })
    })

    describe('oklchToHex', () => {
      it('round-trips the fixture bases exactly, as the reference does', () => {
        for (const base of fixtures.bases) {
          assert.equal(base.roundTrip, base.hex, `reference round trip of ${base.hex}`)
          assert.equal(oklchToHex(hexToOklch(base.hex)!), base.hex, `round trip of ${base.hex}`)
        }
      })

      it('round-trips every color of a 4913-color sRGB grid', () => {
        const drift: string[] = []
        for (const hex of hexGrid()) {
          const back = oklchToHex(hexToOklch(hex)!)
          if (back !== hex)
            drift.push(`${hex} -> ${back}`)
        }
        assert.deepEqual(drift, [])
      })

      it('returns lowercase #rrggbb', () => {
        for (const base of fixtures.bases)
          assert.match(oklchToHex(hexToOklch(base.hex)!), HEX_RE)
        for (const { oklch } of fixtures.gamut)
          assert.match(oklchToHex(oklch as Oklch), HEX_RE)
      })

      it('handles the L, C boundaries like the reference (white at L >= 1, black at L <= 0, C clamped to 0)', () => {
        for (const { oklch, hex } of fixtures.edges)
          assert.equal(oklchToHex(oklch as Oklch), hex, `oklchToHex(${JSON.stringify(oklch)})`)
        assert.equal(oklchToHex([1, 0.3, 30]), '#ffffff')
        assert.equal(oklchToHex([0, 0.3, 30]), '#000000')
        assert.equal(oklchToHex([0.5, -0.1, 40]), oklchToHex([0.5, 0, 40]))
      })

      it('gamut-maps out-of-sRGB colors to the reference output (CSS Color 4, not channel clamping)', () => {
        let differsFromNaive = 0
        for (const { oklch, hex, naiveClip } of fixtures.gamut) {
          assert.equal(oklchToHex(oklch as Oklch), hex, `oklchToHex(${JSON.stringify(oklch)})`)
          if (hex !== naiveClip)
            differsFromNaive++
        }
        // The fixture set must actually exercise the difference.
        assert.ok(differsFromNaive >= 3, `only ${differsFromNaive} fixtures differ from naive clipping`)
      })

      it('keeps lightness and hue when gamut mapping (chroma is what gets reduced)', () => {
        for (const { oklch } of fixtures.gamut) {
          assert.equal(oklch.length, 3)
          const [l, c, h] = oklch as Oklch
          const [ol, oc, oh] = hexToOklch(oklchToHex(oklch as Oklch))!
          // Within the deltaEOK JND of 0.02 (plus 8-bit rounding).
          assertClose(ol, l, 0.025, `L of ${JSON.stringify(oklch)}`)
          assert.ok(oc <= c + 0.025, `C of ${JSON.stringify(oklch)} grew: ${oc} > ${c}`)
          const dh = Math.abs(((oh - h + 540) % 360) - 180)
          assert.ok(dh <= 10, `H of ${JSON.stringify(oklch)} drifted ${dh} degrees`)
        }
      })
    })
  })
}

it('reka base and new-york-v4 oklch libs agree on the fixtures', () => {
  for (const base of fixtures.bases) {
    assert.deepEqual(newYorkOklch.hexToOklch(base.hex), rekaOklch.hexToOklch(base.hex))
    for (const { oklch } of fixtures.gamut)
      assert.equal(newYorkOklch.oklchToHex(oklch as Oklch), rekaOklch.oklchToHex(oklch as Oklch))
  }
})
