<script setup lang="ts">
import { Button } from '@/registry/new-york-v4/ui/button'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/registry/new-york-v4/ui/drawer'

const snapPoints = ['31rem', 1]
</script>

<template>
  <Drawer :snap-points="snapPoints" show-swipe-handle>
    <DrawerTrigger as-child>
      <Button variant="outline">
        Open Snap Drawer
      </Button>
    </DrawerTrigger>
    <DrawerContent>
      <DrawerHeader>
        <DrawerTitle>Snap points</DrawerTitle>
        <DrawerDescription>
          Drag the drawer to snap between a compact peek and a near full-height
          view.
        </DrawerDescription>
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
