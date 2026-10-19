<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { cn } from "cn"
import { ColorAreaArea, ColorAreaRoot, ColorAreaThumb } from "reka-ui"
import { injectColorPickerContext } from "./utils"

const props = defineProps<{
  class?: HTMLAttributes["class"]
}>()

const { color, setColor, disabled } = injectColorPickerContext("ColorPickerArea")
</script>

<template>
  <ColorAreaRoot
    v-slot="{ style }"
    data-slot="color-picker-area"
    color-space="hsb"
    x-channel="saturation"
    y-channel="brightness"
    :model-value="color"
    :disabled="disabled"
    :class="cn(
      'relative h-40 w-full shrink-0 rounded-sm select-none data-disabled:pointer-events-none data-disabled:opacity-50',
      props.class,
    )"
    @update:color="setColor"
  >
    <ColorAreaArea
      :style="style"
      class="relative size-full touch-none rounded-[inherit] outline-none forced-color-adjust-none after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:inset-ring after:inset-ring-foreground/10"
    >
      <ColorAreaThumb
        data-slot="color-picker-area-thumb"
        class="ring-ring/50 pointer-events-none block size-4 rounded-full border-2 border-white shadow-[0_0_0_1px_rgb(0_0_0/0.12),0_1px_3px_rgb(0_0_0/0.3)] transition-[box-shadow] outline-none focus-visible:ring-4 forced-colors:outline-2 forced-colors:outline-solid"
      />
    </ColorAreaArea>
  </ColorAreaRoot>
</template>
