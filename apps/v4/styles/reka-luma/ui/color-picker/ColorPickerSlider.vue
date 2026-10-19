<script setup lang="ts">
import type { ColorChannel, ColorSliderRootProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import { reactiveOmit } from '@vueuse/core'
import { cn } from 'cn'
import { ColorSliderRoot, ColorSliderThumb, ColorSliderTrack, useForwardProps } from 'reka-ui'
import { injectColorPickerContext } from './utils'

const props = withDefaults(
  defineProps<Omit<ColorSliderRootProps, 'modelValue' | 'defaultValue' | 'colorSpace' | 'channel'> & {
    /** The HSB channel this slider changes. */
    channel?: ColorChannel
    class?: HTMLAttributes['class']
  }>(),
  {
    channel: 'hue',
  },
)

const delegatedProps = reactiveOmit(props, 'class', 'channel', 'disabled')

const forwarded = useForwardProps(delegatedProps)

const { color, setColor, disabled: pickerDisabled } = injectColorPickerContext('ColorPickerSlider')
</script>

<template>
  <ColorSliderRoot
    data-slot="color-picker-slider"
    v-bind="forwarded"
    :channel="props.channel"
    color-space="hsb"
    :model-value="color"
    :disabled="props.disabled || pickerDisabled"
    :class="cn(
      'rounded-full relative flex w-full touch-none items-center select-none data-disabled:pointer-events-none data-disabled:opacity-50 data-[orientation=vertical]:h-40 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col',
      props.class,
    )"
    @update:color="setColor"
  >
    <ColorSliderTrack
      data-slot="color-picker-slider-track"
      class="rounded-full relative grow forced-color-adjust-none after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:inset-ring after:inset-ring-foreground/10 data-[orientation=horizontal]:h-3 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-3"
    />
    <ColorSliderThumb
      data-slot="color-picker-slider-thumb"
      class="ring-ring/30 rounded-full transition-[box-shadow] hover:ring-4 focus-visible:ring-4 block size-4 shrink-0 border-2 border-white shadow-[0_0_0_1px_rgb(0_0_0/0.12),0_1px_3px_rgb(0_0_0/0.3)] outline-none select-none forced-colors:outline-2 forced-colors:outline-solid"
    />
  </ColorSliderRoot>
</template>
