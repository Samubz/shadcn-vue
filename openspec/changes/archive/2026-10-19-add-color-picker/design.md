# Design

## Context

shadcn-vue keeps two component sources:

- `registry/bases/reka/`: the source of truth for the multi-style system. It uses `cn-*` tokens that each `registry/styles/style-*.css` maps per style.
- `registry/new-york-v4/`: the classic style, with literal classes.

Every `registry:ui` item exists in both sources. Upstream shadcn/ui has no color picker, so this change has no upstream to port near-verbatim. The visual and API references are reui's color picker examples (MIT): `c-color-picker-2` (popover) and `c-color-picker-14` (Brand scale).

Facts this design relies on (verified in the repo):

- reka-ui 2.10.1 exports `ColorAreaRoot/Area/Thumb`, `ColorSliderRoot/Track/Thumb`, `ColorFieldRoot/Input`, `ColorSwatch`, `ColorSwatchPicker*`, `isValidColor`, `parseColor`, `colorToString`, and related helpers.
  - Every root accepts `modelValue?: string | Color`.
  - `ColorAreaRoot` takes `colorSpace`, `xChannel` and `yChannel`.
  - `ColorSliderRoot` takes `channel`.
  - The roots emit `update:modelValue` (always hex) and `update:color` (a `Color` object).
  - `ColorSwatch` renders `role="img"`, `aria-roledescription="color swatch"` and `aria-label` from `label`.
- reka has no OKLCH:
  - `type ColorSpace = 'rgb' | 'hsl' | 'hsb'`.
  - `color/parse.js` throws `Unable to parse color` for anything that is not `#hex`, `rgb()`, `hsl()` or `hsb()`. Its `rgb()` regex requires commas.
  - `ColorAreaRoot` calls `normalizeColor` inside an unguarded computed getter, so an unparseable `modelValue` throws during render.
  - `ColorFieldRoot` silently reverts typed text that `isValidColor` rejects.
- For reka styles, only `registry:ui` and `registry:lib` items are published (`scripts/lib/build-styles-registry.ts:29-30`). Examples and blocks are not installable with the CLI, and `public/r/styles/reka-nova/` contains no example or block items.
- `crawlExample` publishes only `.vue` files (`scripts/crawl-content.ts:133`).
- A `ui` item publishes every file in its folder, `.ts` included.
- `crawlLib` publishes each `lib/*.ts` as its own `registry:lib`.
- An import of `@/registry/bases/reka/<kind>/<name>` becomes `registryDependencies: [name]` (`crawl-content.ts:442-449`).

## Goals / Non-Goals

**Goals:**

- A `color-picker` ui item that wraps reka's Color* primitives the shadcn way: one SFC per part, an `index.ts` barrel, `cn` and `reactiveOmit`, and thin wrappers.
  - `<ColorPicker v-model="hex" />` with no children renders the reui `c-color-picker-2` experience.
  - The parts can also be composed freely.
- A `color-scale` ui item, installable with `shadcn-vue add color-scale`. It turns one base color into an 11-step OKLCH scale (50–950) with named swatches and a "copy as CSS variables" action. This reproduces reui `c-color-picker-14` when composed in a Card with a `ColorPickerInput`.
- An `oklch` lib item with gamut-mapped hex ↔ OKLCH conversion, reusable outside the scale.
- Correct rendering in all 8 styles and in new-york-v4. Docs pages, demos and `/create` showcase examples for both items.

**Non-Goals:**

- Porting reui's own color engine and interactive parts:
  - its parser for `oklch()`, `lab()`, `color()`, named colors and space-separated `rgb()`
  - its drag and keyboard handling
  - its i18n layer
  - its hue wheel, eye dropper and channel fields
- Accepting or emitting OKLCH (or any non-hex format) through the ColorPicker's `v-model` in this change. See Open Questions.
- An alpha/opacity slider. reka supports an `alpha` channel, so this can be added later as `ColorPickerSlider channel="alpha"` without an API break.
- A configurable scale: custom steps, custom lightness/chroma curves or output formats other than hex.

## Decisions

### D1. Build on reka's Color* primitives, not on a port of reui's engine

Each styled part is a thin wrapper over one reka primitive:

| Part | Wraps | Adds |
| --- | --- | --- |
| `ColorPickerArea` | `ColorAreaRoot` + `ColorAreaArea` + `ColorAreaThumb` | `colorSpace="hsb"`, `x-channel="saturation"`, `y-channel="brightness"` |
| `ColorPickerSlider` | `ColorSliderRoot` + track + thumb | `channel` prop, default `"hue"` |
| `ColorPickerInput` | `ColorFieldRoot` + `ColorFieldInput` | an `input-group` with a `ColorPickerTrigger` swatch addon |
| `ColorPickerSwatch` | `ColorSwatch` | — |

Reka owns the pointer, keyboard and ARIA behavior.

