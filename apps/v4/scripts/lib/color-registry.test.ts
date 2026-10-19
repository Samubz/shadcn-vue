import assert from 'node:assert/strict'
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { basename, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, it } from 'vitest'

// Assertions on the generated registry output (`pnpm registry:build`). They
// fail until the registry is rebuilt with the color-picker change.

const APP_ROOT = resolve(fileURLToPath(new URL('.', import.meta.url)), '../..')
const PUBLIC_STYLES = join(APP_ROOT, 'public/r/styles')
const GENERATED_STYLES = join(APP_ROOT, 'styles')

/* The 8 reka styles (design D8), plus new-york-v4. */
const REKA_STYLES = ['vega', 'nova', 'maia', 'lyra', 'mira', 'luma', 'sera', 'rhea'].map(s => `reka-${s}`)
const REGISTRY_STYLES = [...REKA_STYLES, 'new-york-v4']

const COLOR_PICKER_PARTS = [
  'ColorPicker',
  'ColorPickerTrigger',
  'ColorPickerInput',
  'ColorPickerContent',
  'ColorPickerArea',
  'ColorPickerSlider',
  'ColorPickerSwatch',
]
const COLOR_SCALE_PARTS = ['ColorScale', 'ColorScaleSwatches', 'ColorScaleCopy']

interface RegistryFile { path: string, content: string, type: string }
interface RegistryItem {
  name: string
  type: string
  dependencies?: string[]
  registryDependencies?: string[]
  files: RegistryFile[]
}

function readItem(style: string, name: string): RegistryItem {
  const file = join(PUBLIC_STYLES, style, `${name}.json`)
  assert.ok(existsSync(file), `missing ${file}`)
  return JSON.parse(readFileSync(file, 'utf8'))
}

function fileNames(item: RegistryItem) {
  return item.files.map(f => basename(f.path)).sort()
}

function fileContent(item: RegistryItem, name: string) {
  const file = item.files.find(f => basename(f.path) === name)
  assert.ok(file, `${item.name} has no ${name}`)
  return file.content
}

/** The identifiers an `index.ts` exports, whatever its quote style. */
function exportedNames(source: string) {
  const names = new Set<string>()
  for (const match of source.matchAll(/export\s+(?:type\s+)?\{([^}]*)\}/g)) {
    for (const raw of match[1]!.split(',')) {
      const entry = raw.trim().replace(/^type\s+/, '')
      if (!entry)
        continue
      const alias = entry.split(/\s+as\s+/)
      names.add(alias[alias.length - 1]!.trim())
    }
  }
  for (const match of source.matchAll(/export\s+(?:const|function|class|let)\s+(\w+)/g))
    names.add(match[1]!)
  return names
}

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry)
    return statSync(path).isDirectory() ? walk(path) : [path]
  })
}

