# Design

## Context

`add-color-picker` shipped `color-picker` as thin wrappers over reka-ui's Color* primitives:

- The shared state is a reka `Color` in HSB (D3 there).
- The `v-model` is always lowercase `#rrggbb`.
- The default `ColorPickerContent` panel is area → hue slider → `ColorPickerInput`. Inside the content, that input shows a decorative swatch and a hex `ColorFieldRoot`.

`color-scale` binds the same `v-model` as a `ColorPicker` in the Brand scale demo (`components/demo/ColorScaleDemo.vue:28,42`). Its `buildColorScale` only accepts hex (`lib/oklch.ts:147-150`).

The requested panel, from reui:

```
[ eye dropper ] [ ────── hue slider ────── ] [ copy ]
[ HEX ▾ ][ 0EA5E9                                   ]
          ┌──────────────────────────────────┐
          │ HEX    #0ea5e9                 ✓ │
          │ RGB    14 165 233                │
          │ HSL    198.6 88.7% 48.4%         │
          │ HSB    198.6 94% 91.4%           │
          │ OKLCH  68.47% 0.14787 237.323    │
          └──────────────────────────────────┘
```

Facts this design relies on (verified):

- **The reui panel's format menu is presentation only.** In `color-picker.tsx:2653`: "The format shown, controlled. It does not change what `onValueChange` emits". The docs say the same at `:332-333`: "never changes what `onValueChange` emits, but it is what a copy takes".
- **reui's fields are per channel** (`tsx:2428-2437`):
  - hex is one field;
  - rgb, hsl, hsb and oklch are three fields each.
- **reka's `ColorFieldRoot` has a channel mode, with two caveats.**
  - It formats, commits, steps and clamps one channel.
  - `normalizeColor` returns a `Color` object unconverted (`color/parse.js:83-86`).
  - `getChannelValue(color, "saturation")` returns the HSB `s` when `color.space === "hsb"` (`color/channel.js:58-61`). An HSL field must therefore receive `convertToHsl(color)`.
  - It rounds channels to integers.
- **`useEyeDropper` from `@vueuse/core` 14.4 is NOT hydration-safe on its own.**
  - Its `isSupported` comes from `useSupported` (`@vueuse/core/dist/index.js:3579`, `:327-332`).
  - `useSupported` only reads `useMounted` to re-evaluate after mount. It returns `Boolean(callback())` straight away, so the first client render already sees `true` and does not match the server.
  - The part must therefore gate its own rendering on mount (corrected during implementation, after a hydration mismatch showed up on the docs page).
  - reui hides the eye dropper the same way, with a server snapshot of `false` (`tsx:2281-2287`).

## Goals / Non-Goals

**Goals:**

- Show and edit the color in HEX, RGB, HSL, HSB and OKLCH inside the panel, with a menu that previews each format.
- Copy the color in the format on screen.
- Pick a color from the screen where the browser supports it.
- Keep every existing contract: the hex `v-model`, the hue preservation, invalid input never throwing, `color-scale` composition, and `ColorPickerInput` as it is.

**Non-Goals:**

- Changing what `v-model` emits, or adding a root-level `format` prop. That question is still open (`add-color-picker/design.md` Open Questions). It needs its own change, because it modifies the hex requirement and the echo guard, and the HSB state cannot keep an out-of-sRGB OKLCH.
- Alpha, which still needs a separate change.
- Named colors, `lab()`, `color()`, or pasting a full CSS color string into a channel field.

## Decisions

### D1. The shown format is presentation state; `v-model` stays hex

The format chosen in the menu changes:

- what the fields show and accept;
- what `ColorPickerCopy` copies.

It never changes `update:modelValue`. Every edit still goes through the root's `setColor`, so these keep working:

- the hex emit (`ColorPicker.vue:76-84`);
- the echo guard (`:70-74`);
- `toSafeColor`'s hue keeping.

Alternative considered: **the format as a root setting**, where the menu changes what `v-model` emits. Rejected (its own advocate conceded):

- It contradicts reui (`tsx:2653`).
- It breaks `specs/color-picker` "Hex v-model".
- It empties the Brand scale as soon as the user picks a non-hex format.
- It flips the existing tests that make `oklch(...)` invalid for the `v-model` (`scripts/lib/color-picker-utils.test.ts:96-98`).

### D2. A new `ColorPickerFields` part, not a change to `ColorPickerInput`

`ColorPickerInput` keeps its current role: an input group with a trigger and a hex field, used outside the popover (Brand scale, "Input with Popover"). The format menu and the channel fields form a new part, `ColorPickerFields`, mirroring reui's split between `ColorPickerInput` and `ColorPickerFields`.

The default panel uses `ColorPickerFields` where it used the inner `ColorPickerInput`. This removes the `COLOR_PICKER_CONTENT_KEY` decorative-swatch branch's only default use. The key stays, because a `ColorPickerInput` composed inside the content still needs it.

Alternative considered: **adding the menu to `ColorPickerInput`**. Rejected. It would change a part that already ships and is used outside the panel, and it would mix the trigger and the format menu in one addon.

### D3. Per-channel fields

`ColorPickerFields` renders an `InputGroup` with:

- the format menu as a leading addon: a `DropdownMenu` with a `DropdownMenuRadioGroup` whose items show the format name and its preview;
- the fields for the current format.

