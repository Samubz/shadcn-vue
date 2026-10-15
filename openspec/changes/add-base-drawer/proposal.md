# Proposal

## Why

Upstream shadcn/ui rewrote its Drawer on top of the Base UI `Drawer` primitive
(https://ui.shadcn.com/docs/components/base/drawer). The new version adds a
viewport/popup structure, an optional swipe handle on every side, snap points,
stacked nested drawers, non-modal mode and CSS-variable-driven sizing. Our Vue
Drawer already runs on reka-ui's `Drawer` primitive, which uses the same model
as Base UI: `swipeDirection`, `snapPoints`, `modal: boolean | 'trap-focus'`,
`DrawerViewport`, nested-drawer tracking and the `--drawer-*` CSS variables.
Our styled component, styles, examples and docs, however, are still the first
reka migration (`cc9f4ec`). Users therefore cannot reach those features
through shadcn-vue, and the port drifts further from upstream with each
upstream release.

## What Changes

- Rewrite the styled Drawer (`registry/bases/reka/ui/drawer/*` and `registry/new-york-v4/ui/drawer/*`) to mirror upstream's base drawer:
  - `DrawerContent` composes Portal → Overlay (only when modal) → Viewport → Popup → optional swipe handle → inner content wrapper.
  - The Popup receives `class` and attributes.
  - It exposes `data-swipe-axis` and `data-snap-points` hooks, plus the `group/drawer-popup` group.
- Add a `showSwipeHandle` prop on `Drawer`. Defaults stay `modal = true` and `swipeDirection = "down"`.
- Add the new exports `DrawerPortal` and `DrawerSwipeHandle`.
- Make snap points, nested stacking, bleed, `--drawer-inset`, `--drawer-bleed-background` and `--drawer-overlay-min-opacity` work out of the box.
- Port upstream's `cn-drawer-popup`, `cn-drawer-swipe-handle`, `cn-drawer-header-base` and `cn-drawer-footer-base` rules, plus the updated overlay, title and description rules, into all 8 `registry/styles/style-*.css` files (vega, nova, maia, lyra, mira, luma, rhea, sera).
- Replace and extend the docs demos and base examples to match upstream:
  - demo (responsive side/handle)
  - sides
  - swipe handle
  - nested
  - non-modal
  - snap points
  - responsive dialog
  - the `/create` showcase (`DrawerExample`) with position, custom size, scrollable, snap point, nested and non-modal sections
- Update `content/docs/components/drawer.md` with sections for:
  - Composition
  - Custom Sizes
  - Styling (CSS variables and data attributes)
  - Position
  - Swipe Handle
  - Nested
  - Non Modal
  - Snap Points
  - Responsive
  - an iOS Safari `body { position: relative }` note
  - a migration note
- Regenerate the registry (`pnpm registry:build`) so `public/r/**`, the `_registry.ts` files and `styles/reka-*/**` stay consistent.
- **BREAKING** (visual/API, for users who re-add the component):
  - The built-in bottom handle is no longer always rendered. It is opt-in via `showSwipeHandle`.
  - `class` on `DrawerContent` now targets the popup element (`data-slot="drawer-popup"`). Children render inside an inner `data-slot="drawer-content"` wrapper.
  - The group name changes from `group/drawer-content` to `group/drawer-popup`.
  - Header and footer padding move to `-base` variants (`pb-0` / `pt-0`), and the header is centered on the y axis.

## Capabilities

### New Capabilities

- `drawer`: The styled Drawer component's public contract. Covers its parts and exports, props and defaults, swipe directions, swipe handle, modality, snap points, nested stacking, sizing, theming hooks (CSS variables, data attributes, data-slots), and per-style rendering across the registry styles.
- `drawer-docs`: Documentation and runnable examples for the Drawer. Covers the docs page sections, the demos it embeds, and the `/create` showcase example.

### Modified Capabilities

<!-- None: openspec/specs/ is empty; no existing capability is affected. -->

## Impact

- **Registry source:**
  - `apps/v4/registry/bases/reka/ui/drawer/*`
  - `apps/v4/registry/new-york-v4/ui/drawer/*`
  - `apps/v4/registry/styles/style-*.css`, Drawer section
- **Examples and docs:**
  - `apps/v4/registry/bases/reka/examples/drawer/*`
  - `apps/v4/components/demo/Drawer*.vue`, plus `DialogResponsive.vue` if adjusted
  - `apps/v4/content/docs/components/drawer.md`
- **Other consumers of the drawer:** `components/_internal/sink/DrawerDemo.vue` and `components/typeset/GetCodeDrawer.vue` must be checked against the new handle and class semantics.
- **Generated output:** the `_registry.ts` files, `registry/__index__.ts`, `registry/bases/__index__.ts`, `public/r/styles/*/drawer.json`, `styles/reka-*/ui/drawer/*`.
- **Dependencies:** none new. reka-ui `^2.10.1` (catalog) already ships every primitive used: `DrawerViewport`, `snapPoints`, `modal: 'trap-focus'`, and the nested-drawer CSS variables. `@vueuse/core` and `cn` are unchanged.
- **Downstream users:** anyone who re-adds `drawer` through the CLI gets the new markup. Existing installs are untouched.
