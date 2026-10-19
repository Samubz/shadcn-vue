<script setup lang="ts">
import type { ColorScaleSlotProps } from './utils'
import { useVModel } from '@vueuse/core'
import { computed, toRef } from 'vue'
import ColorScaleSwatches from './ColorScaleSwatches.vue'
import { buildColorScale, buildColorScaleCss } from './scale'
import { provideColorScaleContext } from './utils'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<{
  /** The base color as a hex string (controlled). It becomes step 500. */
  modelValue?: string
  /** The initial base color when uncontrolled. */
  defaultValue?: string
  /** The custom property prefix of the copied CSS: `--<prefix>-<step>`. */
  prefix?: string
}>(), {
  prefix: 'brand',
})

const emits = defineEmits<{
  'update:modelValue': [value: string]
}>()

defineSlots<{
  default?: (props: ColorScaleSlotProps) => any
}>()

const model = useVModel(props, 'modelValue', emits, {
  passive: true,
  defaultValue: props.defaultValue,
})

const base = computed(() => model.value ?? '')
const scale = computed(() => buildColorScale(base.value))
const css = computed(() => buildColorScaleCss(scale.value, props.prefix))

provideColorScaleContext({
  base,
  scale,
  css,
  prefix: toRef(() => props.prefix),
})
</script>

<template>
  <slot :base="base" :scale="scale" :css="css">
    <ColorScaleSwatches />
  </slot>
</template>
