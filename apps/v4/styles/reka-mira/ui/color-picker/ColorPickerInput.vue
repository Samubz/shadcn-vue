<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { ColorFieldInput, ColorFieldRoot } from 'reka-ui'
import { computed, inject, onBeforeUnmount } from 'vue'
import { InputGroup, InputGroupAddon, inputGroupButtonVariants } from '@/styles/reka-mira/ui/input-group'
import ColorPickerSwatch from './ColorPickerSwatch.vue'
import ColorPickerTrigger from './ColorPickerTrigger.vue'
import { COLOR_PICKER_CONTENT_KEY, injectColorPickerContext } from './utils'

defineOptions({
  inheritAttrs: false,
})

const props = defineProps<{
  class?: HTMLAttributes['class']
}>()

const {
  color,
  hex,
  setColor,
  disabled,
  id,
  ariaDescribedby,
  registerInput,
} = injectColorPickerContext('ColorPickerInput')

/* Inside `ColorPickerContent` the field is secondary: no second trigger, and
   the picker's `id` stays on the control outside the popover. */
const insideContent = inject(COLOR_PICKER_CONTENT_KEY, false)

/* Register during setup, not on mount, so the server render and the first
   client render already place `id` on the field instead of the trigger. */
let unregister = insideContent ? undefined : registerInput()

onBeforeUnmount(() => {
  unregister?.()
  unregister = undefined
})

const labelAttrs = computed(() => {
  const attrs: Record<string, string> = {}
  if (insideContent)
    return attrs
  if (id.value)
    attrs.id = id.value
  if (ariaDescribedby.value)
    attrs['aria-describedby'] = ariaDescribedby.value
  return attrs
})
</script>

<template>
  <ColorFieldRoot
    as-child
    :model-value="color"
    :disabled="disabled"
    @update:color="setColor"
  >
    <InputGroup
      data-slot="color-picker-input"
      :data-disabled="disabled ? '' : undefined"
      :class="props.class"
    >
      <InputGroupAddon>
        <ColorPickerSwatch
          v-if="insideContent"
          :color="hex"
          aria-hidden="true"
        />
        <!-- Renders what `InputGroupButton size="icon-xs"` renders, but as the
             picker's trigger: a ghost Button with the input-group button classes. -->
        <ColorPickerTrigger
          v-else
          variant="ghost"
          data-size="icon-xs"
          :class="inputGroupButtonVariants({ size: 'icon-xs' })"
        >
          <ColorPickerSwatch :color="hex" aria-hidden="true" />
        </ColorPickerTrigger>
      </InputGroupAddon>
      <ColorFieldInput
        data-slot="input-group-control"
        autocomplete="off"
        autocorrect="off"
        autocapitalize="off"
        spellcheck="false"
        v-bind="{ ...labelAttrs, ...$attrs }"
        class="border-input focus-visible:border-ring focus-visible:ring-ring/30 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 h-7 px-2 py-0.5 text-sm transition-colors file:h-6 file:text-xs/relaxed file:font-medium md:text-xs/relaxed rounded-none border-0 bg-transparent shadow-none ring-0 focus-visible:ring-0 aria-invalid:ring-0 dark:bg-transparent w-full min-w-0 flex-1 tabular-nums outline-none placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
      />
    </InputGroup>
  </ColorFieldRoot>
</template>
