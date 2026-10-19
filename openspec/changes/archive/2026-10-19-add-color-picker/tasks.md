# Tasks

## 1. Setup

- [x] 1.1 Run `pnpm i --frozen-lockfile` at the repo root. Confirm that the installed `reka-ui` is 2.10.x and exports `ColorAreaRoot`, `ColorSliderRoot`, `ColorFieldRoot`, `ColorSwatch`, `isValidColor` and `colorToString` (grep `reka-ui/dist/index.d.ts`).
- [x] 1.2 Record a baseline: run `pnpm lint`, `pnpm --filter v4 typecheck` and `pnpm test` on the unchanged branch and note any failures that already exist.

## 2. `oklch` lib (`apps/v4/registry/bases/reka/lib/oklch.ts`)

- [x] 2.1 Port sRGB ↔ linear ↔ OKLab ↔ OKLCH and the CSS Color 4 gamut mapping from reui `color-picker.tsx:211-316` into `lib/oklch.ts`, with an MIT attribution comment. Export `hexToOklch` and `oklchToHex` (design D6). Use double quotes, as the registry ESLint override requires.
- [x] 2.2 Generate fixtures once from reui's reference functions for `#7c3aed`, `#3b82f6`, `#0ea5e9`, `#000000`, `#ffffff` and `#ff0000`: the round trip, plus the full 11-step scale from task 3.1. Commit them next to the test.
- [x] 2.3 Add `apps/v4/scripts/lib/oklch.test.ts` (vitest), covering the round trip, the gamut-mapped output and the fixtures. Add it to the `test` script in `apps/v4/package.json` so CI runs it. Verify with `pnpm --filter v4 test`. The `test` script runs explicit files, so the new test must be appended to it.
- [x] 2.4 Mirror the file in `apps/v4/registry/new-york-v4/lib/oklch.ts`.

## 3. `color-scale` math (`apps/v4/registry/bases/reka/ui/color-scale/scale.ts`)

- [x] 3.1 Implement `buildColorScale(baseHex)` exactly as described in design D7, on top of `@/registry/bases/reka/lib/oklch`. Unparseable input returns `[]`.
- [x] 3.2 Extend `oklch.test.ts`, or add `color-scale.test.ts` to the `test` script:
  - 11 steps, in order
  - step 500 equals the base
  - lightness strictly decreasing from 50 to 950
  - fixtures match for the bases in 2.2
  - `[]` for invalid input

## 4. Reka base `color-picker` (`apps/v4/registry/bases/reka/ui/color-picker/`)

- [x] 4.1 Add a `utils.ts` with a `createContext`-based context. It holds the shared HSB `Color` and the setters (design D2 and D3).
- [x] 4.2 Implement `ColorPicker.vue`:
  - `PopoverRoot` with no DOM of its own
  - `v-model` and `defaultValue` validated with `isValidColor` (design D4)
  - the HSB state and hex emits
  - the echo guard (design D3)
  - the default `<ColorPickerTrigger /><ColorPickerContent />` when the slot is empty
- [x] 4.3 Implement `ColorPickerTrigger.vue`: a swatch `PopoverTrigger` button with a checkerboard background, `cn-color-picker-trigger`, and an accessible name that includes the hex value.
- [x] 4.4 Implement `ColorPickerContent.vue`: a `PopoverContent` with `cn-color-picker-content`. With no children it renders Area → hue Slider → Input.
- [x] 4.5 Implement `ColorPickerArea.vue`: `ColorAreaRoot` with `colorSpace="hsb"`, saturation on x and brightness on y, plus `ColorAreaArea` and `ColorAreaThumb`, using the `cn-color-picker-area` and `-area-thumb` tokens.
- [x] 4.6 Implement `ColorPickerSlider.vue`: `ColorSliderRoot` with a `channel` prop (default `"hue"`), plus track and thumb, using the `cn-color-picker-slider`, `-slider-track` and `-slider-thumb` tokens.
- [x] 4.7 Implement `ColorPickerInput.vue`: an `InputGroup` with a `ColorPickerTrigger` addon and a `ColorFieldRoot`/`ColorFieldInput` in hex.
- [x] 4.8 Implement `ColorPickerSwatch.vue`, wrapping reka's `ColorSwatch` (`color`, `label`) with `cn-color-picker-swatch`.
- [x] 4.9 Add the `index.ts` barrel exporting the 7 parts. Verify with `pnpm --filter v4 typecheck` and `pnpm lint`.
- [x] 4.10 Smoke-test it in `pnpm dev` against every scenario in `specs/color-picker/spec.md`:
  - no-children popover
  - composition
  - hue preserved at gray
  - `oklch(...)` model value does not throw
  - invalid typed text reverts
  - keyboard