Alternatives considered:

- **Port reui's `color-picker.tsx` (about 3,000 lines of React with its own engine).** Rejected. The repo only implements its own logic when reka has no equivalent: commit `03554c98` (questionnaire) says "has no Reka UI equivalent, so … logic is implemented in `useQuestionnaire.ts`". The drawer design asks for "a thin wrapper around each primitive" and rejects duplicating primitive state because it "risks drifting from the primitive's real state" (`openspec/changes/add-base-drawer/design.md:28,70-73`). The port would also need to be split into per-part SFCs, written twice (both sources) and given 8 token sets. Its only real advantages are OKLCH and broad parsing, and neither is needed by the two requested experiences, whose inputs are hex (`#0ea5e9`, `#7c3aed`). The OKLCH math that *is* needed lives in D6.
- **Only an example, no ui item, as the Date Picker does** (`content/docs/components/date-picker.md:19`). Rejected for the picker. The requested behavior, "a root with no children draws its own trigger and popover", is an API contract, and a copy-paste example cannot provide it.

### D2. `ColorPicker` is a renderless root with default content

`ColorPicker` renders reka's `PopoverRoot`, which emits no DOM element. It owns the color state, provides it through a `createContext` context, and renders its default slot.

When the default slot is empty, it renders the fallback `<ColorPickerTrigger /><ColorPickerContent />`. When children are passed, they lay out in the parent with no wrapper, as in reui.

`ColorPickerContent` wraps `PopoverContent` and, when it has no children, renders `ColorPickerArea`, a hue `ColorPickerSlider` and a `ColorPickerInput`.

Precedent: a styled wrapper that renders its full structure when the caller passes no children, as `ui/slider/Slider.vue` does for its track, range and thumbs, and `ui/calendar/Calendar.vue` does for its slots.

Alternative considered:

- **A wrapper `div` root.** Rejected. It would break `Field` layouts, where reui's agent notes rely on the picker's children laying out directly in the parent.

### D3. One shared `Color` object in HSB; emit hex

The root keeps a reka `Color` object in the `hsb` space as its internal state. Each primitive receives it through `:model-value="color"` and writes back through `@update:color`. The root emits `update:modelValue` with `colorToString(color, "hex")`.

Keeping the object, rather than round-tripping hex through every part, preserves the hue when saturation or brightness reaches 0. Each reka root already preserves hue internally, but separate primitives that share a hex string would lose it.

When the parent writes a new `modelValue`, the root re-parses it only if it differs from the hex of the current state. This avoids resetting the hue on its own echo.

### D4. Invalid input never throws

Before passing a `modelValue` or `defaultValue` to reka, the root validates it with reka's `isValidColor`. An invalid value, such as `oklch(...)`, an unprefixed hex or a space-separated `rgb()`, keeps the last valid color (initially `#000000`) and logs a development-only warning. This closes the render-time throw in `ColorAreaRoot`.

Typed text that reka rejects reverts silently, which is reka's own `ColorField` behavior. The docs state the accepted formats.

### D5. `color-scale` is a `registry:ui` item

The Brand scale must be installable with `shadcn-vue add color-scale`. For reka styles, the only installable item types are `ui` and `lib` (`build-styles-registry.ts:29-30`). So it becomes a ui item, written in both sources, with its own tokens in the 8 style files and its own docs page.

Parts:

- `ColorScale`:
  - It is a renderless root.
  - `v-model` is the base hex color.
  - `prefix` defaults to `"brand"`.
  - It provides `{ base, scale, css }` through context and exposes them as default-slot props.
  - With no children it renders `<ColorScaleSwatches />`.
- `ColorScaleSwatches`: an `<ol>` with a grid of 11 columns. Each item renders `ColorPickerSwatch`, with the label `"<step>, <hex>"`, and a tabular step label.
- `ColorScaleCopy`:
  - It is a `Button` with an icon from `IconPlaceholder` that copies `css` through `useClipboard`, following `ui/code-block/CodeBlockCopyButton.vue`.
  - It shows a copied state and announces "CSS variables copied" through an `sr-only` `role="status"` region.
  - It is disabled when the scale is empty.

The base-color input is not part of `color-scale`. Users compose it with `ColorPicker`/`ColorPickerInput` bound to the same `v-model`, which is what the Brand scale demo does inside a `Card`. This keeps one input implementation and keeps `color-scale` focused on the scale. `color-scale` depends on `color-picker` for its swatch and on `button`. The crawler infers both dependencies from the imports.

Alternatives considered:

- **An example** (how reui ships it: `c-color-picker-14` is "Type: example", with `buildScale` inline). This was the debate's preferred low-cost option. It was rejected by the maintainer's decision that the scale must be installable with the CLI. A reka example is never published (`crawl-content.ts:133`, `build-styles-registry.ts:29-30`).
- **A block** (`blocks/*/components/*`). Rejected. Reka blocks are not published per style either.

