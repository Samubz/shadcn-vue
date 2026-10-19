<script setup lang="ts">
import type { Color, ColorChannel, HSLColor } from 'reka-ui'

import type { HTMLAttributes } from 'vue'
import type { ColorPickerFormat } from './format'
import { ChevronDownIcon } from '@lucide/vue'
import { cn } from 'cn'
import { ColorFieldInput, ColorFieldRoot, convertToRgb, getChannelValue, parseColor } from 'reka-ui'
import { computed, inject, onBeforeUnmount, shallowRef, watch } from 'vue'
import { oklchToHex } from '@/styles/reka-sera/lib/oklch'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/styles/reka-sera/ui/dropdown-menu'
import { InputGroup, InputGroupAddon, InputGroupButton } from '@/styles/reka-sera/ui/input-group'
import { COLOR_PICKER_FORMATS, formatColor, isColorPickerFormat, oklchChannels, parseHexInput } from './format'
import { COLOR_PICKER_CONTENT_KEY, injectColorPickerContext } from './utils'

const props = withDefaults(defineProps<{
  /** The format shown (controlled). It never changes what `ColorPicker` emits. */
  format?: ColorPickerFormat
  /** The format shown first when uncontrolled. Defaults to the last format shown in the same picker, else HEX. */
  defaultFormat?: ColorPickerFormat
  /** The formats offered by the menu, in order. A single format hides the menu. */
  formats?: readonly ColorPickerFormat[]
  class?: HTMLAttributes['class']
}>(), {
  format: undefined,
  defaultFormat: undefined,
  formats: () => COLOR_PICKER_FORMATS,
})

const emits = defineEmits<{
  'update:format': [format: ColorPickerFormat]
}>()

const {
  color,
  hex,
  setColor,
  disabled,
  id,
  ariaDescribedby,
  registerInput,
  registerFormat,
  lastShownFormat,
} = injectColorPickerContext('ColorPickerFields')

const FORMAT_LABELS: Record<ColorPickerFormat, string> = {
  hex: 'HEX',
  rgb: 'RGB',
  hsl: 'HSL',
  hsb: 'HSB',
  oklch: 'OKLCH',
}

/* -- Shown format ---------------------------------------------------------- */

function initialFormat(): ColorPickerFormat {
  if (props.defaultFormat)
    return props.defaultFormat
  /* The picker's last shown format, unless this menu does not offer it. */
  return props.formats.includes(lastShownFormat.value)
    ? lastShownFormat.value
    : props.formats[0] ?? 'hex'
}

const localFormat = shallowRef<ColorPickerFormat>(initialFormat())
const shown = computed<ColorPickerFormat>(() => props.format ?? localFormat.value)
const showMenu = computed(() => props.formats.length > 1)

function setFormat(next: unknown) {
  if (!isColorPickerFormat(next) || next === shown.value)
    return
  localFormat.value = next
  emits('update:format', next)
}

/* Register during setup, like `ColorPickerInput`, so the server render and the
   first client render agree on what the copy button copies and where `id` is. */
let unregisterFormat: (() => void) | undefined = registerFormat(shown)

/* Inside `ColorPickerContent` the fields are secondary: the picker's `id`
   stays on the control outside the popover. */
const insideContent = inject(COLOR_PICKER_CONTENT_KEY, false)
let unregisterInput = insideContent ? undefined : registerInput()

onBeforeUnmount(() => {
  unregisterFormat?.()
  unregisterFormat = undefined
  unregisterInput?.()
  unregisterInput = undefined
})

/* `id` and `aria-describedby` go on the first field, outside the popover only. */
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

/* -- Field markup ---------------------------------------------------------- */

const FIELD_CLASS = 'aria-invalid:border-b-destructive dark:aria-invalid:border-b-destructive/50 px-0 py-1 text-base transition-[color,border-color] file:h-7 file:text-sm file:font-medium md:text-sm border-0 bg-transparent ring-0 focus-visible:ring-0 aria-invalid:ring-0 dark:bg-transparent group-has-[>[data-align=inline-start]]/input-group:pl-2 group-has-[>[data-align=inline-end]]/input-group:pr-2 border-input focus-visible:border-input pr-1 pl-2 h-auto w-full min-w-0 self-stretch tabular-nums outline-none placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50'

/* Each field starts at its widest value plus padding (in ch, so it follows the
   font) and shrinks in proportion on a narrow row. */
const BASIS_CHANNEL = 'flex-[1_1_calc(3.5ch+1rem)]'
const BASIS_OKLCH_L = 'flex-[1_1_calc(5.5ch+1rem)]'
const BASIS_OKLCH_CH = 'flex-[1_1_calc(7.5ch+1rem)]'
const BASIS_HEX = 'flex-[1_1_calc(6.5ch+1rem)] uppercase'

/* A divider before every field that follows the menu or another field. */
function fieldClass(index: number, basis?: string) {
  return cn(FIELD_CLASS, basis, (showMenu.value || index > 0) && 'border-l')
}

