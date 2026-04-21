import { createOpenRouter } from "@openrouter/ai-sdk-provider"
import type { CustomLoader } from "./types"

export const bundledProviders = {
  "@openrouter/ai-sdk-provider": createOpenRouter,
}

export const loader: CustomLoader = async () => {
  return {
    autoload: false,
    options: {
      headers: {
        "HTTP-Referer": "https://opencode.ai/",
        "X-Title": "opencode",
      },
    },
  }
}
