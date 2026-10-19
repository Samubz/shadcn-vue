# Tasks

## 1. Verification spikes (open points from the design debate)

- [x] 1.1 Archive `add-color-picker` (`/opsx:archive add-color-picker`) so that `openspec/specs/color-picker` and `openspec/specs/color-docs` exist. This change's MODIFIED requirements apply against them. Verify with `openspec validate add-color-picker-format-tools --strict`.
- [x] 1.2 Remount check: does reka's `PopoverContent` unmount its children on close?
  - Read `reka-ui/dist/Popover/PopoverContent.js` and `Presence`, and confirm in `pnpm dev`: close and reopen a picker after choosing OKLCH.
  - Record the result in design.md D5.
  - If the content unmounts, the root's "last shown format" memory is required; if not, simplify D5.
- [x] 1.3 Icon check: decide the eye dropper icon names for all five libraries (lucide `PipetteIcon`, plus the tabler, hugeicons, phosphor and remixicon equivalents used by reui `color-picker.tsx:2313-2319`). Check them against `apps/v4/public/r/icons/index.json`. If any is missing, plan to run `pnpm --filter v4 registry:build:icons` in task 7.2.
- [x] 1.4 OKLCH hue at zero chroma: write a failing vitest case first, in `apps/v4/scripts/lib/color-picker-format.test.ts`, showing that `hexToOklch` returns hue 0 for a gray. This confirms the risk the local hue memory in task 3.3 must cover.
- [x] 1.5 Record a baseline:
  - `pnpm --filter v4 test`
  - `NODE_OPTIONS=--max-old-space-size=12288 pnpm --filter v4 typecheck` (39 known errors outside this change)
  - `pnpm lint`

## 2. Contract (`apps/v4/registry/bases/reka/ui/color-picker/`)

- [x] 2.1 Add `format.ts` with:
  - `COLOR_PICKER_FORMATS` (`["hex", "rgb", "hsl", "hsb", "oklch"]`)
  - the `ColorPickerFormat` type
  - `formatColor(color, format, { css?: boolean })`, which returns the menu preview without `css` and the copied CSS string with `css: true` (design D4). OKLCH uses the `scale.ts` quantization.
- [x] 2.2 Extend `ColorPickerContext` in `utils.ts` with:
  - `shownFormat`
  - `registerFormat`, following the `registerInput` pattern
  - the root's remembered `lastShownFormat`
  Document the "never changes what is emitted" rule in a JSDoc (design D5).
- [x] 2.3 Mirror `format.ts` and `utils.ts` in `registry/new-york-v4/ui/color-picker/`, changing only import paths.

## 3. Behavior: reka base parts

- [x] 3.1 In `ColorPicker.vue`, implement `shownFormat`, `registerFormat` and `lastShownFormat`. Do not touch the hex emit or the echo guard.
- [x] 3.2 Add `ColorPickerFields.vue`:
  - an `InputGroup` with a `DropdownMenu` format menu as a leading addon (`DropdownMenuRadioGroup`; each item shows the name and the `formatColor` preview; hidden for a single format)
  - a `formats` prop, `v-model:format` and `defaultFormat`
  - fields per design D3:
    - HEX: own input, uppercase without `#`, accepting 3 or 6 digits with or without `#`
    - RGB, HSL, HSB: reka `ColorFieldRoot channel` fed `convertToRgb`, `convertToHsl` or `color`
    - OKLCH: own inputs that write through `oklchToHex`
  - commits go through `setColor`, and invalid input reverts
  - accessible names per channel
  - `id` and `aria-describedby` on the first field
- [x] 3.3 In `ColorPickerFields.vue`, keep the last OKLCH hue locally and reuse it while chroma is 0 (design risk; spec scenario "OKLCH hue survives zero chroma").
- [x] 3.4 Add `ColorPickerEyeDropper.vue` (design D6):
  - `useEyeDropper` from `@vueuse/core`, with `v-if="isSupported"`
  - on click, `sRGBHex` goes to `setColor`; ignore `AbortError`
  - disabled with the picker
  - `IconPlaceholder` pipette icon and an accessible name