const inputAttrs = {
  autocomplete: 'off',
  autocorrect: 'off',
  autocapitalize: 'off',
  spellcheck: 'false',
} as const

/* -- RGB, HSL and HSB: reka channel fields --------------------------------- */

const REKA_FIELDS: Record<'rgb' | 'hsl' | 'hsb', { channel: ColorChannel, label: string }[]> = {
  rgb: [
    { channel: 'red', label: 'Red' },
    { channel: 'green', label: 'Green' },
    { channel: 'blue', label: 'Blue' },
  ],
  hsl: [
    { channel: 'hue', label: 'Hue' },
    { channel: 'saturation', label: 'Saturation' },
    { channel: 'lightness', label: 'Lightness' },
  ],
  hsb: [
    { channel: 'hue', label: 'Hue' },
    { channel: 'saturation', label: 'Saturation' },
    { channel: 'brightness', label: 'Brightness' },
  ],
}

const rekaFields = computed(() => {
  const format = shown.value
  return format === 'rgb' || format === 'hsl' || format === 'hsb' ? REKA_FIELDS[format] : []
})

/* The picker's HSB color in HSL, on the exact channels and keeping the hue:
   reka's `convertToHsl` goes through RGB and resets a gray's hue to 0. */
function toHslKeepingHue(): HSLColor {
  const { h, s, b } = color.value
  const saturation = s / 100
  const brightness = b / 100
  const lightness = brightness * (1 - saturation / 2)
  const hslSaturation = lightness === 0 || lightness === 1
    ? 0
    : (brightness - lightness) / Math.min(lightness, 1 - lightness)
  return { space: 'hsl', h, s: hslSaturation * 100, l: lightness * 100, alpha: 1 }
}

/* Bumped by Escape: a fresh model object makes reka's fields drop the typed
   text and show the current value again. */
const rekaRevision = shallowRef(0)

/* What the reka fields read: their channels must come from the matching space
   (`saturation` reads the HSB `s` from an HSB color, the HSL `s` otherwise). */
const rekaColor = computed<Color>(() => {
  void rekaRevision.value
  if (shown.value === 'rgb')
    return convertToRgb(color.value)
  if (shown.value === 'hsl')
    return toHslKeepingHue()
  return { ...color.value }
})

/* The field Escape was pressed in, until it is focused or typed in again. */
let escapedInput: EventTarget | null = null

function onChannelKeydown(event: KeyboardEvent) {
  if (event.key !== 'Escape')
    return
  escapedInput = event.target
  rekaRevision.value++
}

function onChannelEdit() {
  escapedInput = null
}

/*
 * reka's `ColorFieldInput` commits on every blur and Enter by re-parsing the
 * shown, rounded value, so leaving a field untouched would nudge the color
 * (#0ea5e9 blurred in HSB hue gives #0ea4e9). Skip a commit that:
 * - only writes back the rounded value the field shows (arrow keys, the
 *   wheel and real edits always differ from it);
 * - is the blur that follows Escape (the popover closing removes the field).
 */
function commitChannel(channel: ColorChannel, next: Color) {
  if (escapedInput && document.activeElement !== escapedInput) {
    escapedInput = null
    return
  }
  const shownValue = Math.round(getChannelValue(rekaColor.value, channel))
  if (Math.abs(getChannelValue(next, channel) - shownValue) < 1e-6)
    return
  setColor(next)
}

/* -- HEX and OKLCH: own inputs --------------------------------------------- */

type DraftKey = 'hex' | 'oklch-l' | 'oklch-c' | 'oklch-h'

/* What the user is typing in an own input, until Enter or blur commits it. */
const drafts = shallowRef<Partial<Record<DraftKey, string>>>({})

function setDraft(key: DraftKey, event: Event) {
  drafts.value = { ...drafts.value, [key]: (event.target as HTMLInputElement).value }
}

function takeDraft(key: DraftKey): string | undefined {
  const text = drafts.value[key]
  if (text === undefined)
    return undefined
  const { [key]: _taken, ...rest } = drafts.value
  drafts.value = rest
  return text
}

/* Escape reverts the typed text; the event still reaches the popover. */
function revertDraft(key: DraftKey) {
  takeDraft(key)
}

const hexText = computed(() => hex.value.slice(1).toUpperCase())

function commitHex() {
  const text = takeDraft('hex')
  if (text === undefined)
    return
  const next = parseHexInput(text)
  if (next)
    setColor(parseColor(next))
}

/* The OKLCH hue is undefined at zero chroma (`oklchChannels` gives a gray hue
   0), so the fields remember the last hue of a chromatic color and reuse it
   while chroma is 0: setting chroma to 0 and back keeps the hue. */
const ACHROMATIC = 1e-4
const oklch = computed(() => oklchChannels(color.value))
const oklchHue = shallowRef(0)

watch(oklch, ([, c, h]) => {
  if (c >= ACHROMATIC)
    oklchHue.value = h
}, { immediate: true })

const oklchShown = computed<[l: number, c: number, h: number]>(() => {
  const [l, c, h] = oklch.value
  return [l, c, c >= ACHROMATIC ? h : oklchHue.value]
})

