# Spec Delta

## Purpose

Adds the format menu and channel fields, the eye dropper and the copy action to the ColorPicker's panel, without changing what its `v-model` emits.

## MODIFIED Requirements

### Requirement: Parts and exports
The `color-picker` item SHALL export exactly these parts from its `index.ts`, in both `registry/bases/reka/ui/color-picker/` and `registry/new-york-v4/ui/color-picker/`:
- `ColorPicker`
- `ColorPickerTrigger`
- `ColorPickerInput`
- `ColorPickerContent`
- `ColorPickerArea`
- `ColorPickerSlider`
- `ColorPickerSwatch`
- `ColorPickerFields`
- `ColorPickerEyeDropper`
- `ColorPickerCopy`

It SHALL also export the `COLOR_PICKER_FORMATS` list, the `ColorPickerFormat` type and the `formatColor` helper.

Each part SHALL live in its own SFC. Every part except the renderless `ColorPicker` root SHALL accept a `class` prop merged with `cn` and SHALL render a `data-slot` attribute named after the part in kebab case (for example, `data-slot="color-picker-area"`). The root renders no element of its own (see "Default trigger and popover without children"), so it takes neither.

#### Scenario: Importing every part
- **WHEN** a consumer imports all ten parts from `@/components/ui/color-picker`
- **THEN** the import type-checks, and each part other than the root renders its `data-slot` attribute when mounted (`ColorPickerEyeDropper` only where the browser supports it)

#### Scenario: Both sources stay in sync
- **WHEN** the file lists and the `index.ts` exports of the reka base and new-york-v4 folders are compared
- **THEN** they are identical

### Requirement: Default trigger and popover without children
When `ColorPicker` has no default slot content, it SHALL render a `ColorPickerTrigger` (an outline button showing a swatch of the current color, its hex value and a chevron) and a `ColorPickerContent` popover. When `ColorPickerContent` has no children, it SHALL render, in order:
- a `ColorPickerArea` (HSB saturation on x, brightness on y)
- a row holding, from left to right, a `ColorPickerEyeDropper`, a hue `ColorPickerSlider` that fills the remaining width, and a `ColorPickerCopy`
- a `ColorPickerFields`

`ColorPicker` SHALL NOT render a wrapper DOM element of its own.

#### Scenario: Picker with no children inside a Field
- **WHEN** `<Field><FieldLabel for="accent">Accent</FieldLabel><ColorPicker id="accent" default-value="#0ea5e9" /></Field>` renders and the user clicks the trigger
- **THEN** a popover opens with:
  - an area
  - a row with an eye dropper (where supported), a hue slider and a copy button
  - format fields showing `0EA5E9` with the HEX format selected
  
  All of them reflect `#0ea5e9`.

#### Scenario: No wrapper element
- **WHEN** `ColorPicker` renders with children
- **THEN** the children are the root's direct DOM output, with no extra wrapper between them and the parent element

### Requirement: CLI installation
`shadcn-vue add color-picker` SHALL install every part together with:
- its registry dependencies: `popover`, `input-group`, `button`, `dropdown-menu` and the `oklch` lib
- its npm dependencies: `reka-ui`, `@vueuse/core` and `cn`

#### Scenario: Fresh install
- **WHEN** `shadcn-vue add color-picker` runs in a project initialised with any reka style
- **THEN** these exist and the project type-checks:
  - `components/ui/color-picker/`, `components/ui/popover/`, `components/ui/input-group/`, `components/ui/button/` and `components/ui/dropdown-menu/`
  - `lib/oklch.ts`

## ADDED Requirements

### Requirement: Format fields
`ColorPickerFields` SHALL render a format menu followed by the fields of the chosen format. The menu SHALL offer, in this order, the formats in its `formats` prop, which defaults to all five: HEX, RGB, HSL, HSB, OKLCH. Each menu item SHALL show the current color in that format:

| Format | Example for `#0ea5e9` |
| --- | --- |
| HEX | `#0ea5e9` |
| RGB | `14 165 233` |
| HSL | `198.6 88.7% 48.4%` |
| HSB | `198.6 94% 91.4%` |
| OKLCH | `68.47% 0.14787 237.323` |

