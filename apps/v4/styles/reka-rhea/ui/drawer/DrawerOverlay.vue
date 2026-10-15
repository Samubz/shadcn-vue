<script lang="ts" setup>
import type { DrawerOverlayProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import { reactiveOmit } from '@vueuse/core'
import { cn } from 'cn'
import { DrawerOverlay } from 'reka-ui'

const props = defineProps<DrawerOverlayProps & { class?: HTMLAttributes['class'] }>()

const delegatedProps = reactiveOmit(props, 'class')
</script>

<template>
  <DrawerOverlay
    data-slot="drawer-overlay"
    v-bind="delegatedProps"
    :class="cn(
      'bg-black/30 supports-backdrop-filter:backdrop-blur-sm fixed inset-0 z-50 min-h-dvh opacity-[max(var(--drawer-overlay-min-opacity,0),calc(1-var(--drawer-swipe-progress,0)))] transition-opacity duration-450 ease-[cubic-bezier(0.32,0.72,0,1)] select-none data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:pointer-events-none data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:duration-[calc(var(--drawer-swipe-strength,1)*400ms)] data-snap-points:[--drawer-overlay-min-opacity:0.5] data-swiping:duration-0 supports-[-webkit-touch-callout:none]:absolute',
      props.class,
    )"
  />
</template>
