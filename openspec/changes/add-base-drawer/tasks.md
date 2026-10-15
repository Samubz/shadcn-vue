# Tasks

## 1. Setup

- [ ] 1.1 Run `pnpm i --frozen-lockfile` at the repo root. Verify that `apps/v4/node_modules/reka-ui/package.json` reports 2.10.x and that `DrawerViewport` and `injectDrawerRootContext` are exported (`grep` in `reka-ui/dist/index.d.ts`).
- [ ] 1.2 Record a baseline. Run `pnpm lint`, `pnpm --filter v4 typecheck` and `pnpm test` on the unchanged branch and note any failures that already exist, so later failures can be told apart from them.

## 2. Reka base drawer component (`apps/v4/registry/bases/reka/ui/drawer/`)

- [ ] 2.1 Add `utils.ts`, exporting a `createContext`-based `injectDrawerContext`/`provideDrawerContext` for `showSwipeHandle` (design D3). Verify with vue-tsc.
- [ ] 2.2 Rewrite `Drawer.vue` with `withDefaults` (`modal: true`, `swipeDirection: 'down'`, `showSwipeHandle: false`). It provides the local context, forwards the remaining props and emits to `DrawerRoot`, and passes the slot props through (design D4). Verify that `<Drawer>` with no props opens downward with an overlay.
- [ ] 2.3 Add `DrawerPortal.vue`, a thin wrapper over reka's `DrawerPortal` that forwards `TeleportProps`. Export it from `index.ts`.
- [ ] 2.4 Rewrite `DrawerOverlay.vue` with upstream's overlay classes, adapted per design D6: swipe-progress opacity, `--drawer-overlay-min-opacity`, the `data-snap-points` min-opacity variant, `data-[state=*]` fade animations, `min-h-dvh` and the iOS `absolute` fallback, using the `cn-drawer-overlay` placeholder.
- [ ] 2.5 Add `DrawerSwipeHandle.vue`: a `div` with `data-slot="drawer-swipe-handle"`, `aria-hidden="true"`, the `cn-drawer-swipe-handle` placeholder plus upstream's structural classes, and a `class` prop. Export it from `index.ts`.
- [ ] 2.6 Rewrite `DrawerContent.vue`:
  - Structure: Portal → Overlay (only when `modal === true`) → `DrawerViewport` (`data-slot="drawer-viewport"`, `:data-modal`) → reka `DrawerContent` as the popup (`data-slot="drawer-popup"`, `:data-swipe-axis`, `:data-snap-points`, `group/drawer-popup`, receives `$attrs` and `class`) → `DrawerSwipeHandle` when `showSwipeHandle` is set → `<div data-slot="drawer-content" class="cn-drawer-content-base ...">` wrapping the slot.
  - Port upstream's class groups, with the animation substitutions from design D6.
  - Verify the rendered `data-slot`/`data-swipe-axis` attributes in the browser for all four directions.
- [ ] 2.7 Update `DrawerHeader.vue` (`cn-drawer-header-base flex shrink-0 flex-col group-data-[swipe-axis=y]/drawer-popup:text-center`), `DrawerFooter.vue` (`cn-drawer-footer-base mt-auto flex shrink-0 flex-col`) and `DrawerDescription.vue` (add `text-balance`). Keep `DrawerTitle`, `DrawerTrigger` and `DrawerClose` as they are, but confirm their `data-slot` values.
- [ ] 2.8 Update `index.ts` to export all 11 parts in upstream order. Verify by running `pnpm --filter v4 typecheck` and `pnpm lint` on the folder (double quotes under `registry/**`).

## 3. Per-style CSS (`apps/v4/registry/styles/style-*.css`)

- [ ] 3.1 In the `/* MARK: Drawer */` section of each of the 8 style files, add `cn-drawer-popup`, `cn-drawer-swipe-handle`, `cn-drawer-header-base` and `cn-drawer-footer-base`, and update `cn-drawer-overlay`, `cn-drawer-title` and `cn-drawer-description`, using upstream's per-style values:
  - vega/nova: rounded-xl, edge border
  - lyra/sera: `rounded-none`
  - maia/mira/luma/rhea: floating, with `[--drawer-inset:--spacing(2)]` and a transparent bleed
- [ ] 3.2 Remove the obsolete `cn-drawer-content` and `cn-drawer-handle` rules after `grep -rn "cn-drawer-content\b\|cn-drawer-handle" apps/v4/registry` shows no remaining references, apart from the intentionally undefined `cn-drawer-content-base`.
- [ ] 3.3 Run `pnpm --filter v4 registry:build-only`. Verify that `apps/v4/styles/reka-*/ui/drawer/DrawerContent.vue` contains no `cn-drawer-*` tokens, apart from allowlisted ones, and that each style's popup classes match the values in 3.1.

