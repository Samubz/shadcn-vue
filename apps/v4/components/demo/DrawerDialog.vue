<script setup lang="ts">
import { useMediaQuery } from '@vueuse/core'
import { ref } from 'vue'
import { Button } from '@/registry/new-york-v4/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/registry/new-york-v4/ui/dialog'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/registry/new-york-v4/ui/drawer'
import { Input } from '@/registry/new-york-v4/ui/input'
import { Label } from '@/registry/new-york-v4/ui/label'

const open = ref(false)
const isDesktop = useMediaQuery('(min-width: 768px)')
</script>

<template>
  <Dialog v-if="isDesktop" v-model:open="open">
    <DialogTrigger as-child>
      <Button variant="outline">
        Edit Profile
      </Button>
    </DialogTrigger>
    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Edit profile</DialogTitle>
        <DialogDescription>
          Make changes to your profile here. Click save when you're done.
        </DialogDescription>
      </DialogHeader>
      <form class="grid items-start gap-6">
        <div class="grid gap-3">
          <Label for="email">Email</Label>
          <Input id="email" type="email" default-value="shadcn@example.com" />
        </div>
        <div class="grid gap-3">
          <Label for="username">Username</Label>
          <Input id="username" default-value="@shadcn" />
        </div>
        <Button type="submit">
          Save changes
        </Button>
      </form>
    </DialogContent>
  </Dialog>
  <Drawer v-else v-model:open="open">
    <DrawerTrigger as-child>
      <Button variant="outline">
        Edit Profile
      </Button>
    </DrawerTrigger>
    <DrawerContent>
      <DrawerHeader class="text-left">
        <DrawerTitle>Edit profile</DrawerTitle>
        <DrawerDescription>
          Make changes to your profile here. Click save when you're done.
        </DrawerDescription>
      </DrawerHeader>
      <form class="grid items-start gap-6 p-4">
        <div class="grid gap-3">
          <Label for="email">Email</Label>
          <Input id="email" type="email" default-value="shadcn@example.com" />
        </div>
        <div class="grid gap-3">
          <Label for="username">Username</Label>
          <Input id="username" default-value="@shadcn" />
        </div>
        <Button type="submit">
          Save changes
        </Button>
      </form>
    </DrawerContent>
  </Drawer>
</template>
