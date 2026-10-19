<script setup lang="ts">
import { ColorPickerSwatch } from "@/registry/bases/reka/ui/color-picker"

const colors = [
  { label: "Red", value: "#ef4444" },
  { label: "Orange", value: "#f97316" },
  { label: "Amber", value: "#f59e0b" },
  { label: "Green", value: "#22c55e" },
  { label: "Teal", value: "#14b8a6" },
  { label: "Sky", value: "#0ea5e9" },
  { label: "Violet", value: "#7c3aed" },
  { label: "Pink", value: "#ec4899" },
  { label: "Translucent black", value: "#00000066" },
]
</script>

<template>
  <div class="flex flex-wrap gap-2">
    <ColorPickerSwatch
      v-for="color in colors"
      :key="color.value"
      :color="color.value"
      :label="color.label"
      class="size-8"
    />
  </div>
</template>
