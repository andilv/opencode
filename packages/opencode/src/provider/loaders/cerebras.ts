import { createCerebras } from "@ai-sdk/cerebras"
import type { Loader } from "./types"

const loader: Loader = {
  id: "cerebras",
  async load() {
    return {
      autoload: false,
      options: {
        headers: {
          "X-Cerebras-3rd-Party-Integration": "opencode",
        },
      },
    }
  },
  bundled: {
    "@ai-sdk/cerebras": createCerebras,
  },
}

export default loader
