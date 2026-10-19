<script setup lang="ts">
import type { PrimitiveProps } from 'reka-ui'

import type { HTMLAttributes } from 'vue'
import type { ButtonVariants } from '@/styles/reka-lyra/ui/button'
import { ChevronDownIcon } from '@lucide/vue'
import { cn } from 'cn'
import { PopoverTrigger } from 'reka-ui'
import { computed } from 'vue'
import { Button } from '@/styles/reka-lyra/ui/button'
import ColorPickerSwatch from './ColorPickerSwatch.vue'
import { injectColorPickerContext } from './utils'

const props = withDefaults(defineProps<PrimitiveProps & {
  variant?: ButtonVariants['variant']
  size?: ButtonVariants['size']
  class?: HTMLAttributes['class']
}>(), {
  as: 'button',
  variant: 'outline',
})

const {
  hex,
  disabled,
  id,
  ariaLabelledby,
  ariaDescribedby,
  valueId,
  hasInput,
} = injectColorPickerContext('ColorPickerTrigger')

/* The trigger takes `id` and `aria-describedby` only while no
   `ColorPickerInput` claims them, and is always named with its hex value. */
const labelAttrs = computed(() => {
  const attrs: Record<string, string> = {}
  if (!hasInput.value) {
    if (id.value)
      attrs.id = id.value
    if (ariaDescribedby.value)
      attrs['aria-describedby'] = ariaDescribedby.value
  }
  if (ariaLabelledby.value)
    attrs['aria-labelledby'] = `${ariaLabelledby.value} ${valueId}`
  else
    attrs['aria-label'] = hex.value
  return attrs
})
</script>

<template>
  <PopoverTrigger as-child>
    <Button
      data-slot="color-picker-trigger"
      v-bind="labelAttrs"
      :as="as"
      :as-child="asChild"
      :variant="variant"
      :size="size"
      :disabled="disabled"
      :data-disabled="disabled ? '' : undefined"
      :class="cn(
        'min-w-0',
        !$slots.default && 'justify-start font-normal tracking-normal normal-case tabular-nums',
        props.class,
      )"
    >
      <slot>
        <ColorPickerSwatch
          :color="hex"
          data-icon="inline-start"
          aria-hidden="true"
        />
        <span
          :id="valueId"
          data-slot="color-picker-value"
          class="flex-1 truncate text-start"
        >{{ hex }}</span>
        <ChevronDownIcon data-icon="inline-end" aria-hidden="true" class="text-muted-foreground" />
      </slot>
      <span v-if="$slots.default" :id="valueId" class="sr-only">{{ hex }}</span>
    </Button>
  </PopoverTrigger>
</template>
