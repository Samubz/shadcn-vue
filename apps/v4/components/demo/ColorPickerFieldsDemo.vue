<script setup lang="ts">
import type { ColorPickerFormat } from '@/registry/new-york-v4/ui/color-picker'
import { ref } from 'vue'
import {
  ColorPicker,
  ColorPickerArea,
  ColorPickerFields,
  ColorPickerSlider,
} from '@/registry/new-york-v4/ui/color-picker'
import {
  Field,
  FieldDescription,
  FieldLabel,
} from '@/registry/new-york-v4/ui/field'

const color = ref('#0ea5e9')
const format = ref<ColorPickerFormat>('oklch')
</script>

<template>
  <div class="w-full max-w-xs">
    <Field>
      <FieldLabel id="color-picker-fields-demo-label" for="color-picker-fields-demo">
        Surface color
      </FieldLabel>
      <ColorPicker
        id="color-picker-fields-demo"
        v-model="color"
        aria-labelledby="color-picker-fields-demo-label"
        aria-describedby="color-picker-fields-demo-description"
      >
        <ColorPickerArea />
        <ColorPickerSlider />
        <ColorPickerFields v-model:format="format" />
      </ColorPicker>
      <FieldDescription id="color-picker-fields-demo-description" class="tabular-nums">
        Shown as {{ format.toUpperCase() }}, emitted as {{ color }}
      </FieldDescription>
    </Field>
  </div>
</template>