## 4. new-york-v4 drawer (`apps/v4/registry/new-york-v4/ui/drawer/`)

- [ ] 4.1 Mirror tasks 2.1–2.8 with literal Tailwind classes instead of `cn-*` placeholders. Use upstream nova/vega values adapted to new-york-v4 tokens (`bg-background`, `rounded-*-lg`), and keep the file list and exports identical to the reka base. Verify with `pnpm --filter v4 typecheck`.
- [ ] 4.2 Check every in-repo consumer of the drawer against the new handle and class semantics, and fix any that break: `components/_internal/sink/DrawerDemo.vue`, `components/typeset/GetCodeDrawer.vue`, and any `group-data-*/drawer-content` selectors (`grep -rn "drawer-content" apps/v4/components apps/v4/pages`). Verify that each consumer still renders correctly in `pnpm dev`.

## 5. Base showcase example (`apps/v4/registry/bases/reka/examples/drawer/`)

- [ ] 5.1 Rewrite `DrawerExample.vue` and its child SFCs to cover upstream's showcase sections:
  - Demo (header, footer, edge-to-edge)
  - Swipe Handle (4 sides)
  - Position (4 sides)
  - Custom Width and Height
  - Scrollable Content
  - Snap Points (`['31rem', 1]`)
  - Nested
  - Non Modal (`@interact-outside.prevent`)
  Remove the superseded `DrawerWithSides.vue` and `DrawerScrollableContent.vue`, or fold them in. Verify each section at `/preview/reka/drawer-example` in at least the vega, maia and lyra styles.

## 6. Docs demos and page

- [ ] 6.1 Create or replace the docs demos in `apps/v4/components/demo/`. Each demo opens correctly in `pnpm dev`, and its code tab shows the SFC source.
  - `DrawerDemo.vue`: down + handle on mobile, right on desktop
  - `DrawerSides.vue`
  - `DrawerSwipeHandle.vue`
  - `DrawerNested.vue`
  - `DrawerNonModal.vue`
  - `DrawerSnapPoints.vue`
  - `DialogResponsive.vue`: keep it, and adjust it to the new drawer if needed
  - Remove `DrawerScrollableContent.vue` if nothing references it any more.
- [ ] 6.2 Rewrite `apps/v4/content/docs/components/drawer.md` with the section order from `specs/drawer-docs/spec.md`:
  - installation, plus the iOS Safari `body { position: relative; }` note
  - usage with `as-child`
  - the composition tree
  - Custom Sizes
  - the Styling tables (CSS variables and data attributes)
  - the feature sections, each embedding its demo
  - migration from the previous shadcn-vue drawer
  - the API link to reka-ui
  Verify that `/docs/components/drawer` renders every section with no console errors.

## 7. Registry regeneration and integration checks

- [ ] 7.1 Run `pnpm registry:build`. Verify that it succeeds, that a second run produces no further diff, and that `public/r/styles/{new-york-v4,reka-*}/drawer.json` list only `reka-ui`, `@vueuse/core` and `cn` as dependencies.
- [ ] 7.2 Run `pnpm lint`, `pnpm --filter v4 typecheck`, `pnpm test` and `pnpm --filter v4 registry:check:icons`. All must pass, or show only the baseline failures recorded in 1.2.
- [ ] 7.3 Run a Playwright smoke check against `pnpm dev` covering the docs demos and `/preview/reka/drawer-example`. Assert the `drawer` spec scenarios:
  - `data-slot` set and class on the popup
  - `data-swipe-axis` per direction
  - handle present only with `showSwipeHandle`
  - no overlay when `:modal="false"`
  - `data-snap-points` on popup and overlay
  - `data-nested-drawer-open` on the parent
  - close via Escape, outside press and swipe in all four directions with no visual jump
- [ ] 7.4 Commit the hand-written source and the generated registry output separately (design, Migration Plan), using conventional commit messages, for example `feat(drawer): ...` and `chore(registry): rebuild`.

## Workflow follow-up

- Resolve the design Open Question: whether to commit the Playwright smoke script.
- Follow up when reka-ui emits `data-expanded` / `data-nested-drawer-swiping` (design D7).
- Archive the change with `openspec archive add-base-drawer` once it is merged and reviewed.
