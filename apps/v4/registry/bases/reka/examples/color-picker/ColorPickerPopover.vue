<script setup lang="ts">
import { ColorPicker } from "@/registry/bases/reka/ui/color-picker"
import { Field, FieldDescription, FieldLabel } from "@/registry/bases/reka/ui/field"
</script>

<template>
  <Field class="max-w-xs">
    <FieldLabel id="color-picker-accent-label" for="color-picker-accent">
      Accent color
    </FieldLabel>
    <ColorPicker
      id="color-picker-accent"
      default-value="#0ea5e9"
      aria-labelledby="color-picker-accent-label"
      aria-describedby="color-picker-accent-description"
    />
    <FieldDescription id="color-picker-accent-description">
      Used for links, focus rings and primary buttons.
    </FieldDescription>
  </Field>
</template>
