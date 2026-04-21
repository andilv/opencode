import { createCerebras } from "@ai-sdk/cerebras"
import type { CustomLoader } from "./types"

export const bundledProviders = {
  "@ai-sdk/cerebras": createCerebras,
}

export const loader: CustomLoader = async () => {
  return {
    autoload: false,
    options: {
      headers: {
        "X-Cerebras-3rd-Party-Integration": "opencode",
      },
    },
  }
}
