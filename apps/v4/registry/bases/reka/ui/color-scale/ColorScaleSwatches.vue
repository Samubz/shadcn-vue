<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { cn } from "cn"
import { ColorPickerSwatch } from "@/registry/bases/reka/ui/color-picker"
import { injectColorScaleContext } from "./utils"

const props = defineProps<{
  class?: HTMLAttributes["class"]
}>()

const { scale } = injectColorScaleContext("ColorScaleSwatches")
</script>

<template>
  <ol
    data-slot="color-scale-swatches"
    :class="cn('cn-color-scale-swatches grid w-full grid-cols-11', props.class)"
  >
    <li
      v-for="{ step, value } in scale"
      :key="step"
      data-slot="color-scale-swatch"
      class="cn-color-scale-swatch flex min-w-0 flex-col items-center"
    >
      <ColorPickerSwatch
        :color="value"
        :label="`${step}, ${value}`"
        class="h-10 w-full"
      />
      <span
        data-slot="color-scale-step"
        aria-hidden="true"
        class="cn-color-scale-step text-muted-foreground tabular-nums"
      >
        {{ step }}
      </span>
    </li>
  </ol>
</template>
