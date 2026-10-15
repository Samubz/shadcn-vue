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
    :class="cn('gap-2 p-4 pt-0 mt-auto flex shrink-0 flex-col', props.class)"
  >
    <slot />
  </div>
</template>
