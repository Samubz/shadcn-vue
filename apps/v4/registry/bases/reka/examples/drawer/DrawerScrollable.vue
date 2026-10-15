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
import { DRAWER_SIDES, PARAGRAPHS } from "./data"
</script>

<template>
  <Example title="Scrollable Content">
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
          <div class="scroll-fade flex-1 overflow-y-auto p-4">
            <p
              v-for="index in 20"
              :key="index"
              class="style-lyra:mb-2 style-lyra:leading-relaxed mb-4 leading-normal"
            >
              {{ PARAGRAPHS[(index - 1) % PARAGRAPHS.length] }}
            </p>
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
