<script setup lang="ts">
import { ref } from 'vue'
import {
  ColorPicker,
  ColorPickerContent,
  ColorPickerInput,
} from '@/registry/new-york-v4/ui/color-picker'
import {
  Field,
  FieldDescription,
  FieldLabel,
} from '@/registry/new-york-v4/ui/field'

const color = ref('#7c3aed')
</script>

<template>
  <div class="w-full max-w-xs">
    <Field>
      <FieldLabel id="color-picker-input-demo-label" for="color-picker-input-demo">
        Brand color
      </FieldLabel>
      <ColorPicker id="color-picker-input-demo" v-model="color" aria-labelledby="color-picker-input-demo-label">
        <ColorPickerInput />
        <ColorPickerContent />
      </ColorPicker>
      <FieldDescription>
        Type a hex value or pick one from the swatch.
      </FieldDescription>
    </Field>
  </div>
</template>
