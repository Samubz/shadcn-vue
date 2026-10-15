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
import { PARAGRAPHS } from "./data"

const DRAWERS = [
  {
    side: "down",
    label: "Down",
    title: "Down drawer",
    description: "Drawer with a custom height.",
    class: "data-[swipe-direction=down]:h-64",
    bodyClass: "scrollbar-thin",
  },
  {
    side: "up",
    label: "Up",
    title: "Up drawer",
    description: "Drawer with a custom height.",
    class: "data-[swipe-direction=up]:h-[50vh]",
  },
  {
    side: "left",
    label: "Left",
    title: "Left drawer",
    description: "Drawer with a custom width.",
    class: "data-[swipe-direction=left]:w-xl",
  },
  {
    side: "right",
    label: "Right",
    title: "Right drawer",
    description: "Drawer with a custom width.",
    class: "data-[swipe-direction=right]:w-xs",
  },
] as const
</script>

<template>
  <Example title="Custom Width and Height">
    <div class="flex flex-wrap gap-2">
      <Drawer
        v-for="drawer in DRAWERS"
        :key="drawer.side"
        :swipe-direction="drawer.side"
      >
        <DrawerTrigger as-child>
          <Button variant="outline">
            {{ drawer.label }}
          </Button>
        </DrawerTrigger>
        <DrawerContent :class="drawer.class">
          <DrawerHeader>
            <DrawerTitle>{{ drawer.title }}</DrawerTitle>
            <DrawerDescription>{{ drawer.description }}</DrawerDescription>
          </DrawerHeader>
          <div
            class="scroll-fade flex-1 overflow-y-auto p-4"
            :class="'bodyClass' in drawer ? drawer.bodyClass : undefined"
          >
            <p
              v-for="index in 10"
              :key="index"
              class="style-lyra:mb-2 style-lyra:leading-relaxed mb-4 leading-normal"
            >
              {{ PARAGRAPHS[(index - 1) % PARAGRAPHS.length] }}
            </p>
          </div>
          <DrawerFooter>
            <DrawerClose as-child>
              <Button variant="outline">
                Close
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  </Example>
</template>
