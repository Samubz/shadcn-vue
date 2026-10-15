<script lang="ts" setup>
import type { HTMLAttributes } from "vue"
import { cn } from "cn"

const props = defineProps<{
  class?: HTMLAttributes["class"]
}>()
</script>

<template>
  <div
    data-slot="drawer-footer"
    :class="cn('cn-drawer-footer-base mt-auto flex shrink-0 flex-col', props.class)"
  >
    <slot />
  </div>
</template>
