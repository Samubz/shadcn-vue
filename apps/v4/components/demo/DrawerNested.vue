<script setup lang="ts">
import { useMediaQuery } from '@vueuse/core'
import { computed } from 'vue'
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

const isMobile = useMediaQuery('(max-width: 767px)')
const swipeDirection = computed(() => (isMobile.value ? 'down' : 'right'))
</script>

<template>
  <Drawer :show-swipe-handle="isMobile" :swipe-direction="swipeDirection">
    <DrawerTrigger as-child>
      <Button variant="secondary">
        Open Drawer
      </Button>
    </DrawerTrigger>
    <DrawerContent>
      <DrawerHeader>
        <DrawerTitle>Drawer</DrawerTitle>
        <DrawerDescription>
          Open another drawer from the same direction.
        </DrawerDescription>
      </DrawerHeader>
      <div class="flex-1 p-4">
        <div class="bg-muted group-data-[swipe-axis=x]/drawer-popup:size-full group-data-[swipe-axis=y]/drawer-popup:aspect-video group-data-[swipe-axis=y]/drawer-popup:w-full" />
      </div>
      <DrawerFooter>
        <Drawer :show-swipe-handle="isMobile" :swipe-direction="swipeDirection">
          <DrawerTrigger as-child>
            <Button variant="outline">
              Open Nested Drawer
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Nested Drawer</DrawerTitle>
              <DrawerDescription>
                The parent drawer stays mounted behind this one.
              </DrawerDescription>
            </DrawerHeader>
            <div class="flex-1 p-4">
              <div class="bg-muted group-data-[swipe-axis=x]/drawer-popup:size-full group-data-[swipe-axis=y]/drawer-popup:aspect-video group-data-[swipe-axis=y]/drawer-popup:w-full" />
            </div>
            <DrawerFooter>
              <Drawer :show-swipe-handle="isMobile" :swipe-direction="swipeDirection">
                <DrawerTrigger as-child>
                  <Button variant="outline">
                    Open Third Drawer
                  </Button>
                </DrawerTrigger>
                <DrawerContent>
                  <DrawerHeader>
                    <DrawerTitle>Third Drawer</DrawerTitle>
                    <DrawerDescription>
                      Two drawers are stacked behind this one.
                    </DrawerDescription>
                  </DrawerHeader>
                  <div class="flex-1 p-4">
                    <div class="bg-muted group-data-[swipe-axis=x]/drawer-popup:size-full group-data-[swipe-axis=y]/drawer-popup:aspect-video group-data-[swipe-axis=y]/drawer-popup:w-full" />
                  </div>
                  <DrawerFooter>
                    <Drawer :show-swipe-handle="isMobile" :swipe-direction="swipeDirection">
                      <DrawerTrigger as-child>
                        <Button variant="outline">
                          Open Fourth Drawer
                        </Button>
                      </DrawerTrigger>
                      <DrawerContent>
                        <DrawerHeader>
                          <DrawerTitle>Fourth Drawer</DrawerTitle>
                          <DrawerDescription>
                            This is the frontmost drawer in the stack.
                          </DrawerDescription>
                        </DrawerHeader>
                        <div class="flex-1 p-4">
                          <div class="bg-muted group-data-[swipe-axis=x]/drawer-popup:size-full group-data-[swipe-axis=y]/drawer-popup:aspect-video group-data-[swipe-axis=y]/drawer-popup:w-full" />
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
        <DrawerClose as-child>
          <Button variant="outline">
            Close
          </Button>
        </DrawerClose>
      </DrawerFooter>
    </DrawerContent>
  </Drawer>
</template>
