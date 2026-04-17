import { createOpenRouter } from "@openrouter/ai-sdk-provider"
import type { Entry } from "./types"

const entry: Entry = {
  id: "openrouter",
  async loader() {
    return {
      autoload: false,
      options: {
        headers: {
          "HTTP-Referer": "https://opencode.ai/",
          "X-Title": "opencode",
        },
      },
    }
  },
  bundled: {
    "@openrouter/ai-sdk-provider": createOpenRouter,
  },
}

export default entry
