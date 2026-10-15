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
</script>

<template>
  <Example title="Demo">
    <div class="flex flex-wrap gap-2">
      <Drawer>
        <DrawerTrigger as-child>
          <Button variant="outline">
            Open Drawer
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerTitle class="sr-only">
            Drawer
          </DrawerTitle>
          <div class="p-4">
            <div class="bg-muted h-80 w-full" />
          </div>
        </DrawerContent>
      </Drawer>
      <Drawer>
        <DrawerTrigger as-child>
          <Button variant="outline">
            Header
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Edit profile</DrawerTitle>
            <DrawerDescription>
              Make changes to your profile here. Click save when you're done.
            </DrawerDescription>
          </DrawerHeader>
          <div class="p-4">
            <div class="bg-muted h-80 w-full" />
          </div>
        </DrawerContent>
      </Drawer>
      <Drawer>
        <DrawerTrigger as-child>
          <Button variant="outline">
            Footer
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerTitle class="sr-only">
            Drawer with footer
          </DrawerTitle>
          <div class="p-4">
            <div class="bg-muted h-80 w-full" />
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
      <Drawer>
        <DrawerTrigger as-child>
          <Button variant="outline">
            Header and Footer
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Edit profile</DrawerTitle>
            <DrawerDescription>
              Make changes to your profile here. Click save when you're done.
            </DrawerDescription>
          </DrawerHeader>
          <div class="p-4">
            <div class="bg-muted h-80 w-full" />
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
      <Drawer>
        <DrawerTrigger as-child>
          <Button variant="outline">
            Edge to Edge
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerTitle class="sr-only">
            Edge to edge drawer
          </DrawerTitle>
          <div class="h-80 w-full bg-blue-200" />
        </DrawerContent>
      </Drawer>
    </div>
  </Example>
</template>
