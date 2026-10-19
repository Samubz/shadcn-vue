<script setup lang="ts">
import type { PrimitiveProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import type { ButtonVariants } from "@/registry/new-york-v4/ui/button"
import { CheckIcon, CopyIcon } from "@lucide/vue"
import { useClipboard } from "@vueuse/core"
import { Button } from "@/registry/new-york-v4/ui/button"
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
      <CheckIcon v-if="copied" />
      <CopyIcon v-else />
      {{ copied ? "Copied" : "Copy CSS" }}
    </slot>
  </Button>
  <span role="status" aria-live="polite" class="sr-only">{{ copied ? "CSS variables copied" : "" }}</span>
</template>
