# Spec Delta

## Purpose

Defines the public contract of the styled ColorPicker, a family of thin wrappers over reka-ui's Color* primitives, distributed as the `color-picker` registry item in every style.

## ADDED Requirements

### Requirement: Parts and exports
The `color-picker` item SHALL export exactly these parts from its `index.ts`, in both `registry/bases/reka/ui/color-picker/` and `registry/new-york-v4/ui/color-picker/`:
- `ColorPicker`
- `ColorPickerTrigger`
- `ColorPickerInput`
- `ColorPickerContent`
- `ColorPickerArea`
- `ColorPickerSlider`
- `ColorPickerSwatch`

Each part SHALL live in its own SFC. Every part except the renderless `ColorPicker` root SHALL accept a `class` prop merged with `cn` and render a `data-slot` attribute named after the part in kebab case (for example, `data-slot="color-picker-area"`). The root renders no element of its own (see "Default trigger and popover without children"), so it takes neither.

#### Scenario: Importing every part
- **WHEN** a consumer imports all seven parts from `@/components/ui/color-picker`
- **THEN** the import type-checks and each part other than the root renders its `data-slot` attribute

#### Scenario: Both sources stay in sync
- **WHEN** the file lists and the `index.ts` exports of the reka base and new-york-v4 folders are compared
- **THEN** they are identical

### Requirement: Hex v-model
`ColorPicker` SHALL support `v-model` (`modelValue` / `update:modelValue`) and an uncontrolled `defaultValue`, both as color strings. Every value it emits SHALL be a lowercase `#rrggbb` hex string. When neither prop is given, the color SHALL start as `#000000`.

#### Scenario: Uncontrolled default value
- **WHEN** `<ColorPicker default-value="#0ea5e9" />` renders
- **THEN** the trigger swatch shows `#0ea5e9`, and no `update:modelValue` is emitted until the user changes the color

#### Scenario: Emitting hex on change
- **WHEN** the user drags the area thumb
- **THEN** `update:modelValue` is emitted with a `#rrggbb` string

### Requirement: Default trigger and popover without children
When `ColorPicker` has no default slot content, it SHALL render a `ColorPickerTrigger`: an outline button showing a swatch of the current color, its hex value and a chevron and a `ColorPickerContent` popover. When `ColorPickerContent` has no children, it SHALL render, in order:
- a `ColorPickerArea` (HSB saturation on x, brightness on y)
- a hue `ColorPickerSlider`
- a `ColorPickerInput`

`ColorPicker` SHALL NOT render a wrapper DOM element of its own.

#### Scenario: Picker with no children inside a Field
- **WHEN** `<Field><FieldLabel for="accent">Accent</FieldLabel><ColorPicker id="accent" default-value="#0ea5e9" /></Field>` renders and the user clicks the trigger
- **THEN** a popover opens with an area, a hue slider and a hex input, all reflecting `#0ea5e9`

#### Scenario: No wrapper element
- **WHEN** `ColorPicker` renders with children
- **THEN** the children are the root's direct DOM output, with no extra wrapper between them and the parent element

### Requirement: Free composition with children
When children are passed, `ColorPicker` SHALL render only those children and share its color state with every descendant part through context. Parts used outside a `ColorPicker` SHALL fail with a clear error naming the part. The exception is `ColorPickerSwatch`, which takes its color from its own `color` prop, reads no context and works standalone (it is used that way by `ColorScaleSwatches`).

#### Scenario: Input plus popover content
- **WHEN** `<ColorPicker v-model="c"><ColorPickerInput /><ColorPickerContent /></ColorPicker>` renders and the user types `#7c3aed` in the input and commits it
- **THEN** `c` becomes `#7c3aed`, and the area and slider inside the content reflect that color

### Requirement: Hue preserved on achromatic colors
The shared state SHALL keep the hue when saturation or brightness reaches 0. A parent echoing the emitted `modelValue` back SHALL NOT reset the hue.

#### Scenario: Dragging to gray and back
- **WHEN** the hue slider is at 200 and the user drags the area thumb to saturation 0 and then back to a saturated point, while the parent binds `v-model`
- **THEN** the hue slider still reads 200 and the resulting color has hue 200

### Requirement: Invalid input never throws
`ColorPicker` SHALL validate every incoming `modelValue` and `defaultValue` before passing it to reka. An unsupported or malformed value (for example `oklch(0.6 0.2 260)`, `7c3aed` without `#`, or a space-separated `rgb(1 2 3)`) SHALL keep the last valid color and SHALL NOT throw during render. Text that the input rejects SHALL revert to the current color on commit.

#### Scenario: OKLCH model value
- **WHEN** the parent sets `modelValue` to `"oklch(0.6 0.2 260)"`
- **THEN** the picker keeps rendering the previous color, and no error reaches the console in production builds

#### Scenario: Invalid typed text
- **WHEN** the user types `notacolor` in `ColorPickerInput` and blurs it
- **THEN** the input shows the current hex again and no `update:modelValue` is emitted

### Requirement: Accessibility from reka
The area, the slider and the input SHALL keep reka's roles, ARIA attributes and keyboard handling unchanged:
- the area thumb is a `slider` with `aria-valuetext`
- the area moves with arrow keys and Page Up / Page Down
- the slider moves with arrow keys, Home and End

`ColorPickerSwatch` SHALL render `role="img"` with an `aria-label` taken from its `label` prop. `ColorPickerTrigger` SHALL have an accessible name that includes the current hex value.

#### Scenario: Keyboard on the area
- **WHEN** the area thumb has focus and the user presses ArrowRight
- **THEN** saturation increases by one step and `update:modelValue` is emitted

#### Scenario: Labelled trigger
- **WHEN** a screen reader focuses the trigger of a picker labelled "Accent color" with value `#0ea5e9`
- **THEN** the accessible name contains both "Accent color" and `#0ea5e9`

### Requirement: Per-style rendering
The reka base source SHALL style the parts through `cn-color-picker-*` tokens, and every one of the 8 style files (vega, nova, maia, lyra, mira, luma, sera, rhea) SHALL define those tokens. After `pnpm registry:build`, no `cn-color-picker-*` token SHALL remain in `apps/v4/styles/reka-*/ui/color-picker/**`.

#### Scenario: Build output is token-free
- **WHEN** `pnpm registry:build` completes
- **THEN** `grep -r "cn-color-picker" apps/v4/styles/reka-*/ui/color-picker` returns no matches, and `public/r/styles/reka-<style>/color-picker.json` exists for every style

### Requirement: CLI installation
`shadcn-vue add color-picker` SHALL install every part together with its registry dependencies (`popover`, `input-group`, `button`) and its npm dependencies (`reka-ui`, `@vueuse/core`, `cn`).

#### Scenario: Fresh install
- **WHEN** `shadcn-vue add color-picker` runs in a project initialised with any reka style
- **THEN** `components/ui/color-picker/`, `components/ui/popover/`, `components/ui/input-group/` and `components/ui/button/` exist, and the project type-checks