const NUMBER = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/
const MAX_CHROMA = 0.4

function readNumber(text: string, allowPercent = false): number | null {
  let value = text.trim()
  if (allowPercent)
    value = value.replace(/\s*%$/, '')
  if (!NUMBER.test(value))
    return null
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

const OKLCH_FIELDS = [
  { key: 'oklch-l', index: 0, label: 'Lightness (OKLCH)', basis: BASIS_OKLCH_L },
  { key: 'oklch-c', index: 1, label: 'Chroma', basis: BASIS_OKLCH_CH },
  { key: 'oklch-h', index: 2, label: 'Hue (OKLCH)', basis: BASIS_OKLCH_CH },
] as const

function commitOklch(key: 'oklch-l' | 'oklch-c' | 'oklch-h') {
  const text = takeDraft(key)
  if (text === undefined)
    return
  const value = readNumber(text, key === 'oklch-l')
  if (value === null)
    return
  let [l, c, h] = oklchShown.value
  if (key === 'oklch-l') {
    l = Math.min(100, Math.max(0, value))
  }
  else if (key === 'oklch-c') {
    c = Math.min(MAX_CHROMA, Math.max(0, value))
  }
  else {
    h = ((value % 360) + 360) % 360
    /* A gray cannot carry the hue through hex: keep it for the next chroma. */
    oklchHue.value = h
  }
  setColor(parseColor(oklchToHex([l / 100, c, h])))
}

function oklchText(index: 0 | 1 | 2) {
  return String(oklchShown.value[index])
}
</script>

<template>
  <InputGroup
    data-slot="color-picker-fields"
    :data-disabled="disabled ? '' : undefined"
    :class="cn('*:data-[slot=input-group-addon]:pr-1', props.class)"
  >
    <InputGroupAddon v-if="showMenu" align="inline-start">
      <DropdownMenu>
        <DropdownMenuTrigger as-child :disabled="disabled">
          <InputGroupButton
            data-slot="color-picker-format-trigger"
            size="xs"
            :aria-label="`Color format, ${FORMAT_LABELS[shown]}`"
            class="gap-1 text-xs font-medium tracking-wider"
          >
            {{ FORMAT_LABELS[shown] }}
            <ChevronDownIcon data-icon="inline-end" aria-hidden="true" />
          </InputGroupButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" class="w-auto min-w-56">
          <DropdownMenuRadioGroup :model-value="shown" @update:model-value="setFormat">
            <DropdownMenuRadioItem
              v-for="item in props.formats"
              :key="item"
              :value="item"
              :data-format="item"
              class="gap-3"
            >
              <span class="w-12 shrink-0 font-medium">{{ FORMAT_LABELS[item] }}</span>
              <span class="truncate text-xs tracking-normal normal-case text-muted-foreground tabular-nums">{{ formatColor(color, item) }}</span>
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </InputGroupAddon>

    <div class="flex min-w-0 flex-1 self-stretch">
      <input
        v-if="shown === 'hex'"
        data-slot="input-group-control"
        data-channel="hex"
        type="text"
        inputmode="text"
        v-bind="{ ...inputAttrs, ...labelAttrs }"
        aria-label="Hex"
        :value="drafts.hex ?? hexText"
        :disabled="disabled"
        :class="fieldClass(0, BASIS_HEX)"
        @input="setDraft('hex', $event)"
        @keydown.enter.prevent="commitHex"
        @keydown.esc="revertDraft('hex')"
        @blur="commitHex"
      >

      <template v-else-if="shown === 'oklch'">
        <input
          v-for="field in OKLCH_FIELDS"
          :key="field.key"
          data-slot="input-group-control"
          :data-channel="field.key"
          type="text"
          inputmode="decimal"
          v-bind="{ ...inputAttrs, ...(field.index === 0 ? labelAttrs : {}) }"
          :aria-label="field.label"
          :value="drafts[field.key] ?? oklchText(field.index)"
          :disabled="disabled"
          :class="fieldClass(field.index, field.basis)"
          @input="setDraft(field.key, $event)"
          @keydown.enter.prevent="commitOklch(field.key)"
          @keydown.esc="revertDraft(field.key)"
          @blur="commitOklch(field.key)"
        >
      </template>

      <template v-else>
        <ColorFieldRoot
          v-for="(field, index) in rekaFields"
          :key="`${shown}-${field.channel}`"
          :channel="field.channel"
          :model-value="rekaColor"
          :disabled="disabled"
          :class="cn('flex min-w-0 self-stretch', BASIS_CHANNEL)"
          @update:color="commitChannel(field.channel, $event)"
        >
          <ColorFieldInput
            data-slot="input-group-control"
            :data-channel="field.channel"
            v-bind="{ ...inputAttrs, ...(index === 0 ? labelAttrs : {}) }"
            :aria-label="field.label"
            :class="fieldClass(index)"
            @keydown="onChannelKeydown"
            @focus="onChannelEdit"
            @input="onChannelEdit"
          />
        </ColorFieldRoot>
      </template>
    </div>
  </InputGroup>
</template>
