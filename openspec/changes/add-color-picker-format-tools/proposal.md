# Proposal

## Why

The color picker shipped by `add-color-picker` only reads and writes hex inside its panel. The reui reference panel offers three more tools, which users expect from a design-tool picker:

- a format menu next to the field (HEX, RGB, HSL, HSB, OKLCH), where each option previews the current color in that format;
- an eye dropper on the left of the hue slider;
- a copy button on the right of the hue slider.

An adversarial design debate (two advocates, two rounds) compared two options. In one, the format is a root-level setting that changes what `v-model` emits. In the other, the format only changes what the panel shows and copies. The second won. It is how reui itself behaves (`color-picker.tsx:2653`: the shown format "does not change what `onValueChange` emits"). It also keeps the hex `v-model` contract and the `color-scale` composition, which binds the same `v-model` and only accepts hex.

## What Changes

- Add `ColorPickerFields` to the `color-picker` item, in the reka base and new-york-v4:
  - A format menu (`dropdown-menu` radio group), where each item shows the color in that format.
  - The fields for the chosen format:
    - one hex field (`0EA5E9`, accepts 3 or 6 digits with or without `#`);
    - three channel fields for RGB, HSL and HSB, built on reka's `ColorFieldRoot channel`;
    - three channel fields for OKLCH (L %, C, H), which read and write through the `oklch` lib.
  - It supports `v-model:format` and `defaultFormat`.
  - The shown format never changes what `ColorPicker` emits.
- Add `ColorPickerEyeDropper`: an icon button that samples a screen color through `useEyeDropper` from `@vueuse/core`. It renders nothing where the browser has no `EyeDropper`, including during SSR and the first client render.
- Add `ColorPickerCopy`: an icon button that copies the current color in the format the fields show (hex when there are no fields), or in its own `format` prop. It announces the copy in a live region.
- Extend `ColorPickerContext` with `shownFormat` and `registerFormat`, so `ColorPickerCopy` copies what the user sees. This is presentation state only.
- Change the default `ColorPickerContent` panel to:
  - the area;
  - a row with the eye dropper, the hue slider and the copy button;
  - `ColorPickerFields`.
- `color-picker` gains the `dropdown-menu` and `oklch` registry dependencies. The crawler infers them from imports.
- Add tokens for the new parts to all 8 style files, update the docs page, examples and demos, and regenerate the registry.

The `v-model` stays lowercase `#rrggbb`, so nothing breaks for consumers. The part list grows from 7 to 10, and the default panel layout changes.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `color-picker`:
  - "Parts and exports" adds three parts.
  - "Default trigger and popover without children" changes the default panel.
  - "CLI installation" adds the new dependencies.
  - New requirements cover the format fields, the eye dropper and the copy action.
- `color-docs`: "Color picker docs page" gains sections for formats, the eye dropper and copying.

These capabilities are introduced by the `add-color-picker` change, which is not archived yet. Archive `add-color-picker` first so that `openspec/specs/color-picker` and `openspec/specs/color-docs` exist when this change is archived.

## Impact

- **Source**:
  - `apps/v4/registry/{bases/reka,new-york-v4}/ui/color-picker/` (3 new SFCs, plus `utils.ts`, `ColorPickerContent.vue`, `index.ts` and a small `format.ts`)
  - `apps/v4/registry/styles/style-*.css`
  - `apps/v4/registry/bases/reka/examples/color-picker/`
  - `apps/v4/components/demo/ColorPicker*.vue`
  - `apps/v4/content/docs/components/color-picker.md`
- **Tests**: new vitest cases in `apps/v4/scripts/lib/` for the format helpers and the OKLCH channel round trip. `color-registry.test.ts` gains the new parts and dependencies.
- **Generated**: `public/r/**`, `styles/reka-*/**`, the `_registry.ts` files, and possibly `public/r/icons/index.json` for the eye dropper icon.
- **Dependencies**: no new npm packages. `useEyeDropper` and `useClipboard` come from `@vueuse/core`, which is already a dependency.
- **Unchanged**: `color-scale` and `lib/oklch.ts`.
