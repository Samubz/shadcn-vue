# Design

## Context

See `proposal.md` for the motivation. The requirements are in `specs/drawer/spec.md` and `specs/drawer-docs/spec.md`.

Current state of the repo:

- **One base, `reka`.** The repo has a single base (`registry/bases.ts`). Its source lives in `registry/bases/reka/**` and uses `cn-*` placeholder classes. At build time `scripts/lib/build-styles.ts` expands those placeholders into eight styles (`styles/reka-{vega,nova,maia,lyra,mira,luma,rhea,sera}`), using the rules in `registry/styles/style-*.css`. `registry/new-york-v4/**` is a hand-written copy with literal classes, and the docs demos use it.
- **The drawer already runs on reka-ui's `Drawer*` primitives** (since `cc9f4ec`). We checked the reka-ui 2.10.1 package that the workspace catalog resolves to. It provides:
  - `DrawerRoot` props: `modal: boolean | 'trap-focus'`, `swipeDirection`, `snapPoints`, `snapPoint` (v-model), `defaultSnapPoint`, `snapToSequentialPoints`. Emits: `update:open`, `update:openComplete`, `update:snapPoint`.
  - `DrawerViewport` (`data-drawer-viewport`), `DrawerOverlay` (`forceRender`; skips nested drawers), `DrawerContent` (`initialFocus`, `finalFocus`, `forceMount`, and the DismissableLayer emits), `DrawerHandle`, `DrawerSwipeArea`, `DrawerProvider`, `DrawerIndent` and `DrawerIndentBackground`.
  - Popup attributes: `data-state`, `data-swipe-direction`, `data-swiping`, `data-nested-drawer-open`.
  - CSS variables, registered with `@property`: `--drawer-swipe-movement-x/y`, `--drawer-snap-point-offset`, `--drawer-height`, `--drawer-frontmost-height`, `--drawer-swipe-progress` (on the popup and the overlay), `--drawer-swipe-strength`, `--nested-drawers`.
  - `injectDrawerRootContext` is exported.
- **Gaps compared with Base UI 1.6** (what upstream targets):
  - No `Drawer.Content` inner part.
  - No `data-starting-style` / `data-ending-style`. Mount and unmount go through `Presence` plus `data-state`, so exit has to be a CSS **animation**, not a transition.
  - No `data-expanded` and no `data-nested-drawer-swiping`.
  - No `disablePointerDismissal` prop.
  - No `render` prop. Vue uses `as-child`.

## Goals / Non-Goals

**Goals:**

- Match upstream's base drawer in markup and in the class contract. Use the same `data-slot` names, `group/drawer-popup`, `data-swipe-axis`, `data-snap-points` and the `--drawer-*` theming variables, so the per-style `cn-drawer-*` rules port over almost verbatim.
- Keep the component modular in the shadcn way: one SFC per part, an `index.ts` barrel, `cn` and `reactiveOmit` patterns, and a thin wrapper around each primitive.
- Do the work once in `bases/reka`, mirror it in `new-york-v4`, and leave everything else to the generated output.

**Non-Goals:**

- Adding a second base (for example a Vue "base-ui" base). No Vue port of Base UI exists, and reka-ui already follows the Base UI drawer model.
- Exposing `DrawerSwipeArea`, `DrawerProvider`/`DrawerIndent` (background indent effect) or a `VirtualKeyboardProvider` as styled parts. Upstream doesn't ship them either. They stay available straight from reka-ui.
- Bumping reka-ui. 2.10.1 covers everything this change needs, and 2.11.0 only adds `DrawerVirtualKeyboardProvider`.
- An RTL demo. The upstream base docs don't reference one, and the repo has no `ui-rtl` styles.
- Touching `deprecated/**` or the legacy `default` / `new-york` registries.

## Decisions

### D1. Upgrade the drawer in place in the `reka` base, not as a separate variant

The existing `drawer` registry item gets rewritten instead of adding a `drawer-base` item next to it.

- **Why:** reka-ui's drawer *is* the Vue counterpart of Base UI's drawer. Upstream also replaced its base drawer in place, keeping the same item name and adding a migration note. Two drawer items would confuse the CLI (`add drawer`) and the docs.
- **Alternatives considered:**
  - (a) A new `bases/base` base. Rejected: there is no primitive library for it, and it would mean generalising the hard-coded `reka` in four build scripts.
  - (b) A separate `drawer-v2` item. Rejected because it breaks the shadcn naming parity.

### D2. Map Base UI parts to reka-ui parts