## 5. Reka base `color-scale` (`apps/v4/registry/bases/reka/ui/color-scale/`)

- [x] 5.1 Implement `ColorScale.vue`:
  - renderless
  - `v-model` and `defaultValue`
  - `prefix` defaulting to `"brand"`
  - provides `{ base, scale, css }` through context and slot props
  - default content `<ColorScaleSwatches />`
- [x] 5.2 Implement `ColorScaleSwatches.vue`: an `<ol>` grid of 11 items with `ColorPickerSwatch` labelled `"<step>, <hex>"` and a step label, using the `cn-color-scale-swatches`, `-swatch` and `-step` tokens.
- [x] 5.3 Implement `ColorScaleCopy.vue`, following `ui/code-block/CodeBlockCopyButton.vue`:
  - `Button` with `useClipboard`
  - `IconPlaceholder` copy and check icons
  - copied state
  - `sr-only` `role="status"` announcement
  - disabled when `css` is empty
- [x] 5.4 Add the `index.ts` barrel, also re-exporting `buildColorScale`. Verify with `pnpm --filter v4 typecheck` and `pnpm lint`.

## 6. Per-style CSS (`apps/v4/registry/styles/style-*.css`)

- [x] 6.1 Add `/* MARK: Color Picker */` and `/* MARK: Color Scale */` sections to all 8 style files (vega, nova, maia, lyra, mira, luma, sera, rhea), with every token from design D8. Derive the values from each file's `cn-popover-content`, `cn-input` and `cn-slider-thumb` rules: round thumbs for most styles, squircle for mira, square for lyra and sera.
- [x] 6.2 Run `pnpm registry:build-only` from the repo root. Verify that `grep -r "cn-color-" apps/v4/styles/reka-*/ui/color-*` returns nothing, apart from allowlisted tokens in `scripts/lib/expand-cn-classes.ts`.

## 7. new-york-v4 mirror (`apps/v4/registry/new-york-v4/ui/{color-picker,color-scale}/`)

- [x] 7.1 Mirror sections 3 to 5 with literal Tailwind classes (nova values adapted to new-york-v4 tokens). Keep the file lists and exports identical to the reka base. Verify with `pnpm --filter v4 typecheck`.

## 8. Examples, demos and docs

- [x] 8.1 Add the `/create` showcase examples as self-contained `.vue` files:
  - `registry/bases/reka/examples/color-picker/`: popover picker, input with popover, swatch row
  - `registry/bases/reka/examples/color-scale/`: Brand scale card
  Verify `/preview/reka/color-picker-example` and `/preview/reka/color-scale-example` in the vega, maia, lyra and rhea styles.
- [x] 8.2 Add the docs demos in `apps/v4/components/demo/`:
  - `ColorPickerDemo.vue` (popover in a `Field`, from `#0ea5e9`)
  - `ColorPickerInputDemo.vue`
  - `ColorPickerSwatchDemo.vue`
  - `ColorScaleDemo.vue` (the Brand scale `Card` from `specs/color-docs/spec.md`)
  Each opens in `pnpm dev` and its code tab shows the SFC source.
- [x] 8.3 Write `apps/v4/content/docs/components/color-picker.md` and `color-scale.md` with the section order from `specs/color-docs/spec.md`. Check how the docs sidebar and component lists pick up new pages, and register both if it is not automatic.

## 9. Registry build and verification

- [x] 9.1 Run `pnpm registry:build`. Verify that `public/r/styles/<style>/color-picker.json`, `color-scale.json` and `oklch.json` exist for every reka style and for new-york-v4. Also verify that:
  - `color-scale.json` lists `registryDependencies` `color-picker`, `button` and `oklch`
  - `color-picker.json` lists `popover` and `input-group`
- [x] 9.2 If new icon placeholders were introduced, run `pnpm --filter v4 registry:build:icons`. Then check `pnpm --filter v4 registry:check:icons`.
- [x] 9.3 Run `pnpm build:cli`, then `pnpm start:cli add color-scale` (with `pnpm dev` running) in a scratch project initialised with a reka style. Verify the installed files and that the project type-checks.
- [x] 9.4 Run the final checks: `pnpm lint`, `pnpm --filter v4 typecheck` and `pnpm test`. Compare the results against the baseline from 1.2.
