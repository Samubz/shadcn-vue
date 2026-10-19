<script setup lang="ts">
import { ref } from 'vue'
import {
  ColorPicker,
  ColorPickerContent,
  ColorPickerCopy,
  ColorPickerEyeDropper,
  ColorPickerInput,
} from '@/registry/new-york-v4/ui/color-picker'
import {
  Field,
  FieldDescription,
  FieldLabel,
} from '@/registry/new-york-v4/ui/field'

const color = ref('#f97316')
</script>

<template>
  <div class="w-full max-w-xs">
    <Field>
      <FieldLabel id="color-picker-tools-demo-label" for="color-picker-tools-demo">
        Highlight color
      </FieldLabel>
      <ColorPicker
        id="color-picker-tools-demo"
        v-model="color"
        aria-labelledby="color-picker-tools-demo-label"
        aria-describedby="color-picker-tools-demo-description"
      >
        <div class="flex items-center gap-1">
          <ColorPickerInput class="flex-1" />
          <ColorPickerEyeDropper />
          <ColorPickerCopy format="oklch" />
        </div>
        <ColorPickerContent />
      </ColorPicker>
      <FieldDescription id="color-picker-tools-demo-description">
        The eye dropper only appears in browsers with the EyeDropper API. Copy writes the color as OKLCH.
      </FieldDescription>
    </Field>
  </div>
</template>
