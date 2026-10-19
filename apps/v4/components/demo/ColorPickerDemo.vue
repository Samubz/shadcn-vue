<script setup lang="ts">
import { ColorPicker } from '@/registry/new-york-v4/ui/color-picker'
import {
  Field,
  FieldDescription,
  FieldLabel,
} from '@/registry/new-york-v4/ui/field'
</script>

<template>
  <div class="w-full max-w-xs">
    <Field>
      <FieldLabel id="color-picker-demo-label" for="color-picker-demo">
        Accent color
      </FieldLabel>
      <ColorPicker
        id="color-picker-demo"
        default-value="#0ea5e9"
        aria-labelledby="color-picker-demo-label"
        aria-describedby="color-picker-demo-description"
      />
      <FieldDescription id="color-picker-demo-description">
        Used for links, focus rings and primary buttons.
      </FieldDescription>
    </Field>
  </div>
</template>
