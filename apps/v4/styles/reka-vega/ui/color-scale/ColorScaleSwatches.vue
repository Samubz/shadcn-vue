<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from 'cn'
import { ColorPickerSwatch } from '@/styles/reka-vega/ui/color-picker'
import { injectColorScaleContext } from './utils'

const props = defineProps<{
  class?: HTMLAttributes['class']
}>()

const { scale } = injectColorScaleContext('ColorScaleSwatches')
</script>

<template>
  <ol
    data-slot="color-scale-swatches"
    :class="cn('gap-1 grid w-full grid-cols-11', props.class)"
  >
    <li
      v-for="{ step, value } in scale"
      :key="step"
      data-slot="color-scale-swatch"
      class="gap-1.5 flex min-w-0 flex-col items-center"
    >
      <ColorPickerSwatch
        :color="value"
        :label="`${step}, ${value}`"
        class="h-10 w-full"
      />
      <span
        data-slot="color-scale-step"
        aria-hidden="true"
        class="text-[0.625rem] text-muted-foreground tabular-nums"
      >
        {{ step }}
      </span>
    </li>
  </ol>
</template>
