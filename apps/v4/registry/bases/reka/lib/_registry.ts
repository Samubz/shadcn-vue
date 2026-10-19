import type { Registry } from "shadcn-vue/schema"

export const lib: Registry["items"] = [
  {
    name: "oklch",
    type: "registry:lib",
    files: [
      {
        path: "lib/oklch.ts",
        type: "registry:lib",
      },
    ],
    registryDependencies: [],
    dependencies: [],
  },
  {
    name: "utils",
    type: "registry:lib",
    files: [
      {
        path: "lib/utils.ts",
        type: "registry:lib",
      },
    ],
    registryDependencies: [],
    dependencies: [
      "cn",
    ],
  },
]
