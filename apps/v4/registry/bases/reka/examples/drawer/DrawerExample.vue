<script setup lang="ts">
import { ExampleWrapper } from "@/registry/bases/reka/components/example"
import DrawerCustomWidthAndHeight from "~/registry/bases/reka/examples/drawer/DrawerCustomWidthAndHeight.vue"
import DrawerDemo from "~/registry/bases/reka/examples/drawer/DrawerDemo.vue"
import DrawerNested from "~/registry/bases/reka/examples/drawer/DrawerNested.vue"
import DrawerNonModal from "~/registry/bases/reka/examples/drawer/DrawerNonModal.vue"
import DrawerPosition from "~/registry/bases/reka/examples/drawer/DrawerPosition.vue"
import DrawerScrollable from "~/registry/bases/reka/examples/drawer/DrawerScrollable.vue"
import DrawerSnapPoints from "~/registry/bases/reka/examples/drawer/DrawerSnapPoints.vue"
import DrawerSwipeHandleExample from "~/registry/bases/reka/examples/drawer/DrawerSwipeHandleExample.vue"
</script>

<template>
  <ExampleWrapper>
    <DrawerDemo />
    <DrawerSwipeHandleExample />
    <DrawerPosition />
    <DrawerCustomWidthAndHeight />
    <DrawerScrollable />
    <DrawerSnapPoints />
    <DrawerNested />
    <DrawerNonModal />
  </ExampleWrapper>
</template>
