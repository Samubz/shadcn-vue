# Spec Delta

## Purpose

Defines the public contract of the styled shadcn-vue Drawer. It is a panel that slides in from any edge of the viewport and can be dismissed by swiping. This contract keeps the Vue port in parity with upstream shadcn/ui's base drawer.

## ADDED Requirements

### Requirement: Drawer exports
The drawer module SHALL export `Drawer`, `DrawerTrigger`, `DrawerPortal`, `DrawerOverlay`, `DrawerSwipeHandle`, `DrawerContent`, `DrawerHeader`, `DrawerFooter`, `DrawerTitle`, `DrawerDescription` and `DrawerClose` from its `index.ts`. This applies in every registry location that ships the drawer.

#### Scenario: Importing all parts
- **WHEN** a consumer imports each listed part from `@/components/ui/drawer`
- **THEN** every import resolves to a Vue component and type-checks without errors

### Requirement: Root defaults and forwarding
`Drawer` SHALL default to `modal = true` and `swipeDirection = "down"`. It SHALL forward every other primitive root prop and emit unchanged, including `open`, `defaultOpen`, `snapPoints`, `snapPoint`, `snapToSequentialPoints` and the `update:*` events. It SHALL expose the root slot props.

#### Scenario: Uncontrolled default drawer
- **WHEN** a `Drawer` with no props is opened via its `DrawerTrigger`
- **THEN** the popup enters from the bottom edge with `data-swipe-direction="down"` and the overlay is shown

#### Scenario: Controlled open state
- **WHEN** a consumer binds `v-model:open` and sets it to `false` from code
- **THEN** the drawer closes and the bound value stays `false`

### Requirement: Swipe directions
`Drawer` SHALL accept `swipeDirection` values `up`, `right`, `down` and `left`. The popup SHALL anchor to the matching edge (`up`→top, `right`→right, `down`→bottom, `left`→left). Swiping toward that edge SHALL dismiss the drawer.

#### Scenario: Left drawer
- **WHEN** a drawer with `swipeDirection="left"` is opened
- **THEN** the popup is anchored to the left edge, spans the full viewport height, and has `data-swipe-direction="left"`

#### Scenario: Swipe to dismiss
- **WHEN** the user drags an open `down` drawer downward past the dismiss threshold and releases
- **THEN** the drawer closes and `update:open` is emitted with `false`

### Requirement: Swipe axis attribute
The popup element SHALL carry `data-swipe-axis="y"` for `up`/`down` and `data-swipe-axis="x"` for `left`/`right`. It SHALL define the Tailwind group `group/drawer-popup` so descendants can style per axis or direction.

#### Scenario: Axis-scoped descendant styles
- **WHEN** a descendant uses `group-data-[swipe-axis=x]/drawer-popup:size-full` inside a `right` drawer
- **THEN** that class takes effect, and it does not take effect inside a `down` drawer

### Requirement: Optional swipe handle
`Drawer` SHALL accept a `showSwipeHandle` boolean prop, default `false`. When true, `DrawerContent` SHALL render a decorative handle (`data-slot="drawer-swipe-handle"`, `aria-hidden="true"`) on the edge opposite the anchored edge, oriented to the swipe axis. When false, no handle SHALL be rendered.

#### Scenario: Handle on a bottom drawer
- **WHEN** a `down` drawer with `showSwipeHandle` is opened
- **THEN** a horizontal handle bar is rendered above the content and hidden from assistive technology

#### Scenario: Handle on a left drawer
- **WHEN** a `left` drawer with `showSwipeHandle` is opened
- **THEN** a vertical handle bar is rendered after the content, on the drawer's right side

#### Scenario: No handle by default
- **WHEN** a drawer without `showSwipeHandle` is opened in any direction
- **THEN** no element with `data-slot="drawer-swipe-handle"` exists in the DOM

### Requirement: Content structure and slots
`DrawerContent` SHALL portal its output and render the overlay only when modal. It SHALL render a viewport (`data-slot="drawer-viewport"`), then a popup (`data-slot="drawer-popup"`) that receives `class` and attrs. The default slot SHALL render inside an inner `data-slot="drawer-content"` wrapper.

#### Scenario: Class targets the popup
- **WHEN** a consumer renders `<DrawerContent class="w-96">`
- **THEN** the `w-96` class is applied to the `drawer-popup` element, not to the viewport or the inner content wrapper

#### Scenario: Data slots present
- **WHEN** a drawer is open
- **THEN** elements with `data-slot` values `drawer-overlay`, `drawer-viewport`, `drawer-popup` and `drawer-content` are present, and header, footer, title, description, trigger and close parts carry `drawer-header`, `drawer-footer`, `drawer-title`, `drawer-description`, `drawer-trigger` and `drawer-close`

### Requirement: Modality
`Drawer` SHALL support `modal` values `true`, `false` and `'trap-focus'`. With `true`, the overlay SHALL render and outside interaction SHALL be blocked. With `false` or `'trap-focus'`, no overlay SHALL render and the page behind SHALL stay interactive.

#### Scenario: Non-modal drawer
- **WHEN** a drawer with `:modal="false"` is open
- **THEN** no `drawer-overlay` element is rendered and elements behind the drawer can be clicked

