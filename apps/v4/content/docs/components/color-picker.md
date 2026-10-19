---
title: Color Picker
description: Pick a color from a saturation and brightness area, a hue slider, the screen, or fields in HEX, RGB, HSL, HSB or OKLCH.
component: true
new: true
---

::component-preview
---
name: ColorPickerDemo
description: A color picker inside a field, with a label and a description.
---
::

`ColorPicker` is built on top of the Reka UI [Color Area](https://reka-ui.com/docs/components/color-area), [Color Slider](https://reka-ui.com/docs/components/color-slider), [Color Field](https://reka-ui.com/docs/components/color-field) and [Color Swatch](https://reka-ui.com/docs/components/color-swatch) components, composed with [Popover](/docs/components/popover), [Input Group](/docs/components/input-group) and [Dropdown Menu](/docs/components/dropdown-menu). Its design is inspired by the color picker from [reui](https://reui.io).

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
npx shadcn-vue@latest add color-picker
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
    Install the required shadcn-vue dependencies: `popover`, `input-group`, `button`, `dropdown-menu` and the `oklch` lib, which adds `lib/oklch.ts`.
    ::

    ```bash
    npx shadcn-vue@latest add popover input-group button dropdown-menu oklch
    ```

    ::step
    Copy and paste the [GitHub source code](https://github.com/unovue/shadcn-vue/tree/dev/apps/v4/registry/new-york-v4/ui/color-picker) into your project.
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
import { ref } from 'vue'
import { ColorPicker } from '@/components/ui/color-picker'

const color = ref('#0ea5e9')
</script>

<template>
  <ColorPicker v-model="color" />
</template>
```

With no children, `ColorPicker` renders a trigger and a popover. The trigger shows a swatch, the hex value and a chevron. The popover holds an area, a row with an eye dropper, a hue slider and a copy button, and the format fields.

## Composition

Build a `ColorPicker` from these parts:

```text
ColorPicker
├── ColorPickerTrigger
└── ColorPickerContent
    ├── ColorPickerArea
    ├── (row)
    │   ├── ColorPickerEyeDropper
    │   ├── ColorPickerSlider
    │   └── ColorPickerCopy
    └── ColorPickerFields
```

To edit the hex value without opening the popover, put a `ColorPickerInput` in place of the trigger. Its swatch opens the popover.

```text
ColorPicker
├── ColorPickerInput
└── ColorPickerContent
```

`ColorPicker` renders no element of its own, so its children lay out directly in the parent, such as a `Field`. Every part shares the picker's color, and a part used outside a `ColorPicker` throws an error that names it.

`ColorPickerContent` renders the area, the row with the eye dropper, the hue slider and the copy button, and `ColorPickerFields` when it has no children. Pass your own children to change them.

```vue showLineNumbers
<template>
  <ColorPicker v-model="color">
    <ColorPickerTrigger />
    <ColorPickerContent>
      <ColorPickerArea />
      <ColorPickerSlider />
      <ColorPickerSlider channel="saturation" />
      <ColorPickerFields :formats="['hex', 'oklch']" />
    </ColorPickerContent>
  </ColorPicker>
</template>
```

`ColorPickerSwatch` also works on its own, outside a `ColorPicker`.

## Examples

### Popover Picker in a Field

Put a `ColorPicker` with no children in a [Field](/docs/components/field). Give the label an `id` and pass it to `aria-labelledby`, so the trigger is announced with the label and the current hex value, such as "Accent color #0ea5e9". `aria-describedby` points the trigger at the description.

::component-preview
---
name: ColorPickerDemo
---
::

### Input with Popover

Compose a `ColorPickerInput` and a `ColorPickerContent` to type a hex value or pick one from the popover. The `id` on `ColorPicker` goes to the hex field, so a `FieldLabel` with a matching `for` labels it.

::component-preview
---
name: ColorPickerInputDemo
---
::

### Format Fields

`ColorPickerFields` shows a format menu and the fields for the chosen format. Each item in the menu previews the current color in that format. Bind the shown format with `v-model:format`, or set the first one with `default-format`. This demo starts in OKLCH while its `v-model` stays hex.

Used outside the popover, as here, the first field takes the `id` and `aria-describedby` of `ColorPicker`, so a `FieldLabel` with a matching `for` labels it.

::component-preview
---
name: ColorPickerFieldsDemo
---
::

| Format | Fields                          | Accepts                                                                    |
| ------ | ------------------------------- | -------------------------------------------------------------------------- |
| HEX    | One field, such as `0EA5E9`     | 3 or 6 hex digits, with or without `#`, in any case.                       |
| RGB    | Red, green and blue             | Integers from 0 to 255.                                                    |
| HSL    | Hue, saturation and lightness   | Integers.                                                                  |
| HSB    | Hue, saturation and brightness  | Integers.                                                                  |
| OKLCH  | Lightness (%), chroma and hue   | One number each. The `%` on lightness is optional.                         |

A value is committed on Enter or blur. Invalid text reverts to the current color, and Escape cancels the edit. Out-of-range OKLCH values are clamped: lightness to 0–100, chroma to 0–0.4, and the hue wraps around 360. The OKLCH hue is kept while chroma is 0, so setting chroma to 0 and back does not reset it.

Pass `formats` to limit the menu, such as `:formats="['hex', 'oklch']"`. With a single format, the menu is hidden.

### Eye Dropper and Copy

`ColorPickerEyeDropper` picks a color from anywhere on the screen, and `ColorPickerCopy` copies the current color. Here they sit next to a `ColorPickerInput`, and the copy button has `format="oklch"`, so it always copies OKLCH.

::component-preview
---
name: ColorPickerToolsDemo
---
::

The eye dropper only appears in browsers with the [EyeDropper API](https://developer.mozilla.org/en-US/docs/Web/API/EyeDropper_API), which are the Chromium-based browsers at the time of writing. Elsewhere, on the server and in the first client render, it renders nothing, so lay it out where a missing button does not break the row. Press Escape while picking to cancel and keep the current color.

Without a `format` prop, `ColorPickerCopy` copies in the format the picker's `ColorPickerFields` show, and as hex when the picker has no fields. The button shows a check for about 2 seconds after a copy, and screen readers announce "Color copied".

### Swatch

`ColorPickerSwatch` shows a color as an image named by its `label`. A translucent color shows over a checkerboard. Size it with a class.

::component-preview
---
name: ColorPickerSwatchDemo
---
::

## Accepted Formats

The `v-model` is a hex string. Every value the picker emits is a lowercase `#rrggbb`, and the picker starts at `#000000` when you give it no value.

`v-model`, `default-value` and the text typed in `ColorPickerInput` accept these formats:

| Format         | Example              | Notes                 |
| -------------- | -------------------- | --------------------- |
| Hex            | `#0ea5e9`, `#0ae`    | The `#` is required.  |
| Hex with alpha | `#0ea5e980`          | The alpha is dropped. |
| RGB            | `rgb(14, 165, 233)`  | Separate with commas. |
| HSL            | `hsl(199, 89%, 48%)` | Separate with commas. |
| HSB            | `hsb(199, 94%, 91%)` | Separate with commas. |

Other values are ignored: the picker keeps its last valid color and never throws. This includes `oklch()`, a hex without `#` and a space-separated `rgb(14 165 233)`. A value ignored from `v-model` or `default-value` logs a warning in development. Text typed in `ColorPickerInput` that is not a valid color reverts to the current hex when the field commits, on Enter or blur.

To start from an OKLCH color, convert it with `oklchToHex` from the `oklch` lib (`lib/oklch.ts`), which `color-picker` installs.

The hue is kept when the color turns gray. Drag the area to zero saturation and back, and the hue slider stays where it was.

### Shown Format

The format chosen in `ColorPickerFields` is presentation only. It changes what the fields show and accept, and what `ColorPickerCopy` copies, but never what the picker emits: the `v-model` stays a lowercase `#rrggbb` in every format. Switching the format emits nothing.

For `#0ea5e9`, each format shows and copies:

| Format | Menu preview             | Copied                          |
| ------ | ------------------------ | ------------------------------- |
| HEX    | `#0ea5e9`                | `#0ea5e9`                       |
| RGB    | `14 165 233`             | `rgb(14 165 233)`               |
| HSL    | `198.6 88.7% 48.4%`      | `hsl(198.6 88.7% 48.4%)`        |
| HSB    | `198.6 94% 91.4%`        | `hsb(198.6 94% 91.4%)`          |
| OKLCH  | `68.47% 0.14787 237.323` | `oklch(68.47% 0.14787 237.323)` |

The RGB, HSL and HSB fields round each channel to an integer, while the menu previews and copied values keep one decimal. Because the `v-model` is hex, an OKLCH value you type is rounded to the nearest 8-bit color, so the fields can show a slightly different value after the commit.

The copied `hsb()` string is not a CSS color, and the `v-model` does not accept `oklch()` or the space-separated forms above.

## API Reference

`ColorPicker` wraps Reka UI's color primitives. See the Reka UI documentation for [Color Area](https://reka-ui.com/docs/components/color-area), [Color Slider](https://reka-ui.com/docs/components/color-slider), [Color Field](https://reka-ui.com/docs/components/color-field) and [Color Swatch](https://reka-ui.com/docs/components/color-swatch) for their full API, including keyboard interactions.

### ColorPicker

The root. It holds the color and the open state of the popover, and renders no element of its own.

| Prop               | Type      | Default | Description                                                                                                                                              |
| ------------------ | --------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `v-model`          | `string`  | -       | The color. Emits a lowercase `#rrggbb`.                                                                                                                  |
| `default-value`    | `string`  | -       | The initial color when uncontrolled.                                                                                                                     |
| `disabled`         | `boolean` | `false` | Disables every part.                                                                                                                                     |
| `id`               | `string`  | -       | Goes to the hex field of a `ColorPickerInput`, or to the first field of a `ColorPickerFields`, used outside the popover. Goes to the trigger otherwise. |
| `aria-labelledby`  | `string`  | -       | Names the trigger with this label followed by the current hex value.                                                                                     |
| `aria-describedby` | `string`  | -       | Goes to the same control as `id`.                                                                                                                        |
| `v-model:open`     | `boolean` | -       | The open state of the popover.                                                                                                                           |
| `default-open`     | `boolean` | -       | The open state of the popover when it is first rendered.                                                                                                 |
| `modal`            | `boolean` | `false` | Whether the popover is modal.                                                                                                                            |

Without `aria-labelledby`, the trigger is named by its hex value alone.

### ColorPickerTrigger

An outline [Button](/docs/components/button) that opens the popover. It shows a swatch, the hex value and a chevron. Children replace that content, and the trigger is still named with the hex value.

| Prop       | Type      | Default     | Description                                 |
| ---------- | --------- | ----------- | ------------------------------------------- |
| `variant`  | `string`  | `"outline"` | The variant of the button.                  |
| `size`     | `string`  | -           | The size of the button.                     |
| `as`       | `string`  | `"button"`  | The element or component to render as.      |
| `as-child` | `boolean` | `false`     | Render as the child element.                |
| `class`    | `string`  | -           | Additional classes to apply to the trigger. |

### ColorPickerContent

The popover. It accepts the props of [`PopoverContent`](/docs/components/popover). With no children, it renders a `ColorPickerArea`, a row with a `ColorPickerEyeDropper`, a hue `ColorPickerSlider` and a `ColorPickerCopy`, and a `ColorPickerFields`.

| Prop    | Type                             | Default   | Description                                 |
| ------- | -------------------------------- | --------- | ------------------------------------------- |
| `align` | `"start" \| "center" \| "end"`   | `"start"` | The alignment against the trigger.          |
| `class` | `string`                         | -         | Additional classes to apply to the popover. |

A `ColorPickerInput` inside the popover shows a plain swatch instead of a second trigger, and does not take `id`. A `ColorPickerFields` inside the popover does not take `id` either.

### ColorPickerArea

The saturation and brightness area: saturation on the x axis, brightness on the y axis.

| Prop    | Type     | Default | Description                              |
| ------- | -------- | ------- | ---------------------------------------- |
| `class` | `string` | -       | Additional classes to apply to the area. |

### ColorPickerSlider

A slider for one channel of the color.

| Prop          | Type                                       | Default        | Description                                 |
| ------------- | ------------------------------------------ | -------------- | ------------------------------------------- |
| `channel`     | `"hue" \| "saturation" \| "brightness"`    | `"hue"`        | The channel the slider changes.             |
| `orientation` | `"horizontal" \| "vertical"`               | `"horizontal"` | The orientation of the slider.              |
| `inverted`    | `boolean`                                  | `false`        | Whether the slider is visually inverted.    |
| `step`        | `number`                                   | -              | The step size. Defaults to the channel's.   |
| `disabled`    | `boolean`                                  | `false`        | Disables the slider.                        |
| `class`       | `string`                                   | -              | Additional classes to apply to the slider.  |

### ColorPickerInput

An [Input Group](/docs/components/input-group) with a swatch that opens the popover and a hex field. Attributes such as `aria-label` and `placeholder` go to the hex field.

| Prop    | Type     | Default | Description                                     |
| ------- | -------- | ------- | ----------------------------------------------- |
| `class` | `string` | -       | Additional classes to apply to the input group. |

### ColorPickerFields

An [Input Group](/docs/components/input-group) with a format menu and the fields for the shown format. The shown format never changes what `ColorPicker` emits.

| Prop             | Type                  | Default                 | Description                                                                                                                                                                               |
| ---------------- | --------------------- | ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `v-model:format` | `ColorPickerFormat`   | -                       | The format shown.                                                                                                                                                                         |
| `default-format` | `ColorPickerFormat`   | -                       | The format shown first when uncontrolled. Without it, the fields start from the last format shown in the same picker (HEX until one has been shown), or from the first of `formats` when that format is not offered. |
| `formats`        | `ColorPickerFormat[]` | `COLOR_PICKER_FORMATS`  | The formats offered by the menu, in order. All five by default. A single format hides the menu.                                                                                          |
| `class`          | `string`              | -                       | Additional classes to apply to the input group.                                                                                                                                           |

The picker remembers the last shown format, so the fields in a popover open in the format they had when it closed. Each field has an accessible name for its channel, such as "Red" or "Chroma".

### ColorPickerEyeDropper

A ghost icon [Button](/docs/components/button) that opens the browser's eye dropper and applies the picked color. It renders nothing in browsers without the EyeDropper API, on the server and in the first client render. It is named "Pick a color from the screen" and is disabled when the picker is disabled. Children replace the icon.

| Prop       | Type      | Default     | Description                                 |
| ---------- | --------- | ----------- | ------------------------------------------- |
| `variant`  | `string`  | `"ghost"`   | The variant of the button.                  |
| `size`     | `string`  | `"icon-sm"` | The size of the button.                     |
| `as`       | `string`  | `"button"`  | The element or component to render as.      |
| `as-child` | `boolean` | `false`     | Render as the child element.                |
| `class`    | `string`  | -           | Additional classes to apply to the button.  |

### ColorPickerCopy

A ghost icon [Button](/docs/components/button) that copies the current color as a CSS-style string. It is named "Copy color" and is disabled when the picker is disabled. After a copy, it sets `data-copied` and shows a check for about 2 seconds, and an sr-only live region announces "Color copied". Children replace the icon and receive `copied` as a slot prop.

| Prop       | Type                | Default     | Description                                                                                         |
| ---------- | ------------------- | ----------- | --------------------------------------------------------------------------------------------------- |
| `format`   | `ColorPickerFormat` | -           | The format copied. Defaults to the format the picker's `ColorPickerFields` show, else hex.          |
| `variant`  | `string`            | `"ghost"`   | The variant of the button.                                                                          |
| `size`     | `string`            | `"icon-sm"` | The size of the button.                                                                             |
| `as`       | `string`            | `"button"`  | The element or component to render as.                                                              |
| `as-child` | `boolean`           | `false`     | Render as the child element.                                                                        |
| `class`    | `string`            | -           | Additional classes to apply to the button.                                                          |

### ColorPickerSwatch

A color shown as an image, with `role="img"`. It works inside or outside a `ColorPicker`.

| Prop    | Type     | Default | Description                                |
| ------- | -------- | ------- | ------------------------------------------ |
| `color` | `string` | -       | The color to show.                         |
| `label` | `string` | -       | The accessible name of the swatch.         |
| `class` | `string` | -       | Additional classes to apply to the swatch. |

### formatColor

Writes a Reka UI `Color` in one of the formats, ignoring alpha. It returns the menu preview by default, and the copied CSS-style string with `{ css: true }`. See [Shown Format](#shown-format) for every format. Parse a string first with `parseColor` from `reka-ui`.

```ts
import { parseColor } from 'reka-ui'
import { formatColor } from '@/components/ui/color-picker'

formatColor(parseColor('#0ea5e9'), 'oklch') // "68.47% 0.14787 237.323"
formatColor(parseColor('#0ea5e9'), 'oklch', { css: true }) // "oklch(68.47% 0.14787 237.323)"
```

| Parameter     | Type                 | Description                                                                        |
| ------------- | -------------------- | ---------------------------------------------------------------------------------- |
| `color`       | `Color`              | A Reka UI color in any space.                                                      |
| `format`      | `ColorPickerFormat`  | One of `"hex"`, `"rgb"`, `"hsl"`, `"hsb"` and `"oklch"`.                           |
| `options.css` | `boolean`            | Wraps the channels in `format(...)`, as `ColorPickerCopy` copies them. Hex is `#rrggbb` either way. |

The item also exports `COLOR_PICKER_FORMATS`, the list of formats in menu order, and its `ColorPickerFormat` type.
