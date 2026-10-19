# Spec Delta

## Purpose

Defines the public contract of the styled ColorScale, which expands one base color into an 11-step OKLCH shade scale. It is distributed as the installable `color-scale` registry item, together with the `oklch` lib item it depends on.

## ADDED Requirements

### Requirement: Parts and exports
The `color-scale` item SHALL export `ColorScale`, `ColorScaleSwatches` and `ColorScaleCopy` from its `index.ts`, in both `registry/bases/reka/ui/color-scale/` and `registry/new-york-v4/ui/color-scale/`, plus the `buildColorScale` function from `scale.ts`. Every part except the renderless `ColorScale` root SHALL accept a `class` prop and render a kebab-case `data-slot` attribute.

#### Scenario: Importing the item
- **WHEN** a consumer imports `ColorScale`, `ColorScaleSwatches`, `ColorScaleCopy` and `buildColorScale` from `@/components/ui/color-scale`
- **THEN** the import type-checks

### Requirement: Base color v-model and prefix
`ColorScale` SHALL accept the base color through `v-model` (a hex string) or `defaultValue`, and a `prefix` prop that defaults to `"brand"`. It SHALL NOT render a wrapper element of its own. It SHALL expose `{ base, scale, css }` as default-slot props and to descendant parts.

#### Scenario: Slot props
- **WHEN** `<ColorScale v-model="base" v-slot="{ scale, css }">` renders with `base = "#7c3aed"`
- **THEN** `scale` has 11 entries and `css` has 11 lines

#### Scenario: Default content
- **WHEN** `<ColorScale default-value="#7c3aed" />` renders with no children
- **THEN** it renders `ColorScaleSwatches`

### Requirement: Eleven-step OKLCH scale anchored at 500
`buildColorScale(baseHex)` SHALL return 11 `{ step, value }` entries for steps 50, 100, 200, 300, 400, 500, 600, 700, 800, 900 and 950, in that order:
- `value` is a lowercase `#rrggbb` hex.
- Step 500 SHALL equal the base color, within gamut-mapping rounding.
- Lightness SHALL NOT increase from step 50 to step 950. It SHALL decrease strictly when the base is neither pure white nor pure black. With `#ffffff` or `#000000`, the curve saturates and neighboring steps can be equal, as in the reference implementation.
- Hue SHALL stay that of the base color.
- Lightness and chroma SHALL follow Tailwind blue's curves, bent around the base lightness as described in design D7.

An unparseable base SHALL return an empty list.

#### Scenario: Reference base
- **WHEN** `buildColorScale("#7c3aed")` is called
- **THEN** it returns 11 entries whose hex values match the committed fixture produced by the reference implementation, and the step 500 value is `#7c3aed`

#### Scenario: Invalid base
- **WHEN** `buildColorScale("oklch(nope)")` is called
- **THEN** it returns `[]`

### Requirement: Gamut-mapped output
Every shade SHALL be inside sRGB. The `oklch` lib SHALL bring out-of-gamut colors inside it with CSS Color 4 gamut mapping, reducing chroma at constant lightness and hue until the clipped color is within the deltaEOK just-noticeable difference, rather than clamping each channel.

#### Scenario: Saturated base
- **WHEN** `buildColorScale("#ff0000")` is called
- **THEN** every value is a valid hex, and the 600 and 700 shades match the committed gamut-mapped fixture instead of a naively clipped color

### Requirement: Named swatches
`ColorScaleSwatches` SHALL render an ordered list (`<ol>`) with one item per step. Each item SHALL contain a `ColorPickerSwatch` labelled `"<step>, <hex>"` and a visible step number.

#### Scenario: Screen reader names
- **WHEN** a screen reader reads the swatches for base `#7c3aed`
- **THEN** it announces 11 images, named for example "500, #7c3aed"

### Requirement: Copy as CSS variables
`ColorScaleCopy` SHALL be a button that copies `css` to the clipboard. `css` is one line per step in the form `--<prefix>-<step>: <hex>;`, joined by newlines. After a successful copy, the button SHALL show a copied state for about 2 seconds, and a polite live region SHALL announce "CSS variables copied". The button SHALL be disabled when the scale is empty.

#### Scenario: Copying with a custom prefix
- **WHEN** `<ColorScale default-value="#7c3aed" prefix="accent"><ColorScaleCopy /></ColorScale>` renders and the user clicks the copy button
- **THEN** the clipboard holds 11 lines starting with `--accent-50:` and ending with `--accent-950:`, and the live region announces the copy

#### Scenario: Disabled when empty
- **WHEN** the base color is invalid
- **THEN** `ColorScaleCopy` is disabled

### Requirement: Per-style rendering
The reka base source SHALL style the parts through `cn-color-scale-*` tokens, and all 8 style files SHALL define those tokens. After `pnpm registry:build`, no `cn-color-scale-*` token SHALL remain in `apps/v4/styles/reka-*/ui/color-scale/**`.

#### Scenario: Build output is token-free
- **WHEN** `pnpm registry:build` completes
- **THEN** `grep -r "cn-color-scale" apps/v4/styles/reka-*/ui/color-scale` returns no matches, and `public/r/styles/reka-<style>/color-scale.json` exists for every style

### Requirement: CLI installation with dependencies
`shadcn-vue add color-scale` SHALL install the item together with its registry dependencies:
- `color-picker`
- `button`
- the `oklch` lib

`oklch` SHALL be published as a `registry:lib` item for every style. Both `color-scale.json` and `oklch.json` SHALL list their dependencies without manual configuration in the registry scripts, because the crawler infers them from imports.

#### Scenario: Fresh install
- **WHEN** `shadcn-vue add color-scale` runs in a project initialised with any reka style
- **THEN** `components/ui/color-scale/`, `components/ui/color-picker/`, `components/ui/button/` and `lib/oklch.ts` exist, and the project type-checks
