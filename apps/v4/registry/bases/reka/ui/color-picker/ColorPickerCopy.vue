<script setup lang="ts">
import type { PrimitiveProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import type { ColorPickerFormat } from "./format"
import type { ButtonVariants } from "@/registry/bases/reka/ui/button"
import { useClipboard } from "@vueuse/core"
import { cn } from "cn"
import IconPlaceholder from "@/registry/bases/reka/components/icon-placeholder/IconPlaceholder.vue"
import { Button } from "@/registry/bases/reka/ui/button"
import { formatColor } from "./format"
import { injectColorPickerContext } from "./utils"

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<PrimitiveProps & {
  /** The format copied. Defaults to the format the picker's `ColorPickerFields` show, else hex. */
  format?: ColorPickerFormat
  variant?: ButtonVariants["variant"]
  size?: ButtonVariants["size"]
  class?: HTMLAttributes["class"]
}>(), {
  as: "button",
  format: undefined,
  variant: "ghost",
  size: "icon-sm",
})

defineSlots<{
  default?: (props: { copied: boolean }) => any
}>()

const { color, disabled, shownFormat } = injectColorPickerContext("ColorPickerCopy")

const { copy, copied } = useClipboard({ copiedDuring: 2000, legacy: true })

/* Read on click, so it copies what is on screen at that moment. */
function copyColor() {
  copy(formatColor(color.value, props.format ?? shownFormat.value, { css: true }))
}
</script>

<template>
  <Button
    v-bind="$attrs"
    data-slot="color-picker-copy"
    type="button"
    aria-label="Copy color"
    :data-copied="copied || undefined"
    :as="as"
    :as-child="asChild"
    :variant="variant"
    :size="size"
    :disabled="disabled"
    :class="cn('cn-color-picker-copy', props.class)"
    @click="copyColor"
  >
    <slot :copied="copied">
      <IconPlaceholder
        v-if="copied"
        lucide="CheckIcon"
        tabler="IconCheck"
        hugeicons="Tick02Icon"
        phosphor="CheckIcon"
        remixicon="RiCheckLine"
        aria-hidden="true"
      />
      <IconPlaceholder
        v-else
        lucide="CopyIcon"
        tabler="IconCopy"
        hugeicons="Copy01Icon"
        phosphor="CopyIcon"
        remixicon="RiFileCopyLine"
        aria-hidden="true"
      />
    </slot>
  </Button>
  <span role="status" aria-live="polite" class="sr-only">{{ copied ? "Color copied" : "" }}</span>
</template>
