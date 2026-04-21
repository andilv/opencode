import { createAnthropic } from "@ai-sdk/anthropic"
import type { Loader } from "./types"

const loader: Loader = {
  id: "anthropic",
  async load() {
    return {
      autoload: false,
      options: {
        headers: {
          "anthropic-beta":
            "claude-code-20250219,interleaved-thinking-2025-05-14,fine-grained-tool-streaming-2025-05-14",
        },
      },
    }
  },
  bundled: {
    "@ai-sdk/anthropic": createAnthropic,
  },
}

export default loader