| Format | Fields | Built on | Accepts |
| --- | --- | --- | --- |
| HEX | 1 | own input | 3 or 6 hex digits, with or without `#`, any case. It displays uppercase without `#`. |
| RGB | 3 (R, G, B) | reka `ColorFieldRoot channel` with `:model-value="convertToRgb(color)"` | integers 0–255 |
| HSL | 3 (H, S, L) | `ColorFieldRoot channel` with `:model-value="convertToHsl(color)"` | integers |
| HSB | 3 (H, S, B) | `ColorFieldRoot channel` with `:model-value="color"` | integers |
| OKLCH | 3 (L %, C, H) | own inputs | one number each; `%` is optional on L |

How each field family writes back:

- **reka channel fields** emit `update:color`, which goes to `setColor`.
- **OKLCH fields** work like this:
  - Read `hexToOklch(hex)`.
  - Replace one channel.
  - Write `oklchToHex(...)` back through `setColor`.

  Neither needs a string parser, and `lib/oklch.ts` is unchanged.

In every format, an invalid value reverts to the current color on commit.

`id` and `aria-describedby` follow the existing labelling rule and go on the first field. Each field has an accessible name, such as "Red" or "Lightness".

### D4. Formatting helpers in `ui/color-picker/format.ts`

The new file exports:

- `COLOR_PICKER_FORMATS`
- `formatColor(color, format)`

They are used for the menu previews and for copying. The format matches reui:

| Format | Preview | Copied |
| --- | --- | --- |
| hex | `#0ea5e9` | `#0ea5e9` |
| rgb | `14 165 233` | `rgb(14 165 233)` |
| hsl | `198.6 88.7% 48.4%` | `hsl(198.6 88.7% 48.4%)` |
| hsb | `198.6 94% 91.4%` | `hsb(198.6 94% 91.4%)` |
| oklch | `68.47% 0.14787 237.323` | `oklch(68.47% 0.14787 237.323)` |

OKLCH uses the same quantization as `scale.ts`: L to 0.01 %, C to 5 decimals, H to 3. The file sits in the item folder, so the CLI ships it with the item.

### D5. Shown format in the context

`ColorPickerContext` gains two members:

- `shownFormat: Readonly<Ref<ColorPickerFormat>>`, which is `"hex"` when no fields are mounted.
- `registerFormat(format: Readonly<Ref<ColorPickerFormat>>): () => void`, which follows the `registerInput` pattern. The last registered or changed field wins.

The root also remembers the last shown format, so a `ColorPickerFields` that remounts starts from `defaultFormat ?? lastShownFormat`. This memory is required: reka's `PopoverContent` wraps its children in `Presence`, which acts like `v-if` (`reka-ui/dist/Popover/PopoverContent.js:127`, `Presence/Presence.js:36`), so the fields unmount every time the popover closes (task 1.2).

### D6. `ColorPickerEyeDropper`

- **Markup.** It is an icon `Button` (ghost, icon size) with a pipette `IconPlaceholder`.
- **Support.** It uses `useEyeDropper()` and `useMounted()`, and renders `v-if="isMounted && isSupported"`. This hides it in Firefox and Safari, and keeps the server render and the first client render identical, so there is no hydration mismatch.
- **On click.** It awaits `open()` and passes `sRGBHex` to `setColor`. It ignores the `AbortError` thrown by Escape.
- **Disabled state.** It is disabled when the picker is disabled.

### D7. `ColorPickerCopy`

- **Markup.** It is an icon `Button` with copy and check `IconPlaceholder`s.
- **What it copies.** It calls `useClipboard({ copiedDuring: 2000, legacy: true })` on `formatColor(color, format ?? shownFormat)`.
- **Feedback.** It sets `data-copied` and announces "Color copied" in an sr-only `role="status"` region, as `ColorScaleCopy` does.

### D8. Default panel and tokens

`ColorPickerContent` with no children renders:

```
ColorPickerArea
<div class="flex items-center gap-2">
  ColorPickerEyeDropper
  ColorPickerSlider (flex-1)
  ColorPickerCopy
</div>
ColorPickerFields
```

If the eye dropper is unsupported, the row just loses its first button.

New tokens, defined in all 8 style files and derived from each style's input-group and dropdown tokens:

- `cn-color-picker-fields`
- `cn-color-picker-format-trigger`
- `cn-color-picker-format-item`
- `cn-color-picker-field`
- `cn-color-picker-eye-dropper`
- `cn-color-picker-copy`

new-york-v4 mirrors everything with literal classes and Lucide icons.

## Risks / Trade-offs

- [The OKLCH hue resets to 0 when chroma reaches 0, because `hexToOklch` gives grays hue 0 (`lib/oklch.ts:145`).] → `ColorPickerFields` keeps the last OKLCH hue locally and reuses it while C is 0. A test covers C to 0 and back.
- [Typed OKLCH is quantized through 8-bit hex, so the field can show a slightly different value after commit.] → Accepted, because the `v-model` is hex. Document it.
- [reka channel fields round to integers, while the menu previews show decimals.] → This matches reui's non-OKLCH fields. The previews come from `formatColor`, not from the fields.
- [A `ColorPickerFields` inside a popover is unmounted on close and could reset to HEX each time.] → Remember the last shown format in the root (D5). The remount behaviour is verified first (task 1.2).
- [The new icons may be missing from the icon map, and `registry:check:icons` would fail in CI.] → Run `registry:build:icons` and commit the map (task 1.3).
- [`color-picker` gains `dropdown-menu`, so installs get heavier.] → Accepted. It is the library's existing menu, and the crawler infers it.

## Open Questions

- Does a root-level `format` prop (hex by default, independent of the menu) earn its cost (four requirements, the echo guard, OKLCH drift)? This is deferred to its own change and only taken up if someone asks for it.
- Should `ColorPickerFields` offer a `formats` prop to limit the menu, as reui does ("one format hides the menu")? It is cheap. This design includes it, defaulting to all five formats.