| Upstream (Base UI) | Vue port |
|---|---|
| `Drawer.Root` + React context | `DrawerRoot`, wrapped by `Drawer.vue` |
| `Drawer.Portal` | `DrawerPortal` (newly exported as `DrawerPortal.vue`) |
| `Drawer.Backdrop` | `DrawerOverlay` |
| `Drawer.Viewport` | `DrawerViewport`, with `data-slot="drawer-viewport"` and `:data-modal` |
| `Drawer.Popup` | reka `DrawerContent` (it is the dialog element), with `data-slot="drawer-popup"` |
| `Drawer.Content` | a plain `<div data-slot="drawer-content">` wrapper inside the popup |
| `DrawerSwipeHandle` (a div) | a new `DrawerSwipeHandle.vue`: a decorative `div` with `aria-hidden="true"` |
| `render={<Button/>}` | `as-child` |
| `onOpenChange`, `onOpenChangeComplete`, `onSnapPointChange` | `v-model:open`, `@update:open-complete`, `v-model:snap-point` |
| `disablePointerDismissal` | `@interact-outside.prevent` on `DrawerContent` (or `@pointer-down-outside.prevent`) |
| `initialFocus={false}` | `:initial-focus="false"` (supported by reka) |

`DrawerSwipeHandle` is a plain div rather than reka's `DrawerHandle`, matching upstream. The whole popup is the swipe surface, so the handle is only decorative. If reka's `DrawerHandle` turns out to carry needed behaviour, such as making the handle the drag target, we wrap it instead. That choice doesn't change the API.

### D3. Share root state with `DrawerContent` through reka's root context plus a small local context

- `DrawerContent` reads `modal`, `swipeDirection` and `snapPoints` from `injectDrawerRootContext()`, so the primitive stays the single source of truth.
- Only `showSwipeHandle`, which our wrapper adds, travels in a local context. It is created with reka-ui's `createContext` in `drawer/utils.ts` (or `context.ts`), the same pattern as `sidebar/utils.ts`.
- `swipeAxis` (`y` for up/down, `x` for left/right) and `hasSnapPoints` are `computed`s in `DrawerContent`.
- **Alternative considered:** duplicating the props in our own context, as upstream does in React. Rejected because it risks drifting from the primitive's real state.

### D4. Apply upstream's defaults in the wrapper

`Drawer.vue` uses `withDefaults` with `modal: true`, `swipeDirection: 'down'`, `showSwipeHandle: false`.

- It forwards everything else with `useForwardPropsEmits`, after omitting `showSwipeHandle`.
- It keeps the existing `v-slot="slotProps"` passthrough and keeps no `data-slot`, because the root has no element.
- Vue's boolean-prop casting matters here. An absent `modal` must stay `true`, so the default has to be explicit.

### D5. Render the overlay only when `modal === true`

reka's `DrawerOverlay` also renders for `'trap-focus'` because the value is truthy. Upstream renders the backdrop only for `modal === true`, so `DrawerContent` uses `v-if="rootContext.modal.value === true"`. The overlay gets `:data-snap-points` so that `--drawer-overlay-min-opacity` switches to `0.5`.

### D6. Port the class contract verbatim, but drive enter and exit with animations

The base, nested, bleed, sizing, stack, axis and direction class groups are copied from upstream onto the popup, overlay, handle and inner content in the same order.

The transition groups that rely on `data-starting-style` / `data-ending-style` can't port as-is, because reka uses `Presence`, and `Presence` only waits for CSS animations before unmounting. The replacement:

- **Popup enter/exit:**
  - `data-[state=open]:animate-in data-[state=closed]:animate-out` with `slide-in-from-*` / `slide-out-to-*` for each `data-[swipe-direction=*]`.
  - The offset includes `--drawer-inset`, for example `slide-out-to-bottom-[calc(100%+var(--drawer-inset,0px)+2px)]`.
  - The tw-animate exit keyframe defines only `to`, so it starts from the current transform. That makes a released swipe continue smoothly from where the finger left it.
- **Exit duration:** `data-[state=closed]:duration-[calc(var(--drawer-swipe-strength,1)*400ms)]`, matching upstream's strength-scaled release.
- **Resting transform:** keeps upstream's `transform-[translate3d(var(--translate-x),var(--translate-y),0)_scale(var(--stack-scale))]` and the `--translate-*` formulas. The `transition-[transform,height,opacity,filter]` stays for snapping and stacking, with `data-swiping:duration-0`.
- **Overlay:**
  - keeps upstream's `opacity-[max(var(--drawer-overlay-min-opacity,0),calc(1-var(--drawer-swipe-progress)))]` and `data-swiping:duration-0`
  - uses `data-[state=open]:animate-in fade-in-0` and `data-[state=closed]:animate-out fade-out-0` for mount and unmount, replacing `data-starting-style:opacity-0` / `data-ending-style:opacity-0`
