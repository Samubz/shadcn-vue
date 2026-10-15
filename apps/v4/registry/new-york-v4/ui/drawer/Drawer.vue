<script lang="ts" setup>
import type { DrawerRootEmits, DrawerRootProps } from "reka-ui"
import { reactiveOmit } from "@vueuse/core"
import { DrawerRoot, useForwardPropsEmits } from "reka-ui"
import { toRef } from "vue"
import { provideDrawerContext } from "./utils"

const props = withDefaults(defineProps<DrawerRootProps & { showSwipeHandle?: boolean }>(), {
  modal: true,
  swipeDirection: "down",
  showSwipeHandle: false,
})

const emits = defineEmits<DrawerRootEmits>()

const delegatedProps = reactiveOmit(props, "showSwipeHandle")

const forwarded = useForwardPropsEmits(delegatedProps, emits)

provideDrawerContext({
  showSwipeHandle: toRef(() => props.showSwipeHandle),
})
</script>

<template>
  <DrawerRoot
    v-slot="slotProps"
    v-bind="forwarded"
  >
    <slot v-bind="slotProps" />
  </DrawerRoot>
</template>
