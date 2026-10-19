# Spec Delta

## Purpose

Documents the ColorPicker's format fields, eye dropper and copy action.

## MODIFIED Requirements

### Requirement: Color picker docs page
The page at `/docs/components/color-picker` SHALL contain, in order:
- a live demo
- Installation (CLI and manual)
- Usage
- Composition
- Examples:
  - Popover picker in a Field
  - Input with popover
  - Format fields
  - Eye dropper and copy
  - Swatch
- Accepted formats. This section SHALL state that the `v-model` is hex. It SHALL list what the input accepts. It SHALL explain that the format shown by `ColorPickerFields` only changes what is displayed and copied, never what is emitted.
- API Reference, linking to reka-ui's Color Area, Color Slider, Color Field and Color Swatch docs and covering `ColorPickerFields`, `ColorPickerEyeDropper`, `ColorPickerCopy` and `formatColor`.

#### Scenario: Visiting the page
- **WHEN** a reader opens `/docs/components/color-picker`
- **THEN** every listed section is present and the page renders without console errors

#### Scenario: Eye dropper support is documented
- **WHEN** a reader reads the "Eye dropper and copy" example
- **THEN** the page states that the eye dropper only appears in browsers with the EyeDropper API (Chromium-based browsers at the time of writing)
