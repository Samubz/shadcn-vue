<script setup lang="ts">
import type { ColorSwatchProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import { reactiveOmit } from '@vueuse/core'
import { cn } from 'cn'
import { ColorSwatch, useForwardProps } from 'reka-ui'

const props = defineProps<ColorSwatchProps & { class?: HTMLAttributes['class'] }>()

const delegatedProps = reactiveOmit(props, 'class')

const forwarded = useForwardProps(delegatedProps)

/* The color over a transparency grid, so a translucent color reads as one. */
const background = 'linear-gradient(var(--reka-color-swatch-color), var(--reka-color-swatch-color)), repeating-conic-gradient(var(--color-muted) 0 25%, var(--color-background) 0 50%) 50% / 8px 8px'
</script>

<template>
  <ColorSwatch
    v-slot="slotProps"
    data-slot="color-picker-swatch"
    v-bind="forwarded"
    :class="cn(
      'rounded-[6px] relative inline-flex size-4 shrink-0 forced-color-adjust-none after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:inset-ring after:inset-ring-foreground/10',
      props.class,
    )"
    :style="{ background }"
  >
    <slot v-bind="slotProps" />
  </ColorSwatch>
</template>
