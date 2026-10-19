---
title: Color Picker
description: Pick a color from a saturation and brightness area, a hue slider or a hex field.
component: true
new: true
---

::component-preview
---
name: ColorPickerDemo
description: A color picker inside a field, with a label and a description.
---
::

`ColorPicker` is built on top of the Reka UI [Color Area](https://reka-ui.com/docs/components/color-area), [Color Slider](https://reka-ui.com/docs/components/color-slider), [Color Field](https://reka-ui.com/docs/components/color-field) and [Color Swatch](https://reka-ui.com/docs/components/color-swatch) components, composed with [Popover](/docs/components/popover) and [Input Group](/docs/components/input-group). Its design is inspired by the color picker from [reui](https://reui.io).

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
    Install the required shadcn-vue dependencies:
    ::

    ```bash
    npx shadcn-vue@latest add popover input-group button
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

With no children, `ColorPicker` renders a trigger and a popover. The trigger shows a swatch, the hex value and a chevron. The popover holds an area, a hue slider and a hex field.

## Composition

Build a `ColorPicker` from these parts:

```text
ColorPicker
├── ColorPickerTrigger
└── ColorPickerContent
    ├── ColorPickerArea
    ├── ColorPickerSlider
    └── ColorPickerInput
```

To edit the hex value without opening the popover, put a `ColorPickerInput` in place of the trigger. Its swatch opens the popover.

```text
ColorPicker
├── ColorPickerInput
└── ColorPickerContent
```

`ColorPicker` renders no element of its own, so its children lay out directly in the parent, such as a `Field`. Every part shares the picker's color, and a part used outside a `ColorPicker` throws an error that names it.

`ColorPickerContent` renders the area, the hue slider and the hex field when it has no children. Pass your own children to change them.

```vue showLineNumbers
<template>
  <ColorPicker v-model="color">
    <ColorPickerTrigger />
    <ColorPickerContent>
      <ColorPickerArea />
      <ColorPickerSlider />
      <ColorPickerSlider channel="saturation" />
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

To start from an OKLCH color, convert it with `oklchToHex` from the `oklch` lib, which [Color Scale](/docs/components/color-scale) installs.

The hue is kept when the color turns gray. Drag the area to zero saturation and back, and the hue slider stays where it was.

## API Reference

`ColorPicker` wraps Reka UI's color primitives. See the Reka UI documentation for [Color Area](https://reka-ui.com/docs/components/color-area), [Color Slider](https://reka-ui.com/docs/components/color-slider), [Color Field](https://reka-ui.com/docs/components/color-field) and [Color Swatch](https://reka-ui.com/docs/components/color-swatch) for their full API, including keyboard interactions.

### ColorPicker

The root. It holds the color and the open state of the popover, and renders no element of its own.

| Prop               | Type      | Default | Description                                                                                       |
| ------------------ | --------- | ------- | ------------------------------------------------------------------------------------------------- |
| `v-model`          | `string`  | -       | The color. Emits a lowercase `#rrggbb`.                                                           |
| `default-value`    | `string`  | -       | The initial color when uncontrolled.                                                              |
| `disabled`         | `boolean` | `false` | Disables every part.                                                                              |
| `id`               | `string`  | -       | Goes to the hex field of a `ColorPickerInput` when there is one, and to the trigger otherwise.    |
| `aria-labelledby`  | `string`  | -       | Names the trigger with this label followed by the current hex value.                              |
| `aria-describedby` | `string`  | -       | Goes to the same control as `id`.                                                                 |
| `v-model:open`     | `boolean` | -       | The open state of the popover.                                                                    |
| `default-open`     | `boolean` | -       | The open state of the popover when it is first rendered.                                          |
| `modal`            | `boolean` | `false` | Whether the popover is modal.                                                                     |

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

The popover. It accepts the props of [`PopoverContent`](/docs/components/popover).

| Prop    | Type                             | Default   | Description                                 |
| ------- | -------------------------------- | --------- | ------------------------------------------- |
| `align` | `"start" \| "center" \| "end"`   | `"start"` | The alignment against the trigger.          |
| `class` | `string`                         | -         | Additional classes to apply to the popover. |

A `ColorPickerInput` inside the popover shows a plain swatch instead of a second trigger, and does not take `id`.

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

### ColorPickerSwatch

A color shown as an image, with `role="img"`. It works inside or outside a `ColorPicker`.

| Prop    | Type     | Default | Description                                |
| ------- | -------- | ------- | ------------------------------------------ |
| `color` | `string` | -       | The color to show.                         |
| `label` | `string` | -       | The accessible name of the swatch.         |
| `class` | `string` | -       | Additional classes to apply to the swatch. |