#### Scenario: Preventing outside dismissal
- **WHEN** a non-modal drawer's `DrawerContent` cancels the `interactOutside` event (e.g. `@interact-outside.prevent`)
- **THEN** clicking outside the drawer does not close it

### Requirement: Snap points
When `snapPoints` is non-empty on a vertical drawer, the drawer SHALL rest at the active snap point and snap between points on release. The popup and overlay SHALL carry `data-snap-points`, and the overlay SHALL keep at least `0.5` opacity by default.

#### Scenario: Snap between a peek and full height
- **WHEN** a drawer with `:snap-points="['31rem', 1]"` is opened and the user drags it upward past the midpoint
- **THEN** it settles at full height and `update:snapPoint` is emitted with `1`

#### Scenario: Overlay minimum opacity
- **WHEN** a snap-point drawer is open at its smallest snap point
- **THEN** the overlay opacity is not lower than the `--drawer-overlay-min-opacity` value (default `0.5`)

### Requirement: Nested drawers
A `Drawer` opened from inside another drawer's content SHALL stack in front of its parent. Each parent SHALL remain mounted, be scaled down and offset ("peek") behind the frontmost drawer, and hide its own content and handle while a child is open.

#### Scenario: Two-level stack
- **WHEN** a nested drawer is opened from a parent drawer in the same direction
- **THEN** the parent popup gets `data-nested-drawer-open`, renders scaled behind the child with its content faded out, and is restored when the child closes

### Requirement: Default sizing
A vertical drawer SHALL size to its content, up to `calc(100dvh - 6rem)`. A side drawer SHALL be `75%` of the viewport width, or `24rem` from the `sm` breakpoint up. Consumers SHALL be able to override both with utilities on `DrawerContent`.

#### Scenario: Content-sized bottom drawer
- **WHEN** a `down` drawer contains content shorter than the viewport
- **THEN** the popup height equals its content height

#### Scenario: Custom height override
- **WHEN** a consumer sets `class="data-[swipe-direction=up]:h-[50vh]"` on an `up` drawer's content
- **THEN** the popup is half the viewport height

#### Scenario: Scrollable region
- **WHEN** a drawer contains a `flex-1 overflow-y-auto` region with content taller than the max height
- **THEN** that region scrolls while the header and footer stay visible

### Requirement: Theming CSS variables
The drawer SHALL honor `--drawer-inset` (default `0px`, floats the popup from the edges), `--drawer-bleed-background` (default the popover color, fills the overshoot gap) and `--drawer-overlay-min-opacity` (default `0`, or `0.5` with snap points).

#### Scenario: Floating inset drawer
- **WHEN** a consumer sets `[--drawer-inset:1rem]` on `DrawerContent`
- **THEN** the popup is rendered 1rem away from the viewport edges

### Requirement: Swipe-driven overlay and transitions
The overlay opacity SHALL track swipe progress. Enter and exit SHALL animate the popup from and to its anchored edge. Animations SHALL be disabled while a swipe is in progress, and a released swipe SHALL finish with a duration scaled by swipe strength.

#### Scenario: Overlay fades while swiping
- **WHEN** the user drags an open modal drawer halfway toward dismissal
- **THEN** the overlay opacity decreases proportionally, without a transition lag

### Requirement: Header, footer, title and description
`DrawerHeader` and `DrawerFooter` SHALL render non-shrinking flex columns. The header SHALL be text-centered on the y axis, and the footer SHALL be pushed to the bottom (`mt-auto`). `DrawerTitle` and `DrawerDescription` SHALL be wired to the popup's accessible name and description.

#### Scenario: Accessible labelling
- **WHEN** a drawer with a `DrawerTitle` and a `DrawerDescription` is open
- **THEN** the popup has `role="dialog"` with `aria-labelledby` and `aria-describedby` pointing at them

### Requirement: Polymorphic trigger and close
`DrawerTrigger` and `DrawerClose` SHALL support `as-child` so a consumer component (e.g. `Button`) renders as the interactive element.

#### Scenario: Button as trigger
- **WHEN** `<DrawerTrigger as-child><Button>Open</Button></DrawerTrigger>` is clicked
- **THEN** the drawer opens and only one `<button>` element is rendered for the trigger

### Requirement: Per-style rendering
The drawer SHALL render correctly in every registry style: new-york-v4 and reka vega, nova, maia, lyra, mira, luma, rhea and sera. Each style SHALL apply the visual treatment upstream defines for its base drawer (corner radius, borders, inset/floating card, handle size, typography).

#### Scenario: Floating style
- **WHEN** the drawer is installed in the `reka-maia` style and opened
- **THEN** the popup floats with an inset from the viewport edges and fully rounded corners, and has no bleed background

#### Scenario: Square style
- **WHEN** the drawer is installed in the `reka-lyra` style and opened
- **THEN** the popup has square corners and a border on its inner edge only

#### Scenario: Registry install
- **WHEN** a user runs `npx shadcn-vue@latest add drawer` against any supported style
- **THEN** all drawer files are installed with resolved classes (no `cn-*` placeholders) and only `reka-ui`, `@vueuse/core` and `cn` as dependencies