describe('registry output for color-picker, color-scale and oklch', () => {
  it('every reka style directory is covered by this test', () => {
    const onDisk = readdirSync(PUBLIC_STYLES).filter(d => d.startsWith('reka-')).sort()
    assert.deepEqual(onDisk, [...REKA_STYLES].sort())
  })

  for (const style of REGISTRY_STYLES) {
    describe(style, () => {
      it('publishes color-picker.json, color-scale.json and oklch.json', () => {
        for (const name of ['color-picker', 'color-scale', 'oklch'])
          assert.ok(existsSync(join(PUBLIC_STYLES, style, `${name}.json`)), `${style}/${name}.json`)
      })

      it('oklch is a registry:lib exporting hexToOklch and oklchToHex, with the MIT attribution', () => {
        const item = readItem(style, 'oklch')
        assert.equal(item.name, 'oklch')
        assert.equal(item.type, 'registry:lib')
        const lib = item.files.find(f => basename(f.path) === 'oklch.ts')
        assert.ok(lib, 'oklch.ts is published')
        assert.equal(lib.type, 'registry:lib')
        assert.match(lib.content, /export function hexToOklch\b/)
        assert.match(lib.content, /export function oklchToHex\b/)
        assert.match(lib.content, /reui/)
        assert.match(lib.content, /MIT/)
      })

      it('color-picker is a registry:ui depending on popover, input-group and reka-ui, @vueuse/core, cn', () => {
        const item = readItem(style, 'color-picker')
        assert.equal(item.type, 'registry:ui')
        for (const dep of ['popover', 'input-group'])
          assert.ok(item.registryDependencies?.includes(dep), `registryDependencies has ${dep}: ${JSON.stringify(item.registryDependencies)}`)
        for (const dep of ['reka-ui', '@vueuse/core', 'cn'])
          assert.ok(item.dependencies?.includes(dep), `dependencies has ${dep}: ${JSON.stringify(item.dependencies)}`)
      })

      it('color-picker publishes one SFC per part, index.ts and utils.ts, and exports the seven parts', () => {
        const item = readItem(style, 'color-picker')
        const names = fileNames(item)
        for (const part of COLOR_PICKER_PARTS)
          assert.ok(names.includes(`${part}.vue`), `${part}.vue in ${JSON.stringify(names)}`)
        assert.ok(names.includes('index.ts'))
        assert.ok(names.includes('utils.ts'))
        const exported = exportedNames(fileContent(item, 'index.ts'))
        for (const part of COLOR_PICKER_PARTS)
          assert.ok(exported.has(part), `index.ts exports ${part}`)
      })

      it('color-scale is a registry:ui depending on color-picker, button and oklch', () => {
        const item = readItem(style, 'color-scale')
        assert.equal(item.type, 'registry:ui')
        for (const dep of ['color-picker', 'button', 'oklch'])
          assert.ok(item.registryDependencies?.includes(dep), `registryDependencies has ${dep}: ${JSON.stringify(item.registryDependencies)}`)
      })

      it('color-scale publishes its parts, scale.ts and index.ts, and exports the parts plus buildColorScale', () => {
        const item = readItem(style, 'color-scale')
        const names = fileNames(item)
        for (const part of COLOR_SCALE_PARTS)
          assert.ok(names.includes(`${part}.vue`), `${part}.vue in ${JSON.stringify(names)}`)
        assert.ok(names.includes('scale.ts'))
        assert.ok(names.includes('index.ts'))
        const index = fileContent(item, 'index.ts')
        const exported = exportedNames(index)
        for (const part of COLOR_SCALE_PARTS)
          assert.ok(exported.has(part), `index.ts exports ${part}`)
        assert.ok(
          exported.has('buildColorScale') || /export\s+\*\s+from\s+["']\.\/scale["']/.test(index),
          'index.ts re-exports buildColorScale',
        )
      })

      if (style.startsWith('reka-')) {
        it('published reka files carry no cn-color-picker / cn-color-scale tokens', () => {
          for (const name of ['color-picker', 'color-scale']) {
            for (const file of readItem(style, name).files)
              assert.doesNotMatch(file.content, /cn-color-(?:picker|scale)/, `${style}/${name}: ${file.path}`)
          }
        })
      }
    })
  }

  describe('generated styles/reka-*/ui are token-free', () => {
    for (const style of REKA_STYLES) {
      for (const [item, token] of [['color-picker', 'cn-color-picker'], ['color-scale', 'cn-color-scale']] as const) {
        it(`${style}/ui/${item} exists and contains no ${token}`, () => {
          const dir = join(GENERATED_STYLES, style, 'ui', item)
          assert.ok(existsSync(dir), `missing ${dir}`)
          const files = walk(dir)
          assert.ok(files.length > 0, `${dir} is empty`)
          for (const file of files) {
            const content = readFileSync(file, 'utf8')
            assert.ok(!content.includes('cn-color-picker'), `${file} contains cn-color-picker`)
            assert.ok(!content.includes('cn-color-scale'), `${file} contains cn-color-scale`)
          }
        })
      }
    }
  })

  describe('both sources stay in sync', () => {
    for (const name of ['color-picker', 'color-scale']) {
      it(`${name}: reka and new-york-v4 publish the same files and exports`, () => {
        const newYork = readItem('new-york-v4', name)
        for (const style of REKA_STYLES) {
          const reka = readItem(style, name)
          assert.deepEqual(fileNames(reka), fileNames(newYork), `${style} vs new-york-v4 files`)
          assert.deepEqual(
            [...exportedNames(fileContent(reka, 'index.ts'))].sort(),
            [...exportedNames(fileContent(newYork, 'index.ts'))].sort(),
            `${style} vs new-york-v4 index.ts exports`,
          )
        }
      })
    }
  })
})
