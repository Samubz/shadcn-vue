---
title: Drawer
description: A panel that slides in from any edge of the screen and can be swiped to dismiss.
component: true
links:
  doc: https://reka-ui.com/docs/components/drawer
  api: https://reka-ui.com/docs/components/drawer#api-reference
---

::component-preview
---
name: DrawerDemo
description: A drawer that opens from the bottom on mobile and from the right on desktop.
---
::

::callout{class="mt-6"}
  The drawer has been rebuilt to match the latest shadcn/ui drawer. It adds swipe handles, snap points, nested drawers and non-modal mode. If you installed the previous version, see the [migration guide](#migrating-from-the-previous-drawer).
::

## Installation

:::::code-tabs

:::tabs-list

  ::tabs-trigger{value="cli"}
  CLI
  ::

  ::tabs-trigger{value="manual"}
  Manual
  ::

:::

::tabs-content{value="cli"}

```bash
npx shadcn-vue@latest add drawer
```

::

::::tabs-content{value="manual"}
  :::steps
    ::step
    Install the following dependencies:
    ::

    ```bash
    npm install reka-ui
    ```

    ::step
    Copy and paste the [GitHub source code](https://github.com/unovue/shadcn-vue/tree/dev/apps/v4/registry/new-york-v4/ui/drawer) into your project.
    ::

    ::step
    Update the import paths to match your project setup.
    ::
  :::
::::

:::::

On iOS Safari, the drawer overlay is absolutely positioned. It needs a positioned `body` to cover the viewport after the page has been scrolled, so add the following to your global styles:

```css
body {
  position: relative;
}
```

## Usage

```vue showLineNumbers
<script setup lang="ts">
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
</script>

<template>
  <Drawer>
    <DrawerTrigger as-child>
      <Button variant="outline">
        Open
      </Button>
    </DrawerTrigger>
    <DrawerContent>
      <DrawerHeader>
        <DrawerTitle>Are you absolutely sure?</DrawerTitle>
        <DrawerDescription>This action cannot be undone.</DrawerDescription>
      </DrawerHeader>
      <div class="p-4">
        <!-- Content here -->
      </div>
      <DrawerFooter>
        <Button>Submit</Button>
        <DrawerClose as-child>
          <Button variant="outline">
            Cancel
          </Button>
        </DrawerClose>
      </DrawerFooter>
    </DrawerContent>
  </Drawer>
</template>
```

## Composition

Build a `Drawer` from these parts:

```text
Drawer
├── DrawerTrigger
└── DrawerContent
    ├── DrawerHeader
    │   ├── DrawerTitle
    │   └── DrawerDescription
    └── DrawerFooter
```

`DrawerContent` composes the portal, overlay, viewport and popup from Reka UI. `DrawerPortal`, `DrawerOverlay` and `DrawerSwipeHandle` are also exported for lower-level control.

## Custom Sizes

A vertical drawer sizes itself to its content, up to `calc(100dvh - 6rem)` by default. A side drawer is `75%` of the viewport width, or `24rem` on larger screens.

To change the height of a vertical drawer, use the `h-*` and `max-h-*` utilities on `DrawerContent`.

```vue
<DrawerContent class="h-[50vh]">
```

To change the width of a side drawer, use the `w-*` and `max-w-*` utilities on `DrawerContent`.

```vue
<DrawerContent class="w-96">
```

When the same component renders in several directions, scope an override to one axis with the `data-[swipe-axis=*]` variants.

```vue
<DrawerContent class="data-[swipe-axis=y]:max-h-[50vh] data-[swipe-axis=x]:w-96">
```

To make part of the drawer scrollable, make the scroll container a flex item. Avoid `h-full`, because it doesn't resolve inside a content-sized drawer.

```vue
<DrawerContent>
  <DrawerHeader>...</DrawerHeader>
  <div class="flex-1 overflow-y-auto p-4">
    <!-- Scrollable content -->
  </div>
  <DrawerFooter>...</DrawerFooter>
</DrawerContent>
```

## Styling

The drawer exposes CSS variables for style-level customization. Set the sizing variables on `DrawerContent`, and set the overlay variable on `[data-slot=drawer-overlay]` in your CSS.

| Variable                       | Default                | Description                                                             |
| ------------------------------ | ---------------------- | ----------------------------------------------------------------------- |
| `--drawer-inset`               | `0px`                  | Floats the drawer away from the viewport edges.                         |
| `--drawer-bleed-background`    | `var(--color-popover)` | Fills the gap behind the drawer when a swipe overshoots.                |
| `--drawer-overlay-min-opacity` | `0`                    | Minimum overlay opacity. Defaults to `0.5` when snap points are active. |

The drawer also sets data attributes. Target them with variants such as `data-[swipe-direction=down]:` on `DrawerContent`, or `group-data-[swipe-axis=y]/drawer-popup:` on its descendants.

| Attribute                 | Values                        | Set when                        |
| ------------------------- | ----------------------------- | ------------------------------- |
| `data-swipe-direction`    | `up`, `right`, `down`, `left` | Always.                         |
| `data-swipe-axis`         | `x`, `y`                      | Always.                         |
| `data-snap-points`        | Present                       | The drawer has snap points.     |
| `data-swiping`            | Present                       | A swipe is in progress.         |
| `data-nested-drawer-open` | Present                       | A nested drawer is open on top. |

## Position

Use the `swipe-direction` prop to set the edge the drawer is anchored to. The drawer is dismissed by swiping toward that edge.

The available options are `up`, `right`, `down` and `left`.

::component-preview
---
name: DrawerSides
---
::

## Swipe Handle

Set `show-swipe-handle` on `Drawer` to render a swipe handle.

::component-preview
---
name: DrawerSwipeHandleDemo
---
::

## Nested

Open drawers from inside another drawer. Parent drawers stay mounted and stack behind the frontmost drawer.

::component-preview
---
name: DrawerNested
---
::

## Non Modal

Set `:modal="false"` to let users interact with the rest of the page while the drawer is open. To keep the drawer open on outside presses, cancel the `interact-outside` event on `DrawerContent` with `@interact-outside.prevent`. Use `modal="trap-focus"` to keep focus inside the drawer while leaving scrolling and pointer interaction unrestricted.

::component-preview
---
name: DrawerNonModal
---
::

## Snap Points

Use `snap-points` to snap a drawer to preset heights:

- Numbers between `0` and `1` are fractions of the viewport.
- Numbers greater than `1` are pixel values.
- Strings can use `px` or `rem` units.

Snap points apply to vertical drawers.

To track the active snap point, use `v-model:snap-point`.

::component-preview
---
name: DrawerSnapPoints
---
::

## Responsive

Combine the `Dialog` and `Drawer` components to build a responsive dialog. It renders a `Dialog` on desktop and a `Drawer` on mobile.

::component-preview
---
name: DrawerDialog
---
::

## Migrating from the previous drawer

If you installed the previous version of the drawer, re-add the component with `npx shadcn-vue@latest add drawer --overwrite`, then update your usage.

:::steps

::step
The swipe handle is now opt-in.
::

The previous drawer always rendered a handle on bottom drawers. Set `show-swipe-handle` to keep it.

```vue
<!-- Before -->
<Drawer>

<!-- After -->
<Drawer show-swipe-handle>
```

::step
Classes on `DrawerContent` now target the popup.
::

`DrawerContent` renders a viewport and a popup (`data-slot="drawer-popup"`). Classes and attributes go to the popup, and children render inside an inner `data-slot="drawer-content"` wrapper. Make scrollable regions flex items, as shown in [Custom Sizes](#custom-sizes).

::step
Rename the group selectors.
::

```vue
<!-- Before -->
<div class="group-data-[swipe-direction=down]/drawer-content:text-center">

<!-- After -->
<div class="group-data-[swipe-axis=y]/drawer-popup:text-center">
```

::step
Review header and footer spacing.
::

`DrawerHeader` no longer has bottom padding, and `DrawerFooter` no longer has top padding. Put a padded container (for example `p-4`) between them for the drawer body.

:::

## API Reference

See the [Reka UI documentation](https://reka-ui.com/docs/components/drawer) for the full API reference.
