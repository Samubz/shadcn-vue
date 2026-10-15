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
  <Example title="Nested">
    <div class="flex flex-wrap gap-2">
      <Drawer
        v-for="side in DRAWER_SIDES"
        :key="side"
        :swipe-direction="side"
        show-swipe-handle
      >
        <DrawerTrigger as-child>
          <Button variant="outline" class="capitalize">
            {{ side }}
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle class="capitalize">
              {{ side }} drawer
            </DrawerTitle>
            <DrawerDescription>
              Open another drawer from the same direction.
            </DrawerDescription>
          </DrawerHeader>
          <div class="flex-1 p-4">
            <div class="bg-muted group-data-[swipe-axis=x]/drawer-popup:size-full group-data-[swipe-axis=y]/drawer-popup:h-80 group-data-[swipe-axis=y]/drawer-popup:w-full" />
          </div>
          <DrawerFooter>
            <Drawer :swipe-direction="side">
              <DrawerTrigger as-child>
                <Button>Open nested drawer</Button>
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>Nested drawer</DrawerTitle>
                  <DrawerDescription>
                    The parent drawer stays mounted behind this one.
                  </DrawerDescription>
                </DrawerHeader>
                <div class="flex-1 p-4">
                  <div class="bg-muted group-data-[swipe-axis=x]/drawer-popup:size-full group-data-[swipe-axis=y]/drawer-popup:h-80 group-data-[swipe-axis=y]/drawer-popup:w-full" />
                </div>
                <DrawerFooter>
                  <Drawer :swipe-direction="side">
                    <DrawerTrigger as-child>
                      <Button>Open third drawer</Button>
                    </DrawerTrigger>
                    <DrawerContent>
                      <DrawerHeader>
                        <DrawerTitle>Third drawer</DrawerTitle>
                        <DrawerDescription>
                          This is the frontmost drawer in the stack.
                        </DrawerDescription>
                      </DrawerHeader>
                      <div class="flex-1 p-4">
                        <div class="bg-muted group-data-[swipe-axis=x]/drawer-popup:size-full group-data-[swipe-axis=y]/drawer-popup:h-80 group-data-[swipe-axis=y]/drawer-popup:w-full" />
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
                  <DrawerClose as-child>
                    <Button variant="outline">
                      Close
                    </Button>
                  </DrawerClose>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
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
