<script setup lang="ts">
import { ref } from "vue"
import {
  ColorPicker,
  ColorPickerContent,
  ColorPickerInput,
} from "@/registry/bases/reka/ui/color-picker"
import { Field, FieldDescription, FieldLabel } from "@/registry/bases/reka/ui/field"

const color = ref("#7c3aed")
</script>

<template>
  <Field class="max-w-xs">
    <FieldLabel id="color-picker-brand-label" for="color-picker-brand">
      Brand color
    </FieldLabel>
    <ColorPicker id="color-picker-brand" v-model="color" aria-labelledby="color-picker-brand-label">
      <ColorPickerInput />
      <ColorPickerContent />
    </ColorPicker>
    <FieldDescription>
      Type a hex value or pick one from the swatch.
    </FieldDescription>
  </Field>
</template>
