import type { ComputedRef, Ref } from "vue"
import type { ColorScaleStep } from "./scale"
import { createContext } from "reka-ui"

export type { ColorScaleStep, ColorScaleStepName } from "./scale"

export interface ColorScaleContext {
  /** The base color as bound to `ColorScale` (may be invalid; then `scale` is empty). */
  base: Readonly<Ref<string>>
  /** `buildColorScale(base)`: 11 steps, or `[]` when `base` does not parse. */
  scale: ComputedRef<ColorScaleStep[]>
  /** `buildColorScaleCss(scale, prefix)`: 11 lines, or `""` when `scale` is empty. */
  css: ComputedRef<string>
  /** The custom property prefix, `"brand"` by default. */
  prefix: Readonly<Ref<string>>
}

/** What `ColorScale` exposes through its default slot. */
export interface ColorScaleSlotProps {
  base: string
  scale: ColorScaleStep[]
  css: string
}

const [injectContext, provideColorScaleContext] = createContext<ColorScaleContext>("ColorScale")

export { provideColorScaleContext }

/**
 * Injects the `ColorScale` context. Throws an error naming `part` when it is
 * used outside a `ColorScale`.
 */
export function injectColorScaleContext(part: string): ColorScaleContext {
  const context = injectContext(null)
  if (!context)
    throw new Error(`<${part}> must be used within <ColorScale>`)
  return context
}
