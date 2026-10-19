# color-docs Specification

## Purpose
TBD - created by archiving change add-color-picker. Update Purpose after archive.
## Requirements
### Requirement: Color picker docs page
The page at `/docs/components/color-picker` SHALL contain, in order:
- a live demo
- Installation (CLI and manual)
- Usage
- Composition
- Examples:
  - Popover picker in a Field
  - Input with popover
  - Swatch
- Accepted formats (stating that the `v-model` is hex and listing what the input accepts)
- API Reference (linking to reka-ui's Color Area, Color Slider, Color Field and Color Swatch docs)

#### Scenario: Visiting the page
- **WHEN** a reader opens `/docs/components/color-picker`
- **THEN** every listed section is present and the page renders without console errors

### Requirement: Color scale docs page
The page at `/docs/components/color-scale` SHALL contain, in order:
- a live Brand scale demo
- Installation (CLI and manual, naming the `color-picker`, `button` and `oklch` dependencies)
- Usage
- Composition
- How the scale is built (base pinned at 500, Tailwind blue curves, OKLCH, gamut mapping)
- Copying CSS variables (including the `prefix` prop)
- API Reference

#### Scenario: Visiting the page
- **WHEN** a reader opens `/docs/components/color-scale`
- **THEN** every listed section is present and the page renders without console errors

### Requirement: Popover picker demo
A docs demo SHALL reproduce the reui popover experience: `<ColorPicker />` with no children, uncontrolled from `#0ea5e9`, inside a `Field` with a label and a description. The picker's accessible name SHALL include the label.

#### Scenario: Opening the demo picker
- **WHEN** a reader clicks the demo's trigger
- **THEN** the popover opens with an area, a hue slider and a hex input set to `#0ea5e9`

### Requirement: Brand scale demo
A docs demo SHALL reproduce the reui Brand scale experience:
- a `Card` titled "Brand scale" with the description "11 shades from one base color."
- a `ColorScaleCopy` action in the card header
- a "Base color" `Field` holding a `ColorPicker` with `ColorPickerInput` and `ColorPickerContent`, bound to the same `v-model` as a `ColorScale` that starts at `#7c3aed`
- the `ColorScaleSwatches` grid

#### Scenario: Changing the base color
- **WHEN** the reader types `#0ea5e9` in the base color input and commits it
- **THEN** all 11 swatches update and the 500 swatch shows `#0ea5e9`

#### Scenario: Copying from the demo
- **WHEN** the reader clicks "Copy CSS"
- **THEN** the clipboard holds the 11 `--brand-*` lines for the current base

### Requirement: Showcase examples
`registry/bases/reka/examples/color-picker/` and `registry/bases/reka/examples/color-scale/` SHALL provide `/create` showcase examples that render in every reka style:
- the popover picker
- the input with popover
- a swatch row
- the Brand scale card

Example files SHALL be self-contained `.vue` files, because examples only publish `.vue` files.

#### Scenario: Preview in several styles
- **WHEN** `/preview/reka/color-picker-example` and `/preview/reka/color-scale-example` are opened in the vega, maia, lyra and rhea styles
- **THEN** every section renders and matches that style's popover, input and slider look

