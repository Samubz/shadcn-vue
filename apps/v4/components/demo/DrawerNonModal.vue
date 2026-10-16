<script setup lang="ts">
import { Button } from '@/styles/reka-rhea/ui/button'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/styles/reka-rhea/ui/drawer'
</script>

<template>
  <Drawer :modal="false" swipe-direction="right">
    <DrawerTrigger as-child>
      <Button variant="outline">
        Non Modal
      </Button>
    </DrawerTrigger>
    <DrawerContent @interact-outside.prevent>
      <DrawerHeader>
        <DrawerTitle>Non Modal Drawer</DrawerTitle>
      </DrawerHeader>
      <div class="flex-1 p-4">
        <div class="bg-muted rounded-2xl group-data-[swipe-axis=x]/drawer-popup:size-full group-data-[swipe-axis=y]/drawer-popup:h-80 group-data-[swipe-axis=y]/drawer-popup:w-full" />
      </div>
      <DrawerFooter>
        <DrawerClose as-child>
          <Button>Close</Button>
        </DrawerClose>
      </DrawerFooter>
    </DrawerContent>
  </Drawer>
</template>
