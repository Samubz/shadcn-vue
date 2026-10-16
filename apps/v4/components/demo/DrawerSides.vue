<script setup lang="ts">
import { Button } from '@/styles/reka-rhea/ui/button'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/styles/reka-rhea/ui/drawer'
</script>

<template>
  <Drawer swipe-direction="left">
    <DrawerTrigger as-child>
      <Button variant="secondary">
        Open Left Drawer
      </Button>
    </DrawerTrigger>
    <DrawerContent>
      <DrawerHeader>
        <DrawerTitle>Move Goal</DrawerTitle>
        <DrawerDescription>Set your daily activity goal.</DrawerDescription>
      </DrawerHeader>
      <div class="flex-1 p-4">
        <div class="bg-muted size-full rounded-2xl" />
      </div>
      <DrawerFooter>
        <DrawerClose as-child>
          <Button>Close</Button>
        </DrawerClose>
      </DrawerFooter>
    </DrawerContent>
  </Drawer>
</template>
