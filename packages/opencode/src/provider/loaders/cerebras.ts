import { createCerebras } from "@ai-sdk/cerebras"
import type { Entry } from "./types"

const entry: Entry = {
  id: "cerebras",
  async loader() {
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

export default entry
