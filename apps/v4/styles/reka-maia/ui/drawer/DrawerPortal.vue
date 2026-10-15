<script lang="ts" setup>
import type { DrawerPortalProps } from 'reka-ui'
import { DrawerPortal } from 'reka-ui'

const props = defineProps<DrawerPortalProps>()
</script>

<template>
  <DrawerPortal
    data-slot="drawer-portal"
    v-bind="props"
  >
    <slot />
  </DrawerPortal>
</template>
