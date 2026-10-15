# Spec Delta

## Purpose

Defines the documentation and runnable examples shipped for the Drawer. Readers should be able to discover, install and customize every drawer capability from the docs site and the `/create` showcase.

## ADDED Requirements

### Requirement: Drawer docs page structure
The page at `/docs/components/drawer` SHALL contain, in order:
- a live demo
- Installation (CLI and manual)
- an iOS Safari note
- Usage
- Composition
- Custom Sizes
- Styling
- Position
- Swipe Handle
- Nested
- Non Modal
- Snap Points
- Responsive
- Migration
- API Reference (linking to reka-ui's Drawer docs)

#### Scenario: Visiting the docs page
- **WHEN** a reader opens `/docs/components/drawer`
- **THEN** every listed section heading is present and the page renders without console errors

### Requirement: Installation instructions
The Installation section SHALL show `npx shadcn-vue@latest add drawer` and a manual path. The manual path SHALL install `reka-ui`, then show the component source and a link to the registry folder. A note SHALL tell readers to add `body { position: relative; }` for iOS Safari overlay coverage.

#### Scenario: Manual install path
- **WHEN** a reader follows the manual installation steps
- **THEN** they install `reka-ui`, copy the drawer files shown on the page, and see the iOS Safari `body` CSS snippet

### Requirement: Styling reference
The Styling section SHALL document each CSS variable with its default and purpose: `--drawer-inset`, `--drawer-bleed-background`, `--drawer-overlay-min-opacity`. It SHALL list each data attribute with its values and when it is set: `data-swipe-direction`, `data-swipe-axis`, `data-snap-points`, `data-swiping`, `data-nested-drawer-open`.

#### Scenario: Looking up a CSS variable
- **WHEN** a reader looks for how to float the drawer from the edges
- **THEN** the Styling table lists `--drawer-inset` with default `0px` and its effect

### Requirement: Feature demos
The docs page SHALL embed one live, source-viewable demo for each feature:
- default responsive demo: a `down` drawer with a handle on mobile, a `right` drawer on desktop
- position/sides
- swipe handle
- nested (at least two levels)
- non-modal (cancelling outside interaction)
- snap points (`['31rem', 1]`)
- responsive Dialog/Drawer

#### Scenario: Previewing a feature
- **WHEN** a reader clicks the trigger in the "Snap Points" preview
- **THEN** a drawer opens at the `31rem` snap point and can be dragged to full height

#### Scenario: Viewing demo source
- **WHEN** a reader switches a preview to its code tab
- **THEN** the Vue SFC source of that demo is displayed, importing from `@/components/ui/*`-style registry paths

### Requirement: Migration guidance
The page SHALL include a migration section for users of the previous shadcn-vue drawer. It SHALL cover that the handle is now opt-in via `showSwipeHandle`, that `DrawerContent` classes target the popup, and that `group/drawer-content` selectors become `group/drawer-popup`. It SHALL also cover the changed header/footer spacing.

#### Scenario: Upgrading an existing drawer
- **WHEN** a reader with the previous drawer re-adds the component
- **THEN** the migration section tells them how to restore the bottom handle and update group selectors

### Requirement: Create showcase example
The base example `drawer-example`, used by `/create` and `/preview/reka/drawer-example`, SHALL showcase these sections:
- demo variants (header, footer, edge-to-edge)
- swipe handle on all four sides
- position on all four sides
- custom width and height
- scrollable content
- snap points
- nested
- non-modal

#### Scenario: Previewing the showcase
- **WHEN** a user opens `/preview/reka/drawer-example`
- **THEN** each listed section renders with working triggers, and each drawer opens in the current style
