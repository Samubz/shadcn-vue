# Proposal

## Why

shadcn-vue has no color picker. Users who need to set a brand, accent or theme color currently have to assemble one themselves. reka-ui 2.10 already ships the headless pieces (`ColorArea`, `ColorSlider`, `ColorField`, `ColorSwatch`, `ColorSwatchPicker`) that we can wrap in the library's usual way. reka has no OKLCH support (`ColorSpace = 'rgb' | 'hsl' | 'hsb'`), so a tool that expands one base color into a perceptual shade scale also needs a small color-math helper.

The two target experiences are inspired by reui (MIT):

- **Popover picker** (`c-color-picker-2`): a root with no children draws its own swatch trigger and a popover holding a saturation/brightness area, a hue slider and a hex field.
- **Brand scale** (`c-color-picker-14`): a base color expands into 11 shades (50–950) generated in OKLCH. Each shade is shown as a named swatch, and the whole scale can be copied as CSS custom properties.

## What Changes

- Add a `color-picker` `registry:ui` item, in both `registry/bases/reka/ui/color-picker/` and `registry/new-york-v4/ui/color-picker/`:
  - It is a family of thin wrappers over reka's Color* primitives, composed with the existing `popover` and `input-group` items.
  - Parts: `ColorPicker`, `ColorPickerTrigger`, `ColorPickerInput`, `ColorPickerContent`, `ColorPickerArea`, `ColorPickerSlider`, `ColorPickerSwatch`.
  - `<ColorPicker />` with no children renders a default trigger and popover.
  - The `v-model` is a hex string.
- Add a `color-scale` `registry:ui` item, installable with `shadcn-vue add color-scale`, in both sources:
  - Parts: `ColorScale` (root that owns the base color and computes the scale), `ColorScaleSwatches` (an ordered grid of named swatches with step labels) and `ColorScaleCopy` (copies the scale as `--<prefix>-<step>: <hex>;`).
  - The scale math is in its folder and uses the OKLCH helper.
  - It depends on `color-picker` (for its swatch), `button` and the `oklch` lib.
- Add an `oklch` `registry:lib` item (`registry/bases/reka/lib/oklch.ts`, mirrored in `new-york-v4/lib/`):
  - Exports hex ↔ OKLCH conversion with CSS Color 4 gamut mapping into sRGB, ported from reui.
  - It is published per style like `utils`.
- Add `cn-color-picker-*` and `cn-color-scale-*` token rules to all 8 `registry/styles/style-*.css` files.
- Add docs pages `content/docs/components/color-picker.md` and `content/docs/components/color-scale.md`, with docs demos in `components/demo/` and `/create` showcase examples in `registry/bases/reka/examples/{color-picker,color-scale}/`.
  - The Brand scale card is a color-scale demo.
  - The popover-in-a-`Field` pattern is a color-picker demo.
- Regenerate the registry (`pnpm registry:build`) and the icon map if new icon placeholders are introduced.

No breaking changes: every item is new.

## Capabilities

### New Capabilities

- `color-picker`: The public contract of the styled ColorPicker. Covers:
  - parts and exports
  - the hex `v-model`
  - the default trigger and popover when it has no children
  - composition when it has children
  - hue preservation on achromatic colors
  - tolerance of invalid input
  - accessibility inherited from reka
  - theming hooks (`data-slot`, `cn-*` tokens)
  - per-style rendering
- `color-scale`: The public contract of the styled ColorScale. Covers:
  - the base-color `v-model`
  - the fixed 11-step OKLCH scale anchored at 500
  - gamut-mapped hex output
  - named swatches
  - the CSS copy action and its `prefix`
  - its slot props
  - per-style rendering
  - installation through the CLI together with its dependencies
- `color-docs`: Documentation and runnable examples for both items:
  - the docs pages and their sections
  - the demos they embed, including the Brand scale card and the popover-in-a-Field picker
  - the `/create` showcase examples

### Modified Capabilities

None. `openspec/specs/` has no existing capabilities.

## Impact

- **New source**:
  - `apps/v4/registry/bases/reka/ui/{color-picker,color-scale}/**`
  - `apps/v4/registry/new-york-v4/ui/{color-picker,color-scale}/**`
  - `apps/v4/registry/{bases/reka,new-york-v4}/lib/oklch.ts`
  - `apps/v4/registry/bases/reka/examples/{color-picker,color-scale}/**`
  - `apps/v4/components/demo/ColorPicker*.vue` and `ColorScale*.vue`
  - `apps/v4/content/docs/components/{color-picker,color-scale}.md`
- **Modified source**: all 8 `apps/v4/registry/styles/style-*.css` files, which gain new `MARK:` sections.
- **Generated**, through `pnpm registry:build`:
  - `public/r/**`, including new `color-picker.json`, `color-scale.json` and `oklch.json` per style
  - `styles/reka-*/ui/{color-picker,color-scale}/**`
  - the `_registry.ts` files and the registry indexes
  - `public/r/icons/index.json`, if new icon placeholders are added
- **Dependencies**: no new npm packages. It uses `reka-ui` (already 2.10.1), `@vueuse/core` and `cn`.
- **Licensing**: the OKLCH and gamut-mapping math is ported from reui (MIT). Its source file keeps an attribution comment.
