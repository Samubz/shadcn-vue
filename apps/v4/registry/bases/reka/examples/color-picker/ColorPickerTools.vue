<script setup lang="ts">
import { ref } from "vue"
import {
  ColorPicker,
  ColorPickerContent,
  ColorPickerCopy,
  ColorPickerEyeDropper,
  ColorPickerInput,
} from "@/registry/bases/reka/ui/color-picker"
import { Field, FieldDescription, FieldLabel } from "@/registry/bases/reka/ui/field"

const color = ref("#f97316")
</script>

<template>
  <Field class="max-w-xs">
    <FieldLabel id="color-picker-tools-label" for="color-picker-tools">
      Highlight color
    </FieldLabel>
    <ColorPicker
      id="color-picker-tools"
      v-model="color"
      aria-labelledby="color-picker-tools-label"
      aria-describedby="color-picker-tools-description"
    >
      <div class="flex items-center gap-1">
        <ColorPickerInput class="flex-1" />
        <ColorPickerEyeDropper />
        <ColorPickerCopy format="oklch" />
      </div>
      <ColorPickerContent />
    </ColorPicker>
    <FieldDescription id="color-picker-tools-description">
      The eye dropper only appears in browsers with the EyeDropper API. Copy writes the color as OKLCH.
    </FieldDescription>
  </Field>
</template>
