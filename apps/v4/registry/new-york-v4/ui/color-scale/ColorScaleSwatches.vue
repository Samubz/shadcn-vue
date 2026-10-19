<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { cn } from "cn"
import { ColorPickerSwatch } from "@/registry/new-york-v4/ui/color-picker"
import { injectColorScaleContext } from "./utils"

const props = defineProps<{
  class?: HTMLAttributes["class"]
}>()

const { scale } = injectColorScaleContext("ColorScaleSwatches")
</script>

<template>
  <ol
    data-slot="color-scale-swatches"
    :class="cn('grid w-full grid-cols-11 gap-1', props.class)"
  >
    <li
      v-for="{ step, value } in scale"
      :key="step"
      data-slot="color-scale-swatch"
      class="flex min-w-0 flex-col items-center gap-1.5"
    >
      <ColorPickerSwatch
        :color="value"
        :label="`${step}, ${value}`"
        class="h-10 w-full"
      />
      <span
        data-slot="color-scale-step"
        aria-hidden="true"
        class="text-muted-foreground text-[0.625rem] tabular-nums"
      >
        {{ step }}
      </span>
    </li>
  </ol>
</template>