With a single format, the menu SHALL be hidden. The shown format SHALL support `v-model:format` and `defaultFormat`, and SHALL default to the last format shown in the same picker, else HEX.

The fields for each format:
- **HEX**: one field showing the value in uppercase without `#`. It SHALL accept 3 or 6 hex digits, with or without `#`, in any case.
- **RGB, HSL and HSB**: three channel fields of integers, in that format's channels.
- **OKLCH**: three fields: lightness in %, chroma and hue. The `%` on lightness is optional.

Every field SHALL have an accessible name for its channel. A committed edit SHALL update the shared color, and therefore emit `update:modelValue` as lowercase `#rrggbb`. An invalid value SHALL revert to the current color on commit.

The shown format SHALL NOT change what `ColorPicker` emits.

#### Scenario: Switching to OKLCH does not change the v-model
- **WHEN** a picker bound with `v-model="c"`, where `c` is `#0ea5e9`, has OKLCH chosen in its format menu
- **THEN** the fields show `68.47`, `0.14787` and `237.323` (lightness, chroma, hue), `c` is still `#0ea5e9`, and no `update:modelValue` is emitted

#### Scenario: Editing an RGB channel
- **WHEN** RGB is chosen and the user sets the red field to `255` and commits
- **THEN** `update:modelValue` is emitted with the new lowercase hex, and the area and slider follow

#### Scenario: Hex without the hash
- **WHEN** HEX is chosen and the user types `7c3aed` and commits
- **THEN** the color becomes `#7c3aed` and the field shows `7C3AED`

#### Scenario: OKLCH hue survives zero chroma
- **WHEN** OKLCH is chosen with hue 237.323, and the user sets chroma to 0, commits, then sets chroma back to 0.1 and commits
- **THEN** the hue field still reads about 237.3

#### Scenario: Composition with color-scale stays intact
- **WHEN** the Brand scale demo's picker panel switches its format to OKLCH
- **THEN** the shared `v-model` stays hex and the scale still shows 11 shades

### Requirement: Eye dropper
`ColorPickerEyeDropper` SHALL render an icon button that opens the browser's EyeDropper and applies the picked color to the picker. It SHALL render nothing on the server, during the first client render, and in browsers without `window.EyeDropper`. Cancelling the dropper with Escape SHALL leave the color unchanged and SHALL NOT throw. The button SHALL be disabled when the picker is disabled, and SHALL have an accessible name.

#### Scenario: Unsupported browser
- **WHEN** the panel renders in a browser without `window.EyeDropper`
- **THEN** no eye dropper button is in the DOM, and the hue slider takes its space

#### Scenario: No hydration mismatch
- **WHEN** a page containing an open picker panel is server-rendered and hydrated in a supporting browser
- **THEN** no hydration mismatch is reported, and the button appears after mount

#### Scenario: Picking a color
- **WHEN** the user picks a pixel whose color is `#ff0000`
- **THEN** `update:modelValue` is emitted with `#ff0000`

### Requirement: Copy action
`ColorPickerCopy` SHALL render an icon button that copies the current color to the clipboard. It copies in its own `format` prop when that prop is given. Otherwise it copies in the format shown by the picker's `ColorPickerFields`, or as hex when no fields are mounted.

Copied values SHALL be CSS-style strings:

| Format | Copied value for `#0ea5e9` |
| --- | --- |
| HEX | `#0ea5e9` |
| RGB | `rgb(14 165 233)` |
| HSL | `hsl(198.6 88.7% 48.4%)` |
| HSB | `hsb(198.6 94% 91.4%)` |
| OKLCH | `oklch(68.47% 0.14787 237.323)` |

After a copy, the button SHALL show a copied state for about 2 seconds, and a polite live region SHALL announce "Color copied".

#### Scenario: Copy follows the shown format
- **WHEN** the fields show OKLCH and the user clicks the copy button
- **THEN** the clipboard holds `oklch(68.47% 0.14787 237.323)` for `#0ea5e9`, and the live region announces the copy

#### Scenario: Copy without fields
- **WHEN** a `ColorPickerCopy` is used in a picker with no `ColorPickerFields`
- **THEN** it copies the hex value
