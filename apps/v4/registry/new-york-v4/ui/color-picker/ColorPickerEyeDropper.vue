<script setup lang="ts">
import type { PrimitiveProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import type { ButtonVariants } from "@/registry/new-york-v4/ui/button"
import { PipetteIcon } from "@lucide/vue"
import { useEyeDropper, useMounted } from "@vueuse/core"
import { cn } from "cn"
import { isValidColor, parseColor } from "reka-ui"
import { Button } from "@/registry/new-york-v4/ui/button"
import { injectColorPickerContext } from "./utils"

const props = withDefaults(defineProps<PrimitiveProps & {
  variant?: ButtonVariants["variant"]
  size?: ButtonVariants["size"]
  class?: HTMLAttributes["class"]
}>(), {
  as: "button",
  variant: "ghost",
  size: "icon-sm",
})

const { setColor, disabled } = injectColorPickerContext("ColorPickerEyeDropper")

/* `useEyeDropper`'s `isSupported` is false on the server but already true in
   the first client render of a supporting browser, so rendering is also gated
   on mount: the button appears after hydration without a mismatch, and never
   in browsers without `window.EyeDropper` (Firefox, Safari). */
const { isSupported, open } = useEyeDropper()
const isMounted = useMounted()

async function pick() {
  try {
    const result = await open()
    if (result && isValidColor(result.sRGBHex))
      setColor(parseColor(result.sRGBHex))
  }
  catch (error) {
    /* Escape cancels the sampler with an AbortError; the browser can also
       refuse it (NotAllowedError). Either way the color stays as it was. */
    const name = (error as { name?: unknown } | null)?.name
    // Typed loosely: not every consumer project ships `vite/client` types.
    if (name !== "AbortError" && (import.meta as ImportMeta & { env?: { DEV?: boolean } }).env?.DEV)
      console.warn("[ColorPickerEyeDropper] The eye dropper failed.", error)
  }
}
</script>

<template>
  <Button
    v-if="isMounted && isSupported"
    data-slot="color-picker-eye-dropper"
    type="button"
    aria-label="Pick a color from the screen"
    :as="as"
    :as-child="asChild"
    :variant="variant"
    :size="size"
    :disabled="disabled"
    :class="cn('text-muted-foreground', props.class)"
    @click="pick"
  >
    <slot>
      <PipetteIcon aria-hidden="true" />
    </slot>
  </Button>
</template>
