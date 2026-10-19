<script setup lang="ts">
import type { PrimitiveProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import type { ButtonVariants } from "@/registry/bases/reka/ui/button"
import { useClipboard } from "@vueuse/core"
import IconPlaceholder from "@/registry/bases/reka/components/icon-placeholder/IconPlaceholder.vue"
import { Button } from "@/registry/bases/reka/ui/button"
import { injectColorScaleContext } from "./utils"

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<PrimitiveProps & {
  variant?: ButtonVariants["variant"]
  size?: ButtonVariants["size"]
  class?: HTMLAttributes["class"]
}>(), {
  as: "button",
  variant: "outline",
  size: "sm",
})

defineSlots<{
  default?: (props: { copied: boolean }) => any
}>()

const { css } = injectColorScaleContext("ColorScaleCopy")

const { copy, copied } = useClipboard({ copiedDuring: 2000, legacy: true })
</script>

<template>
  <Button
    v-bind="$attrs"
    data-slot="color-scale-copy"
    :data-copied="copied || undefined"
    :as="as"
    :as-child="asChild"
    :variant="variant"
    :size="size"
    :disabled="!css"
    :class="props.class"
    @click="copy(css)"
  >
    <slot :copied="copied">
      <IconPlaceholder
        v-if="copied"
        lucide="CheckIcon"
        tabler="IconCheck"
        hugeicons="Tick02Icon"
        phosphor="CheckIcon"
        remixicon="RiCheckLine"
        data-icon="inline-start"
      />
      <IconPlaceholder
        v-else
        lucide="CopyIcon"
        tabler="IconCopy"
        hugeicons="Copy01Icon"
        phosphor="CopyIcon"
        remixicon="RiFileCopyLine"
        data-icon="inline-start"
      />
      {{ copied ? "Copied" : "Copy CSS" }}
    </slot>
  </Button>
  <span role="status" aria-live="polite" class="sr-only">{{ copied ? "CSS variables copied" : "" }}</span>
</template>