### D6. OKLCH math in a `registry:lib` item named `oklch`

`registry/bases/reka/lib/oklch.ts`, mirrored in `new-york-v4/lib/oklch.ts`, exports:

- `hexToOklch(hex): [l, c, h]`
- `oklchToHex([l, c, h]): string`, with CSS Color 4 gamut mapping into sRGB (binary search on chroma with a deltaEOK just-noticeable-difference check)
- the internal sRGB ↔ linear ↔ OKLab ↔ OKLCH helpers

The math is ported from reui `color-picker.tsx:211-316` (MIT), with an attribution comment.

Gamut mapping is required, not optional. The Tailwind-blue chroma curve multiplies chroma by 1.14 at steps 600 and 700, which pushes saturated bases out of sRGB. reui's own comment notes that naive chroma clipping drifted by up to 27 units in hex.

Alternatives considered:

- **Inside `ui/color-scale/`.** Rejected. The math is not specific to the scale (a future OKLCH-aware picker or theme tooling would reuse it). As a lib it is published per style like `utils`, and the CLI pulls it in automatically through the inferred `registryDependencies: ["oklch"]`.
- **Inline in an example.** Rejected together with the example option in D5.

### D7. Scale algorithm

`ui/color-scale/scale.ts` exports `buildColorScale(baseHex)`, which is reui's `buildScale` ported unchanged:

- `STEPS = [50, 100, …, 900, 950]`
- Tailwind blue's `LIGHTNESS` per step, and `CHROMA` relative to step 500
- The base is pinned to step 500 and the lightness curve bends around it: steps 50–400 are interpolated toward 100, and steps 600–950 are scaled by `L / 62.3`.
- Hue is constant.

The output is a list of `{ step, value }` objects in hex. `css` is `scale.map(s => \`--${prefix}-${s.step}: ${s.value};\`).join("\n")`. An unparseable base gives an empty scale and an empty `css`.

### D8. Tokens and per-style values

New `MARK: Color Picker` and `MARK: Color Scale` sections in each of the 8 style files:

- `cn-color-picker-trigger`
- `cn-color-picker-content`
- `cn-color-picker-area`, `cn-color-picker-area-thumb`
- `cn-color-picker-slider`, `cn-color-picker-slider-track`, `cn-color-picker-slider-thumb`
- `cn-color-picker-swatch`
- `cn-color-scale-swatches`, `cn-color-scale-swatch`, `cn-color-scale-step`

Values come from each style's existing equivalents:

- radius, border and ring from its `cn-popover-content`, `cn-input` and `cn-slider-thumb`
- thumb shape following the style's slider thumb (round, squircle for mira, square for lyra and sera)

There is no upstream to copy, so each style is checked visually (task 7). Structural classes (layout, sizes, checkerboard background for transparency) stay inline in the SFCs, as in `Slider.vue`.

### D9. new-york-v4 mirror

Same file list, exports and behavior, with literal classes taken from the nova values adapted to new-york-v4 tokens. Same approach as the drawer change (`add-base-drawer` task 4.1).

## Risks / Trade-offs

- **[reka's Color* components are new in 2.10 and may change]** → The version is pinned through the workspace `catalog:`. The wrappers only use documented props and emits. A smoke check in `/create` and the docs demos catches regressions on upgrade.
- **[`color-scale` adds a second ui item with no upstream or reka precedent, and costs two sources, 8 token sets and a docs page]** → Accepted, because CLI installability was required. The token surface is kept to 3 tokens; unmapped tokens are stripped and fall back to the inline structural classes.
- **[Per-style token values are designed here, not ported]** → Derive them from each style's existing popover, input and slider tokens, and verify all 8 styles visually.
- **[Gamut-mapping port errors would silently shift shades]** → Unit-test `oklch.ts` against fixture hexes generated once from reui's reference functions for several bases (`#7c3aed`, `#3b82f6`, `#0ea5e9`, `#000000`, `#ffffff`, a fully saturated `#ff0000`). Run the test from `apps/v4`'s `test` script so CI covers it.
- **[`v-model` is hex-only, so users holding OKLCH theme tokens cannot bind them directly]** → Document the accepted formats, guard against throwing (D4) and point to `oklch.ts` for conversion. An OKLCH `format` is left as an open question.
- **[Hue drift if parent and root echo `modelValue` back and forth]** → The equality check in D3, plus a test scenario in the specs.

## Open Questions

- Should `ColorPicker` gain a `format` prop (`hex | rgb | hsl | hsb`) in this change? reka's `colorToString` already supports these, so the cost is small. OKLCH would additionally need `oklch.ts` parsing in the root.
- Lib item name: `oklch` (proposed, as specific as `utils`) or a broader `color`?
- Should `ColorScale` expose `steps` and `curves` as props later, or should they stay internal to keep the API small? This change keeps them internal.
