<script setup lang="ts">
import { Example, ExampleWrapper } from "@/registry/bases/reka/components/example"
import ColorPickerPopover from "~/registry/bases/reka/examples/color-picker/ColorPickerPopover.vue"
import ColorPickerSwatchRow from "~/registry/bases/reka/examples/color-picker/ColorPickerSwatchRow.vue"
import ColorPickerWithInput from "~/registry/bases/reka/examples/color-picker/ColorPickerWithInput.vue"
</script>

<template>
  <ExampleWrapper>
    <Example title="Popover">
      <ColorPickerPopover />
    </Example>
    <Example title="Input with Popover">
      <ColorPickerWithInput />
    </Example>
    <Example title="Swatches">
      <ColorPickerSwatchRow />
    </Example>
  </ExampleWrapper>
</template>
