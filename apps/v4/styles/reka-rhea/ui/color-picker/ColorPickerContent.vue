<script setup lang="ts">
import type { PopoverContentEmits, PopoverContentProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import { reactiveOmit } from '@vueuse/core'
import { cn } from 'cn'
import { useForwardPropsEmits } from 'reka-ui'
import { computed, provide } from 'vue'
import { PopoverContent } from '@/styles/reka-rhea/ui/popover'
import ColorPickerArea from './ColorPickerArea.vue'
import ColorPickerCopy from './ColorPickerCopy.vue'
import ColorPickerEyeDropper from './ColorPickerEyeDropper.vue'
import ColorPickerFields from './ColorPickerFields.vue'
import ColorPickerSlider from './ColorPickerSlider.vue'
import { COLOR_PICKER_CONTENT_KEY, injectColorPickerContext } from './utils'

const props = withDefaults(
  defineProps<PopoverContentProps & { class?: HTMLAttributes['class'] }>(),
  {
    align: 'start',
  },
)
const emits = defineEmits<PopoverContentEmits>()

const delegatedProps = reactiveOmit(props, 'class')

const forwarded = useForwardPropsEmits(delegatedProps, emits)

const { ariaLabelledby } = injectColorPickerContext('ColorPickerContent')

/* The panel shares the picker's label, when it has one. */
const labelAttrs = computed(() =>
  ariaLabelledby.value ? { 'aria-labelledby': ariaLabelledby.value } : {},
)

/* A `ColorPickerInput` or `ColorPickerFields` inside the popover is secondary:
   it leaves `id` to the control outside the popover, and a `ColorPickerInput`
   shows a plain swatch instead of a second popover trigger. */
provide(COLOR_PICKER_CONTENT_KEY, true)
</script>

<template>
  <PopoverContent
    data-slot="color-picker-content"
    v-bind="{ ...forwarded, ...labelAttrs }"
    :class="cn('gap-3 flex flex-col', props.class)"
  >
    <slot>
      <ColorPickerArea />
      <div class="flex items-center gap-2">
        <ColorPickerEyeDropper />
        <ColorPickerSlider class="flex-1" />
        <ColorPickerCopy />
      </div>
      <ColorPickerFields />
    </slot>
  </PopoverContent>
</template>