- **Rejected alternative:** keeping transitions and forcing mount with `forceMount`. It would need manual unmount timing and loses `Presence`'s guarantees.

### D7. Drop the classes for attributes reka doesn't emit

- `data-expanded` is undocumented, and its classes are not added.
- `data-nested-drawer-swiping` variants are omitted. During a nested swipe the parent content stays hidden until release, which is a small visual difference.
- Both get a follow-up note so they can be restored once reka-ui emits these attributes.
- Neither appears in the `drawer` spec, so the spec only promises what we deliver.

### D8. Update styles, the two registries and the docs together

- **Styles:** the `/* MARK: Drawer */` section of each `registry/styles/style-*.css` gains `cn-drawer-popup`, `cn-drawer-swipe-handle`, `cn-drawer-header-base` and `cn-drawer-footer-base`, using the per-style values upstream uses for its base drawer.
  - The overlay, title and description rules are updated.
  - The old `cn-drawer-content` and `cn-drawer-handle` rules are removed once nothing references them.
  - `cn-drawer-content-base` is used in source but defined nowhere, as upstream does. `scripts/lib/expand-cn-classes.ts` already strips `cn-*` tokens that aren't allowlisted and have no definition, so the class is safe to keep as a style hook.
- **`new-york-v4`:** gets the same structure with literal classes, taken from upstream's nova and vega values (new-york-v4 uses `bg-background` and `rounded-*-lg`, as it does today).
- **Docs demos:** become SFCs under `components/demo/`:
  - `DrawerDemo`: a responsive down/right drawer using `useMediaQuery('(max-width: 767px)')` from `@vueuse/core`, consistent with `DialogResponsive`
  - `DrawerSides`
  - `DrawerSwipeHandle`
  - `DrawerNested`
  - `DrawerNonModal`
  - `DrawerSnapPoints`
  - the existing `DialogResponsive`
- **Delivery-time demo:** if a Field/RadioGroup-based delivery-time demo is reproduced, it reuses the repo's existing registry components and `vue-sonner`, as in other demos.

### D9. Validation

- The repo has no component test harness; `apps/v4` tests cover only build scripts.
- Static checks: `pnpm lint`, `pnpm --filter v4 typecheck` (vue-tsc), `pnpm registry:build` (with a clean diff in generated files after re-running), and `pnpm test`.
- Behaviour checks: a Playwright smoke script against `pnpm dev` that opens each docs demo and `/preview/reka/drawer-example` and asserts the `data-slot`, `data-swipe-axis`, overlay and handle rules from the spec. The script lives in the scratchpad unless the maintainers want it committed.

## Risks / Trade-offs

- **Exit animation fights the CSS-variable transform, so the drawer jumps on close.**
  → Mitigation: rely on tw-animate's `to`-only exit keyframes, and verify swipe-release, Escape and outside-press closes in all four directions during the smoke test. Fallback: set `--tw-exit-translate-*` from `--closed-transform` per direction.
- **`--drawer-swipe-progress` animation behaviour may differ from Base UI** (reka registers it as an `@property` number).
  → Mitigation: verify overlay fade while swiping. If it lags, add `data-swiping:transition-none` on the overlay.
- **Breaking visual change for re-installs** (handle opt-in, class target, group rename).
  → Mitigation: a migration section in the docs and a **BREAKING** marker in the proposal and changelog entry. Existing installs are unaffected until they re-add.
- **Generated churn:** `pnpm registry:build` rewrites many JSON/TS files.
  → Mitigation: keep the generated output in a separate commit from the hand-written source, so review stays focused.
- **Parity drift with reka-ui gaps** (`data-expanded`, `nested-drawer-swiping`, the `Drawer.Content` text-selection behaviour).
  → Mitigation: D7 documents the gaps. The inner wrapper adds `select-text`, and `data-swiping` disables selection on the popup.

## Migration Plan

1. Land the source changes (base, new-york-v4, styles, examples, docs) in one commit and the regenerated registry in a second.
2. Users upgrade with `npx shadcn-vue@latest add drawer --overwrite`, then follow the docs migration section. They add `show-swipe-handle` to restore the handle and replace `group-*/drawer-content` with `group-*/drawer-popup`.
3. Rollback: revert both commits. No data or dependency changes are involved.

## Open Questions

- Should the Playwright smoke script be committed (for example under `apps/v4/scripts/` or `e2e/`) or stay a local verification aid? This doesn't affect the component or the specs.
