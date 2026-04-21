import { createOpenRouter } from "@openrouter/ai-sdk-provider"
import type { Loader } from "./types"

const loader: Loader = {
  id: "openrouter",
  async load() {
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

export default loader
