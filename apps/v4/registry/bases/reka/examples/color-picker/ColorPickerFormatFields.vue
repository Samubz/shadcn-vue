<script setup lang="ts">
import type { ColorPickerFormat } from "@/registry/bases/reka/ui/color-picker"
import { ref } from "vue"
import {
  ColorPicker,
  ColorPickerArea,
  ColorPickerFields,
  ColorPickerSlider,
} from "@/registry/bases/reka/ui/color-picker"

const color = ref("#0ea5e9")
const format = ref<ColorPickerFormat>("oklch")
</script>

<template>
  <div class="flex w-full max-w-xs flex-col gap-3">
    <ColorPicker v-model="color">
      <ColorPickerArea />
      <ColorPickerSlider />
      <ColorPickerFields v-model:format="format" />
    </ColorPicker>
    <p class="text-xs text-muted-foreground tabular-nums">
      Shown as {{ format.toUpperCase() }}, emitted as {{ color }}
    </p>
  </div>
</template>
