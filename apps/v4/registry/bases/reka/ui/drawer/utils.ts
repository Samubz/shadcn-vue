import type { Ref } from "vue"
import { createContext } from "reka-ui"

export const [injectDrawerContext, provideDrawerContext] = createContext<{
  showSwipeHandle: Ref<boolean>
}>("Drawer")
