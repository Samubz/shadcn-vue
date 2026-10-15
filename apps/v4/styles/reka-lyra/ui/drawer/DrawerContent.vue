<script lang="ts" setup>
import type { DrawerContentEmits, DrawerContentProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import { reactiveOmit } from '@vueuse/core'
import { cn } from 'cn'
import {
  DrawerContent,
  DrawerViewport,
  injectDrawerRootContext,
  useForwardPropsEmits,
} from 'reka-ui'
import { computed } from 'vue'
import DrawerOverlay from './DrawerOverlay.vue'
import DrawerPortal from './DrawerPortal.vue'
import DrawerSwipeHandle from './DrawerSwipeHandle.vue'
import { injectDrawerContext } from './utils'

defineOptions({
  inheritAttrs: false,
})

const props = defineProps<DrawerContentProps & { class?: HTMLAttributes['class'] }>()
const emits = defineEmits<DrawerContentEmits>()

const delegatedProps = reactiveOmit(props, 'class')

const forwarded = useForwardPropsEmits(delegatedProps, emits)

const rootContext = injectDrawerRootContext()
const drawerContext = injectDrawerContext(null)

const modal = computed(() => rootContext.modal.value)
const swipeAxis = computed(() => {
  const direction = rootContext.swipeDirection.value
  return direction === 'up' || direction === 'down' ? 'y' : 'x'
})
const hasSnapPoints = computed(() => (rootContext.snapPoints.value?.length ?? 0) > 0)
const showSwipeHandle = computed(() => drawerContext?.showSwipeHandle.value ?? false)
</script>

<template>
  <DrawerPortal>
    <DrawerOverlay
      v-if="modal === true"
      :data-snap-points="hasSnapPoints ? '' : undefined"
    />
    <DrawerViewport
      data-slot="drawer-viewport"
      :data-modal="modal"
      class="pointer-events-none fixed inset-0 z-50 select-none data-[modal=true]:data-[state=open]:pointer-events-auto"
    >
      <DrawerContent
        data-slot="drawer-popup"
        :data-swipe-axis="swipeAxis"
        :data-snap-points="hasSnapPoints ? '' : undefined"
        v-bind="{ ...$attrs, ...forwarded }"
        :class="cn(
          // Base.
          'bg-popover text-popover-foreground text-xs/relaxed data-[swipe-direction=down]:rounded-none data-[swipe-direction=down]:border-t data-[swipe-direction=left]:rounded-none data-[swipe-direction=left]:border-r data-[swipe-direction=right]:rounded-none data-[swipe-direction=right]:border-l data-[swipe-direction=up]:rounded-none data-[swipe-direction=up]:border-b group/drawer-popup pointer-events-auto fixed z-50 m-(--drawer-inset,0px) flex h-(--drawer-content-height) max-h-(--drawer-content-max-height,none) min-h-0 w-(--drawer-content-width,auto) transform-[translate3d(var(--translate-x,0px),var(--translate-y,0px),0)_scale(var(--stack-scale))] flex-col transition-[transform,height,opacity,filter] duration-450 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform outline-none select-none [interpolate-size:allow-keywords]',
          // Nested.
          'data-nested-drawer-open:overflow-hidden data-nested-drawer-open:brightness-95',
          // Bleed.
          'after:pointer-events-none after:absolute after:bg-(--drawer-bleed-background,var(--color-popover)) data-[swipe-axis=x]:after:inset-y-0 data-[swipe-axis=x]:after:w-(--bleed) data-[swipe-axis=y]:after:inset-x-0 data-[swipe-axis=y]:after:h-(--bleed) data-[swipe-direction=down]:after:top-full data-[swipe-direction=left]:after:right-full data-[swipe-direction=right]:after:left-full data-[swipe-direction=up]:after:bottom-full',
          // Sizing.
          '[--drawer-content-height:auto] data-[swipe-axis=x]:[--drawer-content-width:75%] data-[swipe-axis=y]:[--drawer-content-max-height:calc(100dvh-6rem)] data-[swipe-axis=y]:data-snap-points:[--drawer-content-height:100dvh] data-[swipe-axis=x]:sm:[--drawer-content-width:24rem]',
          // Stack.
          '[--bleed:3rem] [--peek:1rem] [--stack-height:var(--drawer-frontmost-height,var(--drawer-height,0px))] [--stack-peek-offset:max(0px,calc((var(--nested-drawers,0)-var(--stack-progress))*var(--peek)))] [--stack-progress:clamp(0,var(--drawer-swipe-progress,0),1)] [--stack-scale-base:max(0,calc(1-(var(--nested-drawers,0)*var(--stack-step))))] [--stack-scale:clamp(0,calc(var(--stack-scale-base)+(var(--stack-step)*var(--stack-progress))),1)] [--stack-shrink:calc(1-var(--stack-scale))] [--stack-step:0.05]',
          // Transitions.
          'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-[calc(var(--drawer-swipe-strength,1)*400ms)] data-swiping:duration-0',
          // Axis: y.
          'data-[swipe-axis=y]:inset-x-0 data-[swipe-axis=y]:data-nested-drawer-open:h-(--stack-height)',
          // Axis: x.
          'data-[swipe-axis=x]:inset-y-0 data-[swipe-axis=x]:flex-row',
          // Direction: down.
          'data-[swipe-direction=down]:bottom-0 data-[swipe-direction=down]:origin-bottom data-[swipe-direction=down]:[--tw-enter-translate-y:calc(100%+var(--drawer-inset,0px)+2px)] data-[swipe-direction=down]:[--tw-exit-translate-y:calc(100%+var(--drawer-inset,0px)+2px)] data-[swipe-direction=down]:[--translate-y:calc(var(--drawer-snap-point-offset,0px)+var(--drawer-swipe-movement-y,0px)-var(--stack-peek-offset)-(var(--stack-shrink)*var(--stack-height)))]',
          // Direction: up.
          'data-[swipe-direction=up]:top-0 data-[swipe-direction=up]:origin-top data-[swipe-direction=up]:[--tw-enter-translate-y:calc(-100%-var(--drawer-inset,0px)-2px)] data-[swipe-direction=up]:[--tw-exit-translate-y:calc(-100%-var(--drawer-inset,0px)-2px)] data-[swipe-direction=up]:[--translate-y:calc(var(--drawer-snap-point-offset,0px)+var(--drawer-swipe-movement-y,0px)+var(--stack-peek-offset)+(var(--stack-shrink)*var(--stack-height)))]',
          // Direction: left.
          'data-[swipe-direction=left]:left-0 data-[swipe-direction=left]:origin-left data-[swipe-direction=left]:[--tw-enter-translate-x:calc(-100%-var(--drawer-inset,0px)-2px)] data-[swipe-direction=left]:[--tw-exit-translate-x:calc(-100%-var(--drawer-inset,0px)-2px)] data-[swipe-direction=left]:[--translate-x:calc(var(--drawer-swipe-movement-x,0px)+var(--stack-peek-offset)+(var(--stack-shrink)*100%))]',
          // Direction: right.
          'data-[swipe-direction=right]:right-0 data-[swipe-direction=right]:origin-right data-[swipe-direction=right]:[--tw-enter-translate-x:calc(100%+var(--drawer-inset,0px)+2px)] data-[swipe-direction=right]:[--tw-exit-translate-x:calc(100%+var(--drawer-inset,0px)+2px)] data-[swipe-direction=right]:[--translate-x:calc(var(--drawer-swipe-movement-x,0px)-var(--stack-peek-offset)-(var(--stack-shrink)*100%))]',
          props.class,
        )"
      >
        <DrawerSwipeHandle v-if="showSwipeHandle" />
        <div
          data-slot="drawer-content"
          class="flex min-h-0 flex-1 flex-col overflow-hidden overscroll-contain rounded-[inherit] transition-opacity duration-300 ease-[cubic-bezier(0.45,1.005,0,1.005)] select-text group-data-nested-drawer-open/drawer-popup:opacity-0 group-data-swiping/drawer-popup:select-none"
        >
          <slot />
        </div>
      </DrawerContent>
    </DrawerViewport>
  </DrawerPortal>
</template>
