---
title: Color Scale
description: Expands one base color into 11 shades, from 50 to 950, and copies them as CSS variables.
component: true
new: true
---

::component-preview
---
name: ColorScaleDemo
description: A brand scale card with a base color field, a copy button and 11 swatches.
---
::

`ColorScale` generates the shades in OKLCH, a perceptual color space. It uses [Color Picker](/docs/components/color-picker) swatches. Its design and its color math are adapted from the Brand scale example and the color picker from [reui](https://reui.io) (MIT).

## Installation

:::::code-tabs

:::tabs-list

  ::tabs-trigger{value="cli"}
  CLI
  ::

  ::tabs-trigger{value="manual"}
  Manual
  ::

:::

::tabs-content{value="cli"}

```bash
npx shadcn-vue@latest add color-scale
```

::

::::tabs-content{value="manual"}
  :::steps
    ::step
    Install the following dependencies:
    ::

    ```bash
    npm install reka-ui @vueuse/core
    ```

    ::step
    Install the required shadcn-vue dependencies: `color-picker`, `button` and the `oklch` lib, which adds `lib/oklch.ts`.
    ::

    ```bash
    npx shadcn-vue@latest add color-picker button oklch
    ```

    ::step
    Copy and paste the [GitHub source code](https://github.com/unovue/shadcn-vue/tree/dev/apps/v4/registry/new-york-v4/ui/color-scale) into your project.
    ::

    ::step
    Update the import paths to match your project setup.
    ::
  :::
::::

:::::

## Usage

```vue showLineNumbers
<script setup lang="ts">
import { ColorScale } from '@/components/ui/color-scale'
</script>

<template>
  <ColorScale default-value="#7c3aed" />
</template>
```

With no children, `ColorScale` renders the swatches.

## Composition

Build a `ColorScale` from these parts:

```text
ColorScale
├── ColorScaleCopy
└── ColorScaleSwatches
```

`ColorScale` renders no element of its own. It holds the base color, and every part inside it reads the same scale.

The base color field is not part of `ColorScale`. Bind a [Color Picker](/docs/components/color-picker) to the same `v-model`, as the demo does:

```vue showLineNumbers
<script setup lang="ts">
import { ref } from 'vue'
import {
  ColorPicker,
  ColorPickerContent,
  ColorPickerInput,
} from '@/components/ui/color-picker'
import {
  ColorScale,
  ColorScaleCopy,
  ColorScaleSwatches,
} from '@/components/ui/color-scale'

const base = ref('#7c3aed')
</script>

<template>
  <ColorScale v-model="base">
    <ColorPicker v-model="base">
      <ColorPickerInput aria-label="Base color" />
      <ColorPickerContent />
    </ColorPicker>
    <ColorScaleSwatches />
    <ColorScaleCopy />
  </ColorScale>
</template>
```

To render the shades yourself, use the `scale` slot prop. Each entry has a `step` and a hex `value`.

```vue showLineNumbers
<template>
  <ColorScale v-slot="{ scale }" default-value="#7c3aed">
    <ul>
      <li v-for="{ step, value } in scale" :key="step">
        {{ step }}: {{ value }}
      </li>
    </ul>
  </ColorScale>
</template>
```

`buildColorScale` gives the same list without a component:

```ts showLineNumbers
import { buildColorScale } from '@/components/ui/color-scale'

const scale = buildColorScale('#7c3aed')
// [{ step: 50, value: '#f3f1fe' }, …, { step: 950, value: '#250f4d' }]
```

## How the Scale Is Built

- **The base is pinned at 500.** Step 500 is the base color, and the other 10 steps are built around it.
- **It follows Tailwind's blue.** Lightness and chroma follow the curves of Tailwind's blue scale. The lightness curve bends around the base lightness: steps 50 to 400 move toward white, and steps 600 to 950 are scaled to the base.
- **It works in OKLCH.** The math runs in OKLCH, a perceptual color space. The hue stays that of the base color.
- **It stays in sRGB.** Steps 600 and 700 raise the chroma above the base, which can push a saturated color out of sRGB. Such a shade is brought back with CSS Color 4 gamut mapping: its chroma is lowered at the same lightness and hue, instead of clipping each channel. This keeps the hue true where clipping would shift it.

Lightness never increases from 50 to 950. For pure white or pure black, neighboring steps can be equal.

The base must be a hex color, `#rgb` or `#rrggbb`. Any other value gives an empty scale.

## Copying CSS Variables

`ColorScaleCopy` copies the scale as CSS custom properties, one line per step:

```css
--brand-50: #f3f1fe;
--brand-100: #e4e0fb;
--brand-200: #d1c8fa;
--brand-300: #b6a5f7;
--brand-400: #9470f4;
--brand-500: #7c3aed;
--brand-600: #6e00e6;
--brand-700: #5f00c9;
--brand-800: #4d00a8;
--brand-900: #3e0f81;
--brand-950: #250f4d;
```

Set `prefix` on `ColorScale` to rename the variables. It defaults to `"brand"`.

```vue showLineNumbers
<template>
  <ColorScale default-value="#7c3aed" prefix="accent">
    <ColorScaleCopy />
  </ColorScale>
</template>
```

This copies `--accent-50` through `--accent-950`.

After a copy, the button reads "Copied" for about 2 seconds, and screen readers hear "CSS variables copied". The button is disabled while the scale is empty.

The same text is available as the `css` slot prop, to show it or save it elsewhere:

```vue showLineNumbers
<template>
  <ColorScale v-slot="{ css }" default-value="#7c3aed">
    <pre>{{ css }}</pre>
  </ColorScale>
</template>
```

## API Reference

### ColorScale

The root. It holds the base color and computes the scale, and renders no element of its own.

| Prop            | Type     | Default   | Description                                                 |
| --------------- | -------- | --------- | ----------------------------------------------------------- |
| `v-model`       | `string` | -         | The base color as a hex string. It becomes step 500.        |
| `default-value` | `string` | -         | The initial base color when uncontrolled.                   |
| `prefix`        | `string` | `"brand"` | The variable prefix of the copied CSS: `--<prefix>-<step>`. |

| Slot prop | Type               | Description                                                   |
| --------- | ------------------ | ------------------------------------------------------------- |
| `base`    | `string`           | The base color.                                               |
| `scale`   | `ColorScaleStep[]` | The 11 shades, or `[]` when the base is not a valid hex.      |
| `css`     | `string`           | The scale as CSS variables, or `""` when the scale is empty.  |

### ColorScaleSwatches

An ordered list of 11 swatches, each with its step number. Each swatch is an image named with its step and hex value, such as "500, #7c3aed".

| Prop    | Type     | Default | Description                              |
| ------- | -------- | ------- | ---------------------------------------- |
| `class` | `string` | -       | Additional classes to apply to the list. |

### ColorScaleCopy

A [Button](/docs/components/button) that copies the scale as CSS variables. It reads "Copy CSS", then "Copied" after a copy. Its default slot receives `copied` to replace that content.

| Prop       | Type      | Default     | Description                                |
| ---------- | --------- | ----------- | ------------------------------------------ |
| `variant`  | `string`  | `"outline"` | The variant of the button.                 |
| `size`     | `string`  | `"sm"`      | The size of the button.                    |
| `as`       | `string`  | `"button"`  | The element or component to render as.     |
| `as-child` | `boolean` | `false`     | Render as the child element.               |
| `class`    | `string`  | -           | Additional classes to apply to the button. |

### buildColorScale

```ts
const scale = buildColorScale(baseHex)
```

Returns 11 `{ step, value }` entries, from 50 to 950, with `value` as a lowercase `#rrggbb`. Returns `[]` when `baseHex` is not `#rgb` or `#rrggbb`.

### buildColorScaleCss

```ts
const css = buildColorScaleCss(scale, prefix)
```

Returns one `--<prefix>-<step>: <hex>;` line per step, joined by newlines. An empty scale gives `""`.

### COLOR_SCALE_STEPS

```ts
const COLOR_SCALE_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]
```

### ColorScaleStep

```ts
interface ColorScaleStep {
  step: 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950
  value: string
}
```

### oklch

The `oklch` lib in `lib/oklch.ts` converts between hex and OKLCH. OKLCH colors are `[l, c, h]` tuples, with lightness from 0 to 1, chroma from 0 up and hue in degrees.

| Function     | Signature                                            | Description                                                     |
| ------------ | ---------------------------------------------------- | --------------------------------------------------------------- |
| `hexToOklch` | `(hex: string) => [number, number, number] \| null` | Converts `#rgb` or `#rrggbb`. Returns `null` for anything else. |
| `oklchToHex` | `(lch: [number, number, number]) => string`          | Converts to a lowercase `#rrggbb`, gamut-mapped into sRGB.      |
