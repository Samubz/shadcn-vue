import type { Registry } from "shadcn-vue/schema"

export const lib: Registry["items"] = [
  {
    name: "utils",
    type: "registry:lib",
    dependencies: ["cn"],
    files: [
      {
        path: "lib/utils.ts",
        type: "registry:lib",
      },
    ],
  },
  {
    name: "oklch",
    type: "registry:lib",
    files: [
      {
        path: "lib/oklch.ts",
        type: "registry:lib",
      },
    ],
  },
]