- [x] 3.5 Add `ColorPickerCopy.vue` (design D7):
  - a `format` prop that takes priority over `shownFormat`, with hex as the fallback
  - `useClipboard({ copiedDuring: 2000, legacy: true })`
  - `data-copied`
  - copy and check `IconPlaceholder`s
  - an sr-only `role="status"` region announcing "Color copied"
- [x] 3.6 Change the default slot of `ColorPickerContent.vue` to: Area, then a row `[EyeDropper][Slider flex-1][Copy]`, then `Fields` (design D8).
- [x] 3.7 Add the new tokens from design D8 to all 8 `registry/styles/style-*.css` files, derived from each style's input-group and dropdown tokens.
- [x] 3.8 Mirror 3.1–3.6 in `registry/new-york-v4/ui/color-picker/`, with literal classes and Lucide icons. Keep the file lists and exports identical.

## 4. Integration

- [x] 4.1 Export `ColorPickerFields`, `ColorPickerEyeDropper`, `ColorPickerCopy`, `COLOR_PICKER_FORMATS`, `formatColor` and the `ColorPickerFormat` type from both `index.ts` barrels.

## 5. Verification

- [x] 5.1 In `apps/v4/scripts/lib/color-picker-format.test.ts`, test `formatColor` previews and CSS strings for `#0ea5e9` against the spec tables. Also cover the OKLCH quantization round trip (hex → OKLCH string → `oklchToHex` gives the same hex for a sample of colors).
- [x] 5.2 Extend `color-registry.test.ts`:
  - `color-picker.json` lists `dropdown-menu` and `oklch`
  - it publishes the three new SFCs and `format.ts`
  - both sources stay in sync
- [x] 5.3 Add the new test file to the `test` script in `apps/v4/package.json`.

## 6. Examples, demos and docs

- [x] 6.1 Add `ColorPickerFormatFields.vue` and `ColorPickerTools.vue` (eye dropper and copy) examples in `registry/bases/reka/examples/color-picker/`, and include them in `ColorPickerExample.vue`.
- [x] 6.2 Add `ColorPickerFieldsDemo.vue` and `ColorPickerToolsDemo.vue` in `apps/v4/components/demo/`.
- [x] 6.3 Update `apps/v4/content/docs/components/color-picker.md` to the section list in `specs/color-docs/spec.md`, including the presentation-only format note and the eye dropper browser support note.

## 7. Build and checks

- [x] 7.1 Run `pnpm registry:build` twice: `build-styles-registry` reads `_registry.ts` before regenerating it. Then verify that no `cn-color-picker-*` tokens remain in `apps/v4/styles/reka-*/ui/color-picker`.
- [x] 7.2 If task 1.3 found missing icons, run `pnpm --filter v4 registry:build:icons`. Then confirm `pnpm --filter v4 registry:check:icons` passes.
- [x] 7.3 Smoke-test in `pnpm dev`, in `/create?item=color-picker-example` (nova, lyra, maia, rhea) and on the docs page, against every scenario of `specs/color-picker/spec.md`:
  - format switch keeps the `v-model`
  - RGB edit
  - hex without `#`
  - OKLCH hue at C = 0
  - copy follows the shown format
  - eye dropper visible in Chromium only, with no hydration warning
  - the Brand scale still shows 11 shades after switching its panel to OKLCH
- [x] 7.4 Install the item with the CLI into a scratch project (`templates/vite` with a `reka-nova` `components.json`): `REGISTRY_URL=http://localhost:3000/r node packages/cli/dist/index.js add color-picker`. Then confirm that `vue-tsc --noEmit` passes, and that `dropdown-menu` and `lib/oklch.ts` were installed.
- [x] 7.5 Run the final checks and compare them with the baseline from 1.5: `pnpm --filter v4 test`, typecheck and `pnpm lint`.
