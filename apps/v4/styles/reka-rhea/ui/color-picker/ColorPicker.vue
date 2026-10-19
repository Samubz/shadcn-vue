<script setup lang="ts">
import type { Color, HSBColor } from 'reka-ui'
import type { Ref } from 'vue'
import type { ColorPickerFormat } from './format'
import { PopoverRoot, useId } from 'reka-ui'
import { computed, shallowRef, toRef, watch } from 'vue'
import ColorPickerContent from './ColorPickerContent.vue'
import ColorPickerTrigger from './ColorPickerTrigger.vue'
import { DEFAULT_COLOR, provideColorPickerContext, toHex, toSafeColor } from './utils'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<{
  /** The color as a hex string (controlled). Emitted values are always lowercase `#rrggbb`. */
  modelValue?: string
  /** The initial color when uncontrolled. */
  defaultValue?: string
  disabled?: boolean
  /** Lands on the first field of a `ColorPickerInput` or `ColorPickerFields` outside the popover when there is one, else on the trigger. */
  id?: string
  /** Names the trigger together with its current hex value. */
  ariaLabelledby?: string
  /** Lands on the same control as `id`. */
  ariaDescribedby?: string
  /** The controlled open state of the popover. */
  open?: boolean
  /** The open state of the popover when it is initially rendered. */
  defaultOpen?: boolean
  /** Whether the popover is modal. */
  modal?: boolean
}>(), {
  disabled: false,
  open: undefined,
  defaultOpen: undefined,
  modal: undefined,
})

const emits = defineEmits<{
  'update:modelValue': [value: string]
  'update:open': [value: boolean]
}>()

function warnInvalid(value: unknown) {
  // Typed loosely: not every consumer project ships `vite/client` types.
  if ((import.meta as ImportMeta & { env?: { DEV?: boolean } }).env?.DEV) {
    console.warn(
      `[ColorPicker] Ignoring unsupported color ${JSON.stringify(value)}. `
      + 'Use a hex (#rgb, #rrggbb), rgb(), hsl() or hsb() string.',
    )
  }
}

/* Parses an incoming color, keeping `fallback` (and warning) when it is invalid. */
function resolveColor(value: string | undefined, fallback: HSBColor): HSBColor {
  if (value === undefined)
    return fallback
  const next = toSafeColor(value, fallback)
  if (next === fallback)
    warnInvalid(value)
  return next
}

const color = shallowRef<HSBColor>({
  ...resolveColor(props.modelValue ?? props.defaultValue, { ...DEFAULT_COLOR }),
})
const hex = computed(() => toHex(color.value))

/* Re-parse only when the parent writes a color other than the current one, so
   echoing the emitted hex back does not reset the hue of a gray. */
watch(() => props.modelValue, (value) => {
  if (value === undefined || value.toLowerCase() === hex.value)
    return
  color.value = resolveColor(value, color.value)
})

function setColor(next: Color) {
  const safe = toSafeColor(next, color.value)
  if (safe === color.value)
    return
  const previous = hex.value
  color.value = safe
  if (hex.value !== previous)
    emits('update:modelValue', hex.value)
}

const inputCount = shallowRef(0)

function registerInput() {
  inputCount.value++
  let registered = true
  return () => {
    if (!registered)
      return
    registered = false
    inputCount.value--
  }
}

/* The format shown by the mounted `ColorPickerFields`. Presentation only: none
   of this touches `color` or emits anything. */
interface FormatEntry { format: Readonly<Ref<ColorPickerFormat>> }

const formatEntries = shallowRef<FormatEntry[]>([])
const activeFormat = shallowRef<FormatEntry | null>(null)
const lastShownFormat = shallowRef<ColorPickerFormat>('hex')
const shownFormat = computed<ColorPickerFormat>(() => activeFormat.value?.format.value ?? 'hex')

function registerFormat(format: Readonly<Ref<ColorPickerFormat>>) {
  const entry: FormatEntry = { format }
  formatEntries.value = [...formatEntries.value, entry]
  activeFormat.value = entry
  lastShownFormat.value = format.value
  /* The last field to change its format becomes the shown one. */
  const stop = watch(format, (value) => {
    activeFormat.value = entry
    lastShownFormat.value = value
  })
  let registered = true
  return () => {
    if (!registered)
      return
    registered = false
    stop()
    formatEntries.value = formatEntries.value.filter(item => item !== entry)
    if (activeFormat.value === entry)
      activeFormat.value = formatEntries.value[formatEntries.value.length - 1] ?? null
  }
}

provideColorPickerContext({
  color,
  hex,
  setColor,
  disabled: toRef(() => props.disabled),
  id: toRef(() => props.id),
  ariaLabelledby: toRef(() => props.ariaLabelledby),
  ariaDescribedby: toRef(() => props.ariaDescribedby),
  valueId: useId(undefined, 'color-picker-value'),
  hasInput: computed(() => inputCount.value > 0),
  registerInput,
  shownFormat,
  registerFormat,
  lastShownFormat,
})
</script>

<template>
  <PopoverRoot
    v-slot="slotProps"
    :open="props.open"
    :default-open="props.defaultOpen"
    :modal="props.modal"
    @update:open="emits('update:open', $event)"
  >
    <slot v-bind="slotProps">
      <ColorPickerTrigger />
      <ColorPickerContent />
    </slot>
  </PopoverRoot>
</template>
