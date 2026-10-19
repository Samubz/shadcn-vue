<script setup lang="ts">
import { ref } from "vue"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/registry/bases/reka/ui/card"
import {
  ColorPicker,
  ColorPickerContent,
  ColorPickerInput,
} from "@/registry/bases/reka/ui/color-picker"
import {
  ColorScale,
  ColorScaleCopy,
  ColorScaleSwatches,
} from "@/registry/bases/reka/ui/color-scale"
import { Field, FieldLabel } from "@/registry/bases/reka/ui/field"

const base = ref("#7c3aed")
</script>

<template>
  <Card class="w-full max-w-md">
    <ColorScale v-model="base">
      <CardHeader>
        <CardTitle>Brand scale</CardTitle>
        <CardDescription>11 shades from one base color.</CardDescription>
        <CardAction>
          <ColorScaleCopy />
        </CardAction>
      </CardHeader>
      <CardContent>
        <div class="flex flex-col gap-5">
          <Field>
            <FieldLabel id="color-scale-base-label" for="color-scale-base">
              Base color
            </FieldLabel>
            <ColorPicker id="color-scale-base" v-model="base" aria-labelledby="color-scale-base-label">
              <ColorPickerInput />
              <ColorPickerContent />
            </ColorPicker>
          </Field>
          <ColorScaleSwatches />
        </div>
      </CardContent>
    </ColorScale>
  </Card>
</template>
