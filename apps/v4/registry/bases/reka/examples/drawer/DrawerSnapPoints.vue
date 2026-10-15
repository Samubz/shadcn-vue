<script setup lang="ts">
import { Button } from "@/registry/bases/reka/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/registry/bases/reka/ui/drawer"
import { Example } from "~/registry/bases/reka/components/example"
import { SNAP_POINTS } from "./data"
</script>

<template>
  <Example title="Snap Points">
    <Drawer :snap-points="SNAP_POINTS" show-swipe-handle>
      <DrawerTrigger as-child>
        <Button variant="outline">
          Open Snap Drawer
        </Button>
      </DrawerTrigger>
      <DrawerContent class="max-h-[calc(100dvh-1rem)]">
        <DrawerHeader>
          <DrawerTitle>Snap points</DrawerTitle>
          <DrawerDescription>
            Drag the drawer to snap between a compact peek and a near
            full-height view.
          </DrawerDescription>
        </DrawerHeader>
        <div class="scroll-fade grid flex-1 gap-3 overflow-y-auto p-4">
          <div
            v-for="index in 16"
            :key="index"
            class="bg-muted h-12"
          />
        </div>
      </DrawerContent>
    </Drawer>
  </Example>
</template>
