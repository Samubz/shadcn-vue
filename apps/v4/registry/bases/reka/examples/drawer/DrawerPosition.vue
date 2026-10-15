<script setup lang="ts">
import { Button } from "@/registry/bases/reka/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/registry/bases/reka/ui/drawer"
import { Example } from "~/registry/bases/reka/components/example"
import { DRAWER_SIDES } from "./data"
</script>

<template>
  <Example title="Position">
    <div class="flex flex-wrap gap-2">
      <Drawer
        v-for="side in DRAWER_SIDES"
        :key="side"
        :swipe-direction="side"
      >
        <DrawerTrigger as-child>
          <Button variant="outline" class="capitalize">
            {{ side }}
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Move Goal</DrawerTitle>
            <DrawerDescription>Set your daily activity goal.</DrawerDescription>
          </DrawerHeader>
          <div class="flex-1 p-4">
            <div class="bg-muted group-data-[swipe-axis=x]/drawer-popup:size-full group-data-[swipe-axis=y]/drawer-popup:h-80 group-data-[swipe-axis=y]/drawer-popup:w-full" />
          </div>
          <DrawerFooter>
            <Button>Submit</Button>
            <DrawerClose as-child>
              <Button variant="outline">
                Cancel
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  </Example>
</template>
